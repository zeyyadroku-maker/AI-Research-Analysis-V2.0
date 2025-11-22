import { NextRequest, NextResponse } from 'next/server'
import { Paper } from '@/app/types'
import { fetchDocumentSafe } from '@/app/lib/documentFetcher'
import { processPdfDocument, processTextDocument } from '@/app/lib/documentProcessor'
import { classifyDocumentType, classifyAcademicField, getFrameworkGuidelines } from '@/app/lib/adaptiveFramework'
import { buildFrameworkV2Prompt } from '@/app/lib/frameworkPromptBuilder'
import { callClaudeAPI } from '@/app/lib/services/analysisService'

export async function POST(request: NextRequest) {
  try {
    const { paper, fullText } = await request.json() as { paper: Paper; fullText: string }

    if (!paper) {
      return NextResponse.json(
        { error: 'Paper is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.CLAUDE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    console.log(`Analyzing paper: ${paper.title}`)

    let analysisText = fullText || paper.abstract || ''

    // Try to fetch full document if not provided
    if (!analysisText && (paper.doi || paper.url || paper.openAlexId)) {
      console.log('Attempting to fetch full document...')
      const doc = await fetchDocumentSafe(paper.id, {
        doi: paper.doi,
        url: paper.url,
        openAlexId: paper.openAlexId,
        abstract: paper.abstract,
      })

      if (doc) {
        console.log(`Successfully fetched document (${doc.size} bytes) from ${doc.source.type}`)
        try {
          // Try to process as PDF
          if (doc.source.type === 'arxiv' || doc.mimeType.includes('pdf')) {
            const processed = await processPdfDocument({
              title: paper.title,
              authors: paper.authors,
              abstract: paper.abstract,
            })
            analysisText = processed.fullText
          } else {
            // Process as text
            const processed = await processTextDocument(doc.content.toString('utf-8'), {
              title: paper.title,
              authors: paper.authors,
              abstract: paper.abstract,
            })
            analysisText = processed.fullText
          }
        } catch (processingError) {
          console.error('Error processing document:', processingError)
          // Fall back to abstract
          analysisText = paper.abstract || fullText || 'Document could not be processed'
        }
      } else {
        console.log('Could not fetch full document, using abstract')
        analysisText = paper.abstract || fullText || ''
      }
    }

    // Classify document type and field
    const documentType = classifyDocumentType(analysisText, paper.title)
    const field = classifyAcademicField(analysisText, paper.title)
    const framework = getFrameworkGuidelines(documentType, field)

    console.log(`Document classified as: ${documentType} in ${field}`)
    console.log(`Framework v2.0: Using comprehensive assessment prompt`)

    // Build Framework v2.0 comprehensive prompt
    const prompt = buildFrameworkV2Prompt({
      documentTitle: paper.title,
      documentType,
      field,
      framework,
      fullText: analysisText,
      abstract: paper.abstract || '',
    })

    console.log(`Prompt length: ${prompt.length} characters`)

    // Call Claude API via service with streaming enabled
    let streamResponse
    try {
      streamResponse = await callClaudeAPI(prompt, apiKey, true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error calling Claude API'
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

    // Create a stream to parse SSE events and yield text deltas
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        // Send metadata as the first chunk
        const metadata = {
          type: 'metadata',
          data: {
            documentType,
            field,
            framework
          }
        }
        controller.enqueue(encoder.encode(JSON.stringify(metadata) + '\n'))

        const reader = (streamResponse.body as any).getReader()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            buffer += chunk

            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                    controller.enqueue(encoder.encode(parsed.delta.text))
                  }
                } catch (e) {
                  // Ignore parse errors for partial lines
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream reading error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      }
    })

    // Return the stream
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Analysis error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to analyze paper: ${errorMessage}` },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { Paper } from '@/app/types'
import { fetchDocumentSafe } from '@/app/lib/documentFetcher'
import { performUnifiedAnalysis } from '@/app/lib/analysis/unifiedController'
import { getFrameworkGuidelines, classifyDocumentType, classifyAcademicField } from '@/app/lib/adaptiveFramework'

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

    let content: Buffer | string = fullText || paper.abstract || ''
    let mimeType = 'text/plain'

    // Try to fetch full document if not provided
    if (!fullText && (paper.doi || paper.url || paper.openAlexId)) {
      console.log('Attempting to fetch full document...')
      const doc = await fetchDocumentSafe(paper.id, {
        doi: paper.doi,
        url: paper.url,
        openAlexId: paper.openAlexId,
        abstract: paper.abstract,
      })

      if (doc) {
        console.log(`Successfully fetched document (${doc.size} bytes) from ${doc.source.type}`)
        content = doc.content
        mimeType = doc.mimeType

        // Special handling for arXiv which is often PDF
        if (doc.source.type === 'arxiv') {
          mimeType = 'application/pdf'
        }
      } else {
        console.log('Could not fetch full document, using abstract')
      }
    }

    // Check for cached analysis in Supabase
    // We use the anon client here which is fine since our RLS allows public read
    const { supabase } = await import('@/app/lib/supabase')

    // Check if any bookmark exists for this paper ID
    // We use limit(1) to get just one result if multiple people bookmarked it
    // IMPORTANT: Skip cache for file uploads (IDs starting with 'file-') to ensure privacy
    // and prevent sharing of analysis for user-uploaded documents.
    let cachedBookmark = null

    if (!paper.id.startsWith('file-')) {
      const { data } = await supabase
        .from('bookmarks')
        .select('analysis_data')
        .eq('paper_id', paper.id)
        .limit(1)
        .single()
      cachedBookmark = data
    }

    if (cachedBookmark && cachedBookmark.analysis_data) {
      console.log(`[Cache Hit] Found existing analysis for: ${paper.title}`)
      const cachedAnalysis = cachedBookmark.analysis_data

      // Create a stream that mimics the unified controller output
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          // 1. Send metadata
          // IMPORTANT: Re-classify using current logic to ensure consistency
          // Don't trust the cached classification as it may be from old logic
          const docType = classifyDocumentType(paper.abstract || '', paper.title)
          const field = classifyAcademicField(paper.abstract || '', paper.title)

          const framework = getFrameworkGuidelines(docType, field)

          const metadata = {
            type: 'metadata',
            data: {
              documentType: docType,
              field: field,
              framework: framework
            }
          }
          controller.enqueue(encoder.encode(JSON.stringify(metadata) + '\n'))

          // 2. Send the full analysis JSON
          // We send it as a single chunk since it's already complete
          // IMPORTANT: Append \n so the client side buffer logic (split by newline) processes it immediately
          controller.enqueue(encoder.encode(JSON.stringify(cachedAnalysis) + '\n'))

          controller.close()
        }
      })

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      })
    }

    // Use unified controller
    const stream = await performUnifiedAnalysis(paper, content, mimeType, apiKey)

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

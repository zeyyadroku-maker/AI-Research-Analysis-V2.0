import { NextRequest, NextResponse } from 'next/server'
import { Paper } from '@/app/types'
import { fetchDocumentSafe } from '@/app/lib/documentFetcher'
import { performUnifiedAnalysis } from '@/app/lib/analysis/unifiedController'

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

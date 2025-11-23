import { NextRequest, NextResponse } from 'next/server'
import { Paper } from '@/app/types'
import { performUnifiedAnalysis } from '@/app/lib/analysis/unifiedController'

// Generate a simple hash for file-based ID
function generateFileId(fileName: string): string {
  let hash = 0
  for (let i = 0; i < fileName.length; i++) {
    const char = fileName.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `file-${Math.abs(hash).toString(36)}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log(`Processing uploaded file: ${file.name} (${file.size} bytes)`)

    const apiKey = process.env.CLAUDE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Create a Paper object from the file
    const fileName = file.name.replace(/\.[^/.]+$/, '')
    const paper: Paper = {
      id: generateFileId(file.name),
      title: fileName,
      authors: ['Uploaded Document'],
      abstract: 'Document analysis in progress...',
      year: new Date().getFullYear(),
      documentType: 'unknown',
      field: 'interdisciplinary',
    }

    console.log(`Analyzing uploaded document: ${paper.title}`)

    // Use unified controller
    // Pass buffer directly - controller handles base64 conversion if needed
    const stream = await performUnifiedAnalysis(paper, buffer, file.type || 'application/octet-stream', apiKey)

    // Return the stream
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : 'No stack trace'
    console.error(`[Upload FAILED] Error: ${errorMessage}`)
    console.error(`[Upload FAILED] Stack: ${stack}`)
    return NextResponse.json(
      { error: `Failed to process upload: ${errorMessage}` },
      { status: 500 }
    )
  }
}

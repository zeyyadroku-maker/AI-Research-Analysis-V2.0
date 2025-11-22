import { NextRequest, NextResponse } from 'next/server'
import { Paper, AnalysisResult, ConfidenceLevel } from '@/app/types'
import { classifyDocumentType, classifyAcademicField, getFrameworkGuidelines } from '@/app/lib/adaptiveFramework'
import { buildAssessmentPrompt, buildAbstractOnlyPrompt } from '@/app/lib/promptBuilder'
import JSZip from 'jszip'

// Text extraction from buffer supporting multiple formats
async function extractTextFromBuffer(buffer: Buffer, mimeType: string, fileName: string): Promise<string> {
  console.log(`[Extract START] File: ${fileName}, MIME: ${mimeType}, Size: ${buffer.length} bytes`)

  try {
    // Plain text file
    if (mimeType.includes('text') || fileName.endsWith('.txt')) {
      const text = buffer.toString('utf-8')
      console.log(`[Extract SUCCESS] TXT: Extracted ${text.length} characters`)
      return text
    }

    // PDF extraction
    if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) {
      try {
        console.log(`[Extract PDF] Attempting to extract with pdf-parse...`)
        // eslint-disable-next-line global-require,import/no-dynamic-require
        let pdfParse = require('pdf-parse')
        // Handle different module export formats
        if (typeof pdfParse !== 'function' && pdfParse.default && typeof pdfParse.default === 'function') {
          pdfParse = pdfParse.default
        }
        // As a last resort, try the module as-is (might be a class)
        console.log(`[Extract PDF] Module loaded, typeof: ${typeof pdfParse}`)
        if (typeof pdfParse !== 'function') {
          throw new Error(`pdf-parse is not callable: received ${typeof pdfParse}`)
        }
        const pdfData = await pdfParse(buffer)
        const extractedText = pdfData.text || ''
        const numPages = pdfData.numpages || 0
        const fileSizeKb = (buffer.length / 1024).toFixed(2)
        const textToSizeRatio = buffer.length > 0 ? ((extractedText.length / buffer.length) * 100).toFixed(2) : '0'

        // Log diagnostic metrics for quality assessment
        console.log(`[Extract SUCCESS] PDF: Extracted ${extractedText.length} chars from ${numPages} pages (file: ${fileSizeKb}KB, ratio: ${textToSizeRatio}%)`)

        // Log additional diagnostic info if text extraction seems low
        if (extractedText.length < 500) {
          console.warn(`[Extract DIAGNOSTIC] PDF: Very low text extraction (${extractedText.length} chars). Possible causes: scan-based PDF, image-heavy content, OCR required`)
        } else if (parseFloat(textToSizeRatio) < 10) {
          console.warn(`[Extract DIAGNOSTIC] PDF: Low text-to-size ratio (${textToSizeRatio}%). File may contain images, diagrams, or schemas not extracted by text parser`)
        }

        return extractedText
      } catch (pdfError) {
        const errorMsg = pdfError instanceof Error ? pdfError.message : String(pdfError)
        console.error(`[Extract FAILED] PDF: ${errorMsg}`)
        return ''
      }
    }

    // DOCX extraction
    if (mimeType.includes('wordprocessingml') || mimeType.includes('ms-word') || fileName.endsWith('.docx')) {
      try {
        console.log(`[Extract DOCX] Attempting to extract from ZIP structure...`)
        // DOCX is a ZIP file containing XML - use jszip to extract text
        const zip = new JSZip()
        await zip.loadAsync(buffer)

        // Extract text from document.xml
        const docXml = await zip.file('word/document.xml')?.async('string')
        if (docXml) {
          console.log(`[Extract DOCX] Found document.xml (${docXml.length} bytes), parsing XML...`)
          // Remove XML tags to get plain text
          const plainText = docXml
            .replace(/<[^>]*>/g, ' ') // Remove XML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ') // Collapse whitespace
            .trim()

          console.log(`[Extract SUCCESS] DOCX: Extracted ${plainText.length} characters from document`)
          return plainText
        }
        console.error(`[Extract FAILED] DOCX: document.xml not found in ZIP`)
        return ''
      } catch (docxError) {
        const errorMsg = docxError instanceof Error ? docxError.message : String(docxError)
        console.error(`[Extract FAILED] DOCX: ${errorMsg}`)
        return ''
      }
    }

    // Unsupported format
    console.warn(`[Extract FAILED] Unsupported format - MIME: ${mimeType}, filename: ${fileName}`)
    return ''
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error(`[Extract FAILED] Unexpected error: ${errorMsg}`)
    return ''
  }
}

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

    // Extract text from file
    const buffer = Buffer.from(await file.arrayBuffer())
    let fileText = await extractTextFromBuffer(buffer, file.type, file.name)

    // If no text extracted, at least use the filename
    if (!fileText) {
      fileText = file.name.replace(/\.[^/.]+$/, '')
      console.warn(`[Fallback] Text extraction failed, using filename only: "${fileText}" (${fileText.length} chars)`)
    } else {
      console.log(`[Extraction Complete] Total extracted: ${fileText.length} characters`)
    }

    // Create a Paper object from the file
    const fileName = file.name.replace(/\.[^/.]+$/, '')
    const paper: Paper = {
      id: generateFileId(file.name),
      title: fileName,
      authors: ['Uploaded Document'],
      abstract: fileText.substring(0, 1000),
      year: new Date().getFullYear(),
      documentType: 'unknown',
      field: 'interdisciplinary',
    }

    const apiKey = process.env.CLAUDE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    console.log(`Analyzing uploaded document: ${paper.title}`)

    // Classify document type and field
    const documentType = classifyDocumentType(fileText, paper.title)
    const field = classifyAcademicField(fileText, paper.title)
    const framework = getFrameworkGuidelines(documentType, field)

    console.log(`Document classified as: ${documentType} in ${field}`)

    // Build adaptive prompt
    let prompt: string
    const textLength = fileText.length
    if (textLength > 1000) {
      console.log(`[Prompt Selection] FULL ASSESSMENT: Text length ${textLength} > 1000 threshold`)
      prompt = buildAssessmentPrompt({
        documentTitle: paper.title,
        documentType,
        field,
        framework,
        chunks: [],
        fullText: fileText,
        abstract: paper.abstract,
      })
    } else {
      console.log(`[Prompt Selection] ABSTRACT-ONLY: Text length ${textLength} ≤ 1000 threshold`)
      prompt = buildAbstractOnlyPrompt(paper.title, fileText, documentType, field)
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 4000,
        temperature: 0,
        system:
          'You are an expert research analyst specializing in adaptive assessment frameworks. Analyze research documents and return valid JSON responses only. Do not include any text before or after the JSON.',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error status:', response.status)
      console.error('Claude API error response:', errorText)

      let errorDetails = { message: 'Unknown error' }
      try {
        errorDetails = JSON.parse(errorText)
      } catch (e) {
        errorDetails = { message: errorText }
      }

      return NextResponse.json(
        {
          error: `Claude API error: ${response.statusText}`,
          details: errorDetails,
          statusCode: response.status,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    const responseText = data.content[0].text

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Could not extract JSON from response:', responseText)
      return NextResponse.json(
        { error: 'Failed to parse analysis response' },
        { status: 500 }
      )
    }

    const analysisData = JSON.parse(jsonMatch[0])

    // Validate that credibility data exists
    if (!analysisData.credibility) {
      console.error('Missing credibility data in analysis response:', analysisData)
      return NextResponse.json(
        { error: 'Invalid analysis response: missing credibility assessment' },
        { status: 500 }
      )
    }

    // Validate and cap credibility score
    const maxWeight = (
      framework.weights.methodologicalRigor +
      framework.weights.dataTransparency +
      framework.weights.sourceQuality +
      framework.weights.authorCredibility +
      framework.weights.statisticalValidity +
      framework.weights.logicalConsistency
    )

    const credibilityScore = analysisData.credibility
    if (!credibilityScore.totalScore && credibilityScore.totalScore !== 0) {
      console.error('Missing totalScore in credibility data:', credibilityScore)
      return NextResponse.json(
        { error: 'Invalid analysis response: missing credibility totalScore' },
        { status: 500 }
      )
    }

    if (credibilityScore.totalScore > maxWeight) {
      console.warn(
        `[Score Validation] Credibility score ${credibilityScore.totalScore.toFixed(2)} exceeds maximum weight ${maxWeight.toFixed(2)}. Capping to maximum.`
      )
      credibilityScore.totalScore = Math.min(credibilityScore.totalScore, maxWeight)

      // Recalculate rating based on capped score
      if (credibilityScore.totalScore >= maxWeight * 0.9) {
        credibilityScore.rating = 'Exemplary'
      } else if (credibilityScore.totalScore >= maxWeight * 0.75) {
        credibilityScore.rating = 'Strong'
      } else if (credibilityScore.totalScore >= maxWeight * 0.5) {
        credibilityScore.rating = 'Moderate'
      } else if (credibilityScore.totalScore >= maxWeight * 0.25) {
        credibilityScore.rating = 'Weak'
      } else if (credibilityScore.totalScore > 0) {
        credibilityScore.rating = 'Very Poor'
      } else {
        credibilityScore.rating = 'Invalid'
      }
    }

    const result: AnalysisResult = {
      paper: {
        ...paper,
        documentType,
        field,
      },
      classification: analysisData.classification || {
        documentType,
        field,
        confidence: 'MEDIUM' as ConfidenceLevel,
      },
      credibility: credibilityScore,
      bias: analysisData.bias,
      keyFindings: analysisData.keyFindings,
      perspective: analysisData.perspective,
      redFlags: analysisData.redFlags || [],
      aiLimitations: analysisData.aiLimitations || {
        cannotAssess: [],
        uncertainAreas: [],
        requiredExpertise: [],
        missingInformation: [],
        confidenceNote: 'Framework v2.0 analysis completed',
      },
      humanReview: analysisData.humanReview || {
        priority: 'STANDARD',
        reasons: [],
        specificAreas: [],
        expertiseRequired: [],
      },
      limitations: analysisData.limitations || {
        unverifiableClaims: [],
        dataLimitations: [],
        uncertainties: [],
        aiConfidenceNote: 'Analysis completed with available information',
      },
      timestamp: new Date().toISOString(),
    }

    console.log(`[Analysis Complete] Document: ${paper.title}, Credibility Score: ${credibilityScore.totalScore}/${credibilityScore.totalMaxScore}`)
    return NextResponse.json(result)
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

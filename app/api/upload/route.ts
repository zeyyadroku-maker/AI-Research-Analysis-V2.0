import { NextRequest, NextResponse } from 'next/server'
import { Paper, AnalysisResult, ConfidenceLevel } from '@/app/types'
import { classifyDocumentType, classifyAcademicField, getFrameworkGuidelines } from '@/app/lib/adaptiveFramework'
import { buildAssessmentPrompt, buildAbstractOnlyPrompt } from '@/app/lib/promptBuilder'
import { extractPdfText } from '@/app/lib/documentProcessor'
import { callClaudeAPI } from '@/app/lib/services/analysisService'
import { processCredibilityScore } from '@/app/lib/utils/analysisUtils'
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
        console.log(`[Extract PDF] Attempting to extract with documentProcessor...`)
        const { text, pageCount } = await extractPdfText(buffer)

        const extractedText = text || ''
        const fileSizeKb = (buffer.length / 1024).toFixed(2)
        const textToSizeRatio = buffer.length > 0 ? ((extractedText.length / buffer.length) * 100).toFixed(2) : '0'

        // Log diagnostic metrics for quality assessment
        console.log(`[Extract SUCCESS] PDF: Extracted ${extractedText.length} chars from ${pageCount} pages (file: ${fileSizeKb}KB, ratio: ${textToSizeRatio}%)`)

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

    // Prepare PDF base64 if available
    let pdfBase64: string | undefined
    if (file.type.includes('pdf') || file.name.endsWith('.pdf')) {
      pdfBase64 = buffer.toString('base64')
      console.log('[Upload] PDF detected, preparing for native analysis')
    }

    if (pdfBase64) {
      console.log(`[Prompt Selection] NATIVE PDF ANALYSIS`)
      // For native PDF, we use the assessment prompt but with a placeholder for text
      // The PDF is passed as a separate block to Claude
      prompt = buildAssessmentPrompt({
        documentTitle: paper.title,
        documentType,
        field,
        framework,
        chunks: [],
        fullText: "Please analyze the attached PDF document.",
        abstract: paper.abstract,
      })
    } else if (textLength > 1000) {
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
    let analysisData
    try {
      // Use callClaudeAPI service which handles model selection and PDF support
      // We pass false for stream to get the full JSON response
      analysisData = await callClaudeAPI(prompt, apiKey, false, pdfBase64)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Claude API error:', errorMessage)
      return NextResponse.json(
        { error: `Claude API error: ${errorMessage}` },
        { status: 500 }
      )
    }

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

    // Use shared utility to process score consistent with frontend
    const credibilityScore = processCredibilityScore(analysisData.credibility, maxWeight)

    const result: AnalysisResult = {
      paper: {
        ...paper,
        documentType,
        field,
      },
      analysisDepth: (pdfBase64 || fileText.length > 1000) ? 'Full Text' : 'Abstract',
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

    console.log(`[Analysis Complete] Document: ${paper.title}, Credibility Score: ${credibilityScore.totalScore}/${credibilityScore.maxTotalScore}`)
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

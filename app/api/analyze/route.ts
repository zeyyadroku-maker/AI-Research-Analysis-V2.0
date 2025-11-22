import { NextRequest, NextResponse } from 'next/server'
import { AnalysisResult, Paper, ConfidenceLevel } from '@/app/types'
import { fetchDocumentSafe } from '@/app/lib/documentFetcher'
import { processPdfDocument, processTextDocument } from '@/app/lib/documentProcessor'
import { classifyDocumentType, classifyAcademicField, getFrameworkGuidelines } from '@/app/lib/adaptiveFramework'
import { buildFrameworkV2Prompt } from '@/app/lib/frameworkPromptBuilder'
import { callClaudeAPI } from '@/app/lib/services/analysisService'
import { processCredibilityScore } from '@/app/lib/utils/analysisUtils'

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

    // Call Claude API via service
    let analysisData
    try {
      analysisData = await callClaudeAPI(prompt, apiKey)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error calling Claude API'
      return NextResponse.json(
        { error: errorMessage },
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

    // Calculate max weight for validation
    const maxWeight = (
      framework.weights.methodologicalRigor +
      framework.weights.dataTransparency +
      framework.weights.sourceQuality +
      framework.weights.authorCredibility +
      framework.weights.statisticalValidity +
      framework.weights.logicalConsistency
    )

    // Process and validate credibility score
    const credibilityScore = processCredibilityScore(analysisData.credibility, maxWeight)

    // Framework v2.0: Build result with new components
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
      // Framework v2.0: New transparency components
      redFlags: analysisData.redFlags || [],
      aiLimitations: analysisData.aiLimitations || {
        cannotAssess: [],
        uncertainAreas: [],
        requiredExpertise: [],
        missingInformation: [],
        confidenceNote: 'Framework v2.0 analysis completed',
        uncertaintyAreas: [] // Added to match interface
      },
      humanReview: analysisData.humanReview || {
        priority: 'STANDARD',
        reason: 'Standard peer review recommended', // Changed from reasons to reason
        suggestedExperts: [],
        reasons: [], // Added to match interface
        specificAreas: [], // Added to match interface
        expertiseRequired: [] // Added to match interface
      },
      limitations: analysisData.limitations || {
        unverifiableClaims: [],
        dataLimitations: [],
        uncertainties: [],
        aiConfidenceNote: 'Analysis completed with available information',
      },
      timestamp: new Date().toISOString(),
    }

    // Log Framework v2.0 metrics
    console.log(`Framework v2.0 Analysis Complete:`)
    console.log(`- Overall Confidence: ${credibilityScore.overallConfidence}`)
    console.log(`- Red Flags: ${result.redFlags ? result.redFlags.length : 0}`)
    console.log(`- Human Review Priority: ${result.humanReview.priority}`)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analysis error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to analyze paper: ${errorMessage}` },
      { status: 500 }
    )
  }
}

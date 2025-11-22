import { NextRequest, NextResponse } from 'next/server'
import { AnalysisResult, Paper, ConfidenceLevel } from '@/app/types'
import { fetchDocumentSafe } from '@/app/lib/documentFetcher'
import { processPdfDocument, processTextDocument } from '@/app/lib/documentProcessor'
import { classifyDocumentType, classifyAcademicField, getFrameworkGuidelines } from '@/app/lib/adaptiveFramework'
import { buildFrameworkV2Prompt } from '@/app/lib/frameworkPromptBuilder'

// Helper to ensure confidence is a valid ConfidenceLevel
const parseConfidence = (conf: any): ConfidenceLevel => {
  if (typeof conf === 'string') {
    const upper = conf.toUpperCase()
    if (['HIGH', 'MEDIUM', 'LOW', 'UNCERTAIN'].includes(upper)) {
      return upper as ConfidenceLevel
    }
  }
  // Legacy support for 0-100 numbers
  if (typeof conf === 'number') {
    if (conf >= 85) return 'HIGH'
    if (conf >= 60) return 'MEDIUM'
    if (conf >= 40) return 'LOW'
    return 'UNCERTAIN'
  }
  return 'MEDIUM' // Default
}

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

    // Call Claude API
    // Model fallback strategy
    const models = [
      { id: 'claude-3-5-sonnet-20240620', maxTokens: 8000 },
      { id: 'claude-3-opus-20240229', maxTokens: 4000 },
      { id: 'claude-3-sonnet-20240229', maxTokens: 4000 },
      { id: 'claude-3-haiku-20240307', maxTokens: 4000 },
    ]

    let response


    for (const modelConfig of models) {
      console.log(`Attempting analysis with model: ${modelConfig.id}`)
      try {
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelConfig.id,
            max_tokens: modelConfig.maxTokens,
            temperature: 0,
            system:
              'You are implementing the Syllogos Research Evaluation Framework v2.0. You are an expert research analyst with deep understanding of academic rigor, bias detection, and honest uncertainty acknowledgment. Your role is to assist researchers, never replace expert judgment. Return ONLY valid JSON with complete transparency about what you can and cannot assess.',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          }),
        })

        if (response.ok) {

          break
        }

        if (response.status === 404) {
          console.warn(`Model ${modelConfig.id} not found (404), trying next model...`)
          continue
        }

        // If other error, stop trying
        break
      } catch (error) {
        console.error(`Error calling model ${modelConfig.id}:`, error)
        // If network error, maybe retry? But for now continue to next model if possible or just fail
        if (models.indexOf(modelConfig) === models.length - 1) throw error
      }
    }

    if (!response || !response.ok) {
      const errorText = response ? await response.text() : 'No response'
      console.error('Claude API error status:', response?.status)
      console.error('Claude API error response:', errorText)

      let errorDetails = { message: 'Unknown error' }
      try {
        errorDetails = JSON.parse(errorText)
      } catch (e) {
        errorDetails = { message: errorText }
      }

      return NextResponse.json(
        {
          error: `Claude API error: ${response ? response.statusText : 'No response'}`,
          details: errorDetails,
          statusCode: response ? response.status : 500,
        },
        { status: response ? response.status : 500 }
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

    // Validate and cap credibility score to prevent exceeding assessment weight maximum
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

    // Cap score to max weight if needed
    if (credibilityScore.totalScore > maxWeight) {
      console.warn(
        `[Score Validation] Credibility score ${credibilityScore.totalScore.toFixed(2)} exceeds maximum weight ${maxWeight.toFixed(2)}. Capping to maximum.`
      )
      credibilityScore.totalScore = Math.min(credibilityScore.totalScore, maxWeight)
    }

    // Add maxTotalScore to credibility object
    credibilityScore.maxTotalScore = maxWeight

    // Ensure confidence levels are valid strings
    credibilityScore.overallConfidence = parseConfidence(credibilityScore.overallConfidence)

    // Helper to sanitize component confidence
    const sanitizeComponent = (comp: any) => {
      if (!comp) return comp
      comp.confidence = parseConfidence(comp.confidence)
      return comp
    }

    credibilityScore.methodologicalRigor = sanitizeComponent(credibilityScore.methodologicalRigor)
    credibilityScore.dataTransparency = sanitizeComponent(credibilityScore.dataTransparency)
    credibilityScore.sourceQuality = sanitizeComponent(credibilityScore.sourceQuality)
    credibilityScore.authorCredibility = sanitizeComponent(credibilityScore.authorCredibility)
    credibilityScore.statisticalValidity = sanitizeComponent(credibilityScore.statisticalValidity)
    credibilityScore.logicalConsistency = sanitizeComponent(credibilityScore.logicalConsistency)

    // Recalculate rating based on percentage
    const scorePercentage = (credibilityScore.totalScore / maxWeight) * 100
    if (scorePercentage >= 90) {
      credibilityScore.rating = 'Exemplary'
    } else if (scorePercentage >= 70) {
      credibilityScore.rating = 'Strong'
    } else if (scorePercentage >= 50) {
      credibilityScore.rating = 'Moderate'
    } else if (scorePercentage >= 30) {
      credibilityScore.rating = 'Weak'
    } else if (scorePercentage > 0) {
      credibilityScore.rating = 'Very Poor'
    } else {
      credibilityScore.rating = 'Invalid'
    }

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

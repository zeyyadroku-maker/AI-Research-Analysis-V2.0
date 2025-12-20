import { NextRequest, NextResponse } from 'next/server'
import { AnalysisResult } from '@/app/types'

export async function POST(request: NextRequest) {
    try {
        const { message, analysis } = await request.json() as { message: string; analysis: AnalysisResult }

        if (!message || !analysis) {
            return NextResponse.json(
                { error: 'Message and analysis context are required' },
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

        // Construct a context-aware system prompt
        const systemPrompt = `You are an expert research assistant helping a user understand a specific academic paper.
    
PAPER CONTEXT:
Title: ${analysis.paper.title}
Authors: ${analysis.paper.authors.join(', ')}
Field: ${analysis.paper.field}
Document Type: ${analysis.paper.documentType}

ANALYSIS SUMMARY:
- Credibility Score: ${analysis.credibility.totalScore}/${analysis.credibility.maxTotalScore} (${analysis.credibility.rating})
- Bias Level: ${analysis.bias.overallLevel}
- Key Findings: ${analysis.keyFindings.conclusions.primaryConclusion}
- Methodology: ${analysis.keyFindings.methodology.studyDesign}, Sample Size: ${analysis.keyFindings.methodology.sampleSize}

INSTRUCTIONS:
- Answer the user's question based strictly on the paper's context and your general academic knowledge.
- Be concise, professional, and helpful.
- If the user asks about something not in the paper, politely explain that it's outside the scope of this specific document.
- Do not make up facts about the paper.`

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
                max_tokens: 1000,
                temperature: 0.7,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: message,
                    },
                ],
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Claude API error:', errorText)
            return NextResponse.json(
                { error: `Claude API error: ${response.statusText}` },
                { status: response.status }
            )
        }

        const data = await response.json()
        const reply = data.content[0].text

        return NextResponse.json({ reply })
    } catch (error) {
        console.error('Chat API error:', error)
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        )
    }
}

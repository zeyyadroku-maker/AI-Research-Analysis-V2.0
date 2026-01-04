export async function callClaudeAPI(prompt: string, apiKey: string, stream: boolean = false, pdfData?: string) {
    // Model fallback strategy
    const models = [
        { id: 'claude-sonnet-4-5-20250929', maxTokens: 8000 },
        { id: 'claude-sonnet-4-20250514', maxTokens: 8000 },
        { id: 'claude-haiku-4-5-20251001', maxTokens: 8000 },
    ]

    let response

    for (const modelConfig of models) {
        console.log(`Attempting analysis with model: ${modelConfig.id}`)
        try {
            const messages: any[] = []

            if (pdfData) {
                messages.push({
                    role: 'user',
                    content: [
                        {
                            type: 'document',
                            source: {
                                type: 'base64',
                                media_type: 'application/pdf',
                                data: pdfData
                            }
                        },
                        {
                            type: 'text',
                            text: prompt
                        }
                    ]
                })
            } else {
                messages.push({
                    role: 'user',
                    content: prompt
                })
            }

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
                    stream: stream,
                    system:
                        'You are implementing the Syllogos Research Evaluation Framework v2.0. You are an expert research analyst with deep understanding of academic rigor, bias detection, and honest uncertainty acknowledgment. Your role is to assist researchers, never replace expert judgment. Return ONLY valid JSON with complete transparency about what you can and cannot assess.',
                    messages: messages,
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

        throw new Error(`Claude API error: ${response ? response.statusText : 'No response'} - ${JSON.stringify(errorDetails)}`)
    }

    if (stream) {
        return response
    }

    const data = await response.json()
    const responseText = data.content[0].text

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
        console.error('Could not extract JSON from response:', responseText)
        throw new Error('Failed to parse analysis response: No JSON found')
    }

    try {
        return JSON.parse(jsonMatch[0])
    } catch (e) {
        console.error('Failed to parse JSON:', e)
        throw new Error('Failed to parse analysis response: Invalid JSON')
    }
}

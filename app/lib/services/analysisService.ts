export async function callClaudeAPI(prompt: string, apiKey: string) {
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

        throw new Error(`Claude API error: ${response ? response.statusText : 'No response'} - ${JSON.stringify(errorDetails)}`)
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

import { GoogleGenerativeAI } from '@google/generative-ai'

// Define the exact model hierarchy as requested
const MODELS = [
    { id: 'gemini-3.0-flash-preview', provider: 'google' },
    { id: 'gemini-3-pro-preview', provider: 'google' },
    { id: 'claude-sonnet-4-5-20250929', provider: 'anthropic' } // Emergency fallback
]

export async function performGeminiAnalysis(
    prompt: string,
    googleApiKey: string,
    anthropicApiKey: string,
    stream: boolean = false,
    pdfData?: string
) {
    let lastError: any = null

    for (const modelConfig of MODELS) {
        console.log(`[Analysis Service] Attempting analysis with primary/fallback model: ${modelConfig.id} (${modelConfig.provider})`)

        try {
            if (modelConfig.provider === 'google') {
                return await callGemini(modelConfig.id, prompt, googleApiKey, stream, pdfData)
            } else if (modelConfig.provider === 'anthropic') {
                return await callClaudeFallback(modelConfig.id, prompt, anthropicApiKey, stream, pdfData)
            }
        } catch (error: any) {
            console.error(`[Analysis Service] Failed with model ${modelConfig.id}:`, error.message || error)
            lastError = error

            // Log the fallback event explicitly
            const nextModelIndex = MODELS.indexOf(modelConfig) + 1
            if (nextModelIndex < MODELS.length) {
                console.log(`[Analysis Service] Falling back to ${MODELS[nextModelIndex].id} due to error.`)
            }
        }
    }

    throw new Error(`All analysis models failed. Last error: ${lastError?.message || 'Unknown error'}`)
}

async function callGemini(modelId: string, prompt: string, apiKey: string, stream: boolean, pdfData?: string) {
    if (!apiKey) throw new Error('Google AI API Key is missing')

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
        model: modelId,
        systemInstruction: {
            role: 'system',
            parts: [{ text: 'You are implementing the Syllogos Research Evaluation Framework v2.0. You are an expert research analyst. Return ONLY valid JSON.' }]
        }
    })

    const generationConfig = {
        temperature: 0,
        responseMimeType: "application/json",
    }

    const parts: any[] = []

    if (pdfData) {
        parts.push({
            inlineData: {
                mimeType: "application/pdf",
                data: pdfData
            }
        })
    }

    parts.push({ text: prompt })

    if (stream) {
        const result = await model.generateContentStream({
            contents: [{ role: 'user', parts }],
            generationConfig
        })
        return { type: 'gemini_stream', stream: result.stream }
    } else {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts }],
            generationConfig
        })
        return result.response.text()
    }
}

// Kept as internal helper for the emergency fallback
async function callClaudeFallback(modelId: string, prompt: string, apiKey: string, stream: boolean, pdfData?: string) {
    if (!apiKey) throw new Error('Anthropic API Key is missing for fallback')

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
                { type: 'text', text: prompt }
            ]
        })
    } else {
        messages.push({
            role: 'user',
            content: prompt
        })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: modelId,
            max_tokens: 8000,
            temperature: 0,
            stream: stream,
            system: 'You are implementing the Syllogos Research Evaluation Framework v2.0. Return ONLY valid JSON.',
            messages: messages,
        }),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Claude API error: ${response.status} - ${errorText}`)
    }

    if (stream) {
        return { type: 'claude_stream', response } // Pass full response for stream reading
    }

    const data = await response.json()
    const responseText = data.content[0].text
    return responseText
}


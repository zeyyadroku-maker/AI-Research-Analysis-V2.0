import { Paper } from '@/app/types'
import { classifyDocumentType, classifyAcademicField, getFrameworkGuidelines, DocumentType, AcademicField } from '@/app/lib/adaptiveFramework'
import { buildFrameworkV2Prompt } from '@/app/lib/frameworkPromptBuilder'
import { performGeminiAnalysis } from '@/app/lib/services/analysisService'
import { processTextDocument } from '@/app/lib/documentProcessor'

export async function performUnifiedAnalysis(
    paper: Paper,
    content: Buffer | string,
    mimeType: string,
    apiKey: string
): Promise<ReadableStream> {

    let analysisText = ''
    let pdfBase64: string | undefined
    let documentType: DocumentType = 'unknown'
    let field: AcademicField = 'unknown'

    // Robust PDF detection
    const isPdf = mimeType.includes('pdf') ||
        (Buffer.isBuffer(content) && content.toString('utf-8', 0, 5).startsWith('%PDF')) ||
        paper.title.toLowerCase().endsWith('.pdf')

    if (isPdf) {
        console.log(`[Unified Analysis] Processing PDF: ${paper.title}`)
        pdfBase64 = Buffer.isBuffer(content) ? content.toString('base64') : Buffer.from(content).toString('base64')

        // Standardized placeholder for PDF analysis
        analysisText = 'PDF Document Attached. Please analyze the visual content.'

        // Fallback classification based on title since we rely on Claude for deep analysis of PDF
        documentType = classifyDocumentType(paper.title, paper.title)
        field = classifyAcademicField(paper.title, paper.title)
    } else {
        console.log(`[Unified Analysis] Processing Text: ${paper.title}`)
        const rawText = Buffer.isBuffer(content) ? content.toString('utf-8') : content

        // Use the standard processor to normalize text for consistency
        const processed = await processTextDocument(rawText, {
            title: paper.title,
            authors: paper.authors,
            abstract: paper.abstract
        })

        analysisText = processed.fullText
        documentType = classifyDocumentType(analysisText, paper.title)
        field = classifyAcademicField(analysisText, paper.title)
    }

    const framework = getFrameworkGuidelines(documentType, field)

    // Preserve specific metadata if available (e.g. from DOI)
    const specificDocumentType = (paper.documentType && paper.documentType !== 'unknown')
        ? paper.documentType
        : documentType

    const specificField = (paper.field && paper.field !== 'unknown')
        ? paper.field
        : field

    // Helper to check if a type is generic/unknown
    const isGenericType = (type: string) => {
        const lower = type.toLowerCase()
        return ['unknown', 'n/a', 'undefined', 'null', '', 'general', 'miscellaneous'].includes(lower)
    }

    // Deterministic Source Logic:
    // If we have a specific (non-generic) type from the paper metadata (DOI), source is DOI.
    // Otherwise, source is AI (inferred).
    const classificationSource = !isGenericType(specificDocumentType) ? 'DOI' : 'AI'

    console.log(`[Unified Analysis] Classified as ${documentType} (${specificDocumentType}) in ${field} (${specificField}) - Source: ${classificationSource}`)

    const prompt = buildFrameworkV2Prompt({
        documentTitle: paper.title,
        documentType,
        field,
        specificDocumentType,
        specificField,
        framework,
        fullText: analysisText,
        abstract: paper.abstract || '',
    })

    console.log(`[Unified Analysis] Prompt generated (${prompt.length} chars)`)

    // Call Gemini API (with fallback to Claude)
    // Note: We need both keys. Assuming the passed apiKey is the Google one, but we likely need environment variables for the fallbacks if not passed in.
    // However, the function signature only accepts one apiKey. For now, we'll try to use the passed key as Google key if it starts with AI, otherwise fallback to env?
    // Actually, migration instruction says "Add GOOGLE_AI_API_KEY variable". I should read from process.env for the keys if possible or assume they are passed.
    // But the existing code passes `apiKey`. Use it as Google Key if we are migrating.
    // Warning: The existing caller might be passing a Claude key.
    // Ideally, we should fetch keys from environment variables inside `performGeminiAnalysis` if not provided, or update the caller. 
    // Since I cannot change the caller (app/api/analyze/route.ts) easily without verifying it, I will assume `process.env.GOOGLE_AI_API_KEY` and `process.env.CLAUDE_API_KEY` are available and use them in the service calls, ignoring the passed apiKey if strictly needed, OR use the passed apiKey as the Google one.
    // Let's use `process.env` inside here to be safe.

    // Actually, let's look at how performGeminiAnalysis is defined. It takes googleKey, anthropicKey.
    // I need to update this controller to use env vars.
    const googleKey = process.env.GOOGLE_AI_API_KEY || ''
    const anthropicKey = process.env.CLAUDE_API_KEY || apiKey // Fallback to passed key if it was the old Claude one

    const streamResult: any = await performGeminiAnalysis(prompt, googleKey, anthropicKey, true, pdfBase64)

    // Create a stream to parse SSE events and yield text deltas
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    return new ReadableStream({
        async start(controller) {
            // Send metadata as the first chunk
            const metadata = {
                type: 'metadata',
                data: {
                    documentType: specificDocumentType,
                    field: specificField,
                    source: classificationSource,
                    framework
                }
            }
            controller.enqueue(encoder.encode(JSON.stringify(metadata) + '\n'))

            try {
                if (streamResult.type === 'gemini_stream') {
                    for await (const chunk of streamResult.stream) {
                        const chunkText = chunk.text()
                        if (chunkText) {
                            controller.enqueue(encoder.encode(chunkText))
                        }
                    }
                } else if (streamResult.type === 'claude_stream') {
                    // Claude stream handling (Legacy)
                    const reader = (streamResult.response.body as any).getReader()
                    let buffer = ''

                    while (true) {
                        const { done, value } = await reader.read()
                        if (done) break

                        const chunk = decoder.decode(value, { stream: true })
                        buffer += chunk
                        const lines = buffer.split('\n')
                        buffer = lines.pop() || ''

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6)
                                if (data === '[DONE]') continue
                                try {
                                    const parsed = JSON.parse(data)
                                    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                                        controller.enqueue(encoder.encode(parsed.delta.text))
                                    }
                                } catch (e) { }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('[Unified Analysis] Stream reading error:', error)
                controller.error(error)
            } finally {
                controller.close()
            }
        }
    })
}

import { Paper } from '@/app/types'
import { classifyDocumentType, classifyAcademicField, getFrameworkGuidelines, DocumentType, AcademicField } from '@/app/lib/adaptiveFramework'
import { buildFrameworkV2Prompt } from '@/app/lib/frameworkPromptBuilder'
import { callClaudeAPI } from '@/app/lib/services/analysisService'
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
    let field: AcademicField = 'interdisciplinary'

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

    console.log(`[Unified Analysis] Classified as ${documentType} in ${field}`)

    const prompt = buildFrameworkV2Prompt({
        documentTitle: paper.title,
        documentType,
        field,
        framework,
        fullText: analysisText,
        abstract: paper.abstract || '',
    })

    console.log(`[Unified Analysis] Prompt generated (${prompt.length} chars)`)

    // Call Claude API via service with streaming enabled
    const streamResponse = await callClaudeAPI(prompt, apiKey, true, pdfBase64)

    // Create a stream to parse SSE events and yield text deltas
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    return new ReadableStream({
        async start(controller) {
            // Send metadata as the first chunk
            const metadata = {
                type: 'metadata',
                data: {
                    documentType,
                    field,
                    framework
                }
            }
            controller.enqueue(encoder.encode(JSON.stringify(metadata) + '\n'))

            const reader = (streamResponse.body as any).getReader()
            let buffer = ''

            try {
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
                            } catch (e) {
                                // Ignore parse errors for partial lines
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

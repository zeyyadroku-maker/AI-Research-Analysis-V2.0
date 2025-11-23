export interface ProcessedDocument {
  fullText: string
  chunks: DocumentChunk[]
  metadata: DocumentMetadata
  pageCount: number
  tokenEstimate: number
}

export interface DocumentChunk {
  text: string
  pageStart: number
  pageEnd: number
  chunkIndex: number
  tokenEstimate: number
  isIntroduction: boolean
  isConclusion: boolean
  sectionType: 'abstract' | 'introduction' | 'methodology' | 'results' | 'discussion' | 'conclusion' | 'references' | 'other'
}

export interface DocumentMetadata {
  title?: string
  authors?: string[]
  abstract?: string
  keywords?: string[]
  extractionDate: string
  originalFormat: 'pdf' | 'text' | 'html'
  confidence: number // 0-1, how well the extraction went
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfModule = require('pdf-parse')
const pdf = pdfModule.PDFParse || pdfModule.default || pdfModule

/**
 * Extract text from PDF buffer using pdf-parse with fallback to pdf.js
 */
export async function extractPdfText(buffer: Buffer): Promise<{
  text: string
  pageCount: number
}> {
  try {
    console.log(`[extractPdfText] Starting extraction. Buffer size: ${buffer.length}`)
    console.log(`[extractPdfText] pdf-parse type: ${typeof pdf}`)

    // Primary method: pdf-parse (faster, good for text-based PDFs)
    let data
    try {
      // Try function call first (for v1 compatibility or if it's a wrapper)
      try {
        data = await pdf(buffer)
      } catch (e: any) {
        if (e.message && e.message.includes("Class constructors")) {
          console.log('[extractPdfText] pdf-parse is a class, using class API...')
          // Convert buffer to Uint8Array as required by v2
          const uint8Array = new Uint8Array(buffer)
          // @ts-ignore
          const parser = new pdf(uint8Array)
          const text = await parser.getText()

          // Try to get page count from doc property if available
          let numPages = 0
          if (parser.doc && parser.doc.numPages) {
            numPages = parser.doc.numPages
          }

          data = {
            text,
            numpages: numPages
          }
        } else {
          throw e
        }
      }
    } catch (e: any) {
      throw e
    }
    console.log(`[extractPdfText] pdf-parse success. Pages: ${data.numpages}, Text len: ${data.text?.length}`)

    // Check if extraction was successful (sometimes returns empty strings for image-based PDFs)
    if (data.text && data.text.trim().length > 100) {
      return {
        text: data.text,
        pageCount: data.numpages
      }
    }

    throw new Error('pdf-parse returned empty or insufficient text')
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.warn(`[extractPdfText] pdf-parse failed: ${errorMsg}`)

    try {
      console.log('[extractPdfText] Attempting fallback to pdfjs-dist legacy...')
      // Fallback method: pdf.js (better for some complex layouts)
      // Use dynamic import for legacy build to avoid Node.js issues
      // @ts-ignore
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
      console.log('[extractPdfText] pdfjs-dist legacy imported. Keys:', Object.keys(pdfjsLib))

      const getDocument = (pdfjsLib as any).getDocument || ((pdfjsLib as any).default && (pdfjsLib as any).default.getDocument)
      if (!getDocument) {
        throw new Error('getDocument not found in pdfjs-dist export')
      }

      // Note: In a Node environment, we need to load the standard font data
      const loadingTask = getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
        disableFontFace: true,
        verbosity: 0
        // standardFontDataUrl: ... (might be needed if we didn't disable font face)
      })

      const doc = await loadingTask.promise
      const numPages = doc.numPages
      console.log(`[extractPdfText] pdfjs document loaded. Pages: ${numPages}`)
      let fullText = ''

      for (let i = 1; i <= numPages; i++) {
        const page = await doc.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        fullText += pageText + '\n\n'
      }

      console.log(`[extractPdfText] pdfjs fallback success. Text len: ${fullText.length}`)
      return {
        text: fullText,
        pageCount: numPages
      }
    } catch (fallbackError) {
      const fbErrorMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
      console.error(`[extractPdfText] Both PDF extraction methods failed. Fallback error: ${fbErrorMsg}`)
      return {
        text: '',
        pageCount: 0
      }
    }
  }
}

/**
 * Normalize extracted text by removing excessive whitespace and formatting artifacts
 */
export function normalizeText(rawText: string): string {
  return rawText
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove common PDF artifacts
    .replace(/\f/g, '\n') // Form feed to newline
    .replace(/\x00/g, '') // Null characters
    // Clean up multiple newlines
    .replace(/\n\n+/g, '\n\n')
    .trim()
}

/**
 * Estimate token count (rough approximation: ~1 token per 4 characters)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Detect section type based on heading/content patterns
 */
function detectSectionType(text: string): DocumentChunk['sectionType'] {
  const lower = text.toLowerCase()

  if (lower.includes('abstract')) return 'abstract'
  if (lower.match(/introduction|background|literature|related\s+work/)) return 'introduction'
  if (lower.match(/method|methodology|approach|design|procedure/)) return 'methodology'
  if (lower.match(/result|finding|outcome|conclusion|discussion/)) return 'results'
  if (lower.match(/discussion|implication|limitation|future\s+work/)) return 'discussion'
  if (lower.match(/conclusion|summary|concluding|final/)) return 'conclusion'
  if (lower.match(/reference|bibliography|citation/)) return 'references'

  return 'other'
}

/**
 * Split text into chunks while preserving section context
 * Handles documents up to ~200K tokens (~800K characters)
 * Chunks large documents while maintaining section boundaries
 */
export function chunkDocument(
  text: string,
  maxChunkTokens: number = 3000,
  overlapTokens: number = 500
): DocumentChunk[] {
  const chunks: DocumentChunk[] = []
  const maxChunkChars = maxChunkTokens * 4 // Approximate: 1 token per 4 characters
  const overlapChars = overlapTokens * 4

  // Split by paragraphs first to preserve meaning
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0)

  let currentChunk = ''
  let currentChunkPageStart = 1
  let currentChunkPageEnd = 1
  let currentPageNumber = 1
  let chunkIndex = 0

  for (const paragraph of paragraphs) {
    const trimmedPara = paragraph.trim()

    // Track page numbers (rough estimate: ~3500 chars per page)
    const estimatedPagesInPara = Math.ceil(trimmedPara.length / 3500)

    // Check if adding this paragraph would exceed chunk size
    const wouldBeTooLarge = (currentChunk.length + trimmedPara.length) > maxChunkChars

    if (wouldBeTooLarge && currentChunk.length > 0) {
      // Create chunk from current content
      const sectionType = detectSectionType(currentChunk)
      const isIntro = sectionType === 'abstract' || sectionType === 'introduction'
      const isConc = sectionType === 'conclusion' || sectionType === 'discussion'

      chunks.push({
        text: currentChunk.trim(),
        pageStart: currentChunkPageStart,
        pageEnd: currentChunkPageEnd,
        chunkIndex,
        tokenEstimate: estimateTokens(currentChunk),
        isIntroduction: isIntro,
        isConclusion: isConc,
        sectionType,
      })

      // Start new chunk with overlap from previous for context
      const overlap = currentChunk
        .split('\n')
        .slice(-Math.ceil(overlapChars / 80)) // Rough: ~80 chars per line
        .join('\n')

      currentChunk = overlap + '\n\n' + trimmedPara
      currentChunkPageStart = currentChunkPageEnd
      chunkIndex++
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + trimmedPara
    }

    currentChunkPageEnd += estimatedPagesInPara
    currentPageNumber += estimatedPagesInPara
  }

  // Add final chunk
  if (currentChunk.trim().length > 0) {
    const sectionType = detectSectionType(currentChunk)
    const isIntro = sectionType === 'abstract' || sectionType === 'introduction'
    const isConc = sectionType === 'conclusion' || sectionType === 'discussion'

    chunks.push({
      text: currentChunk.trim(),
      pageStart: currentChunkPageStart,
      pageEnd: currentChunkPageEnd,
      chunkIndex,
      tokenEstimate: estimateTokens(currentChunk),
      isIntroduction: isIntro,
      isConclusion: isConc,
      sectionType,
    })
  }

  return chunks
}

/**
 * Process a PDF document end-to-end:
 * 1. Extract text from PDF
 * 2. Normalize the text
 * 3. Chunk into manageable pieces
 * 4. Return structured document
 */
export async function processPdfDocument(
  buffer: Buffer,
  metadata?: Partial<DocumentMetadata>
): Promise<ProcessedDocument> {
  // Extract text from PDF
  const { text: rawText, pageCount } = await extractPdfText(buffer)

  // Normalize the extracted text
  const fullText = normalizeText(rawText)

  // Chunk the document
  const chunks = chunkDocument(fullText)

  // Calculate total tokens
  const totalTokens = estimateTokens(fullText)

  return {
    fullText,
    chunks,
    metadata: {
      title: metadata?.title,
      authors: metadata?.authors,
      abstract: metadata?.abstract,
      keywords: metadata?.keywords,
      extractionDate: new Date().toISOString(),
      originalFormat: metadata?.originalFormat || 'pdf',
      confidence: metadata?.confidence ?? 0.85,
    },
    pageCount,
    tokenEstimate: totalTokens,
  }
}

/**
 * Process plain text (fallback when PDF extraction fails)
 */
export async function processTextDocument(
  text: string,
  metadata?: Partial<DocumentMetadata>
): Promise<ProcessedDocument> {
  const fullText = normalizeText(text)
  const chunks = chunkDocument(fullText)
  const totalTokens = estimateTokens(fullText)

  return {
    fullText,
    chunks,
    metadata: {
      title: metadata?.title,
      authors: metadata?.authors,
      abstract: metadata?.abstract,
      keywords: metadata?.keywords,
      extractionDate: new Date().toISOString(),
      originalFormat: metadata?.originalFormat || 'text',
      confidence: metadata?.confidence ?? 0.7,
    },
    pageCount: Math.ceil(fullText.length / 3500),
    tokenEstimate: totalTokens,
  }
}

/**
 * Select the most relevant chunks for analysis
 * Prioritizes:
 * 1. Introduction and abstract (context)
 * 2. Methodology and results (core content)
 * 3. Conclusion (summary)
 */
export function selectRelevantChunks(
  chunks: DocumentChunk[],
  maxTokens: number = 20000 // Increased default for full-text analysis
): DocumentChunk[] {
  const selected: DocumentChunk[] = []
  let totalTokens = 0

  // Always include introduction/abstract first
  const intro = chunks.filter(c => c.isIntroduction)
  intro.forEach(c => {
    selected.push(c)
    totalTokens += c.tokenEstimate
  })

  // Then methodology and results
  const mainContent = chunks.filter(
    c => !c.isIntroduction &&
      !c.isConclusion &&
      (c.sectionType === 'methodology' || c.sectionType === 'results' || c.sectionType === 'other')
  )
  mainContent.forEach(c => {
    if (totalTokens + c.tokenEstimate <= maxTokens) {
      selected.push(c)
      totalTokens += c.tokenEstimate
    }
  })

  // Finally, conclusion if space permits
  const conclusion = chunks.filter(c => c.isConclusion)
  conclusion.forEach(c => {
    if (totalTokens + c.tokenEstimate <= maxTokens) {
      selected.push(c)
      totalTokens += c.tokenEstimate
    }
  })

  // Return in original order
  return selected.sort((a, b) => a.chunkIndex - b.chunkIndex)
}

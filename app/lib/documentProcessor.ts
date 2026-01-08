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

/**
 * Extract text from PDF buffer (simplified - no pdf-parse)
 */
export async function extractPdfText(): Promise<{
  text: string
  pageCount: number
}> {
  // PDF parsing disabled - return empty string to fall back to abstract
  // This allows the analysis to work with abstracts instead
  return {
    text: '',
    pageCount: 0,
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
  metadata?: Partial<DocumentMetadata>
): Promise<ProcessedDocument> {
  // Extract text from PDF
  const { text: rawText, pageCount } = await extractPdfText()

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
  maxTokens: number = 10000
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

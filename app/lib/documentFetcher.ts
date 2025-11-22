export interface DocumentSource {
  type: 'arxiv' | 'doi' | 'unpaywall' | 'openalex' | 'direct'
  url: string
  confidence: number
}

export interface FetchedDocument {
  content: Buffer
  source: DocumentSource
  fileName: string
  mimeType: string
  size: number
}

/**
 * Fetch PDF from arXiv using arXiv ID
 * arXiv papers can be directly downloaded as PDFs
 */
async function fetchFromArXiv(arxivId: string): Promise<FetchedDocument | null> {
  try {
    // Clean up arXiv ID (remove version number if present)
    const cleanId = arxivId.replace(/v\d+$/, '')

    // Construct arXiv PDF URL
    const url = `https://arxiv.org/pdf/${cleanId}.pdf`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Research-Analysis-Platform (zeyyad-saleh@hotmail.com)',
      },
    })

    if (!response.ok) {
      return null
    }

    const buffer = await response.arrayBuffer()

    return {
      content: Buffer.from(buffer),
      source: {
        type: 'arxiv',
        url,
        confidence: 0.95,
      },
      fileName: `${cleanId}.pdf`,
      mimeType: 'application/pdf',
      size: buffer.byteLength,
    }
  } catch {
    return null
  }
}

/**
 * Fetch PDF from DOI using Unpaywall API and CrossRef
 */
async function fetchFromDoi(doi: string): Promise<FetchedDocument | null> {
  try {
    // Clean DOI
    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').replace(/^doi:/, '')

    // First try Unpaywall API
    const unpaywallUrl = `https://api.unpaywall.org/v2/${cleanDoi}?email=zeyyad-saleh@hotmail.com`

    const unpaywallResponse = await fetch(unpaywallUrl, {
      headers: {
        'User-Agent': 'Research-Analysis-Platform (zeyyad-saleh@hotmail.com)',
      },
    })

    if (unpaywallResponse.ok) {
      const data = await unpaywallResponse.json() as any

      // Check for open access PDF
      if (data.is_oa && data.best_oa_location?.url_for_pdf) {
        const pdfUrl = data.best_oa_location.url_for_pdf

        try {
          const pdfResponse = await fetch(pdfUrl, {
            headers: {
              'User-Agent': 'Research-Analysis-Platform (zeyyad-saleh@hotmail.com)',
            },
          })

          if (pdfResponse.ok) {
            const buffer = await pdfResponse.arrayBuffer()

            return {
              content: Buffer.from(buffer),
              source: {
                type: 'unpaywall',
                url: pdfUrl,
                confidence: 0.9,
              },
              fileName: `${cleanDoi.replace(/\//g, '_')}.pdf`,
              mimeType: 'application/pdf',
              size: buffer.byteLength,
            }
          }
        } catch {
          // Fall through to next attempt
        }
      }

      // Try published PDF if available
      if (data.published_oa_locations) {
        for (const location of data.published_oa_locations) {
          if (location.url_for_pdf) {
            try {
              const pdfResponse = await fetch(location.url_for_pdf, {
                headers: {
                  'User-Agent': 'Research-Analysis-Platform (zeyyad-saleh@hotmail.com)',
                },
              })

              if (pdfResponse.ok) {
                const buffer = await pdfResponse.arrayBuffer()

                return {
                  content: Buffer.from(buffer),
                  source: {
                    type: 'doi',
                    url: location.url_for_pdf,
                    confidence: 0.85,
                  },
                  fileName: `${cleanDoi.replace(/\//g, '_')}.pdf`,
                  mimeType: 'application/pdf',
                  size: buffer.byteLength,
                }
              }
            } catch {
              continue
            }
          }
        }
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Fetch document from OpenAlex PDF URL
 */
async function fetchFromOpenAlexUrl(url: string): Promise<FetchedDocument | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Research-Analysis-Platform (zeyyad-saleh@hotmail.com)',
      },
    })

    if (!response.ok) {
      return null
    }

    const buffer = await response.arrayBuffer()

    return {
      content: Buffer.from(buffer),
      source: {
        type: 'openalex',
        url,
        confidence: 0.88,
      },
      fileName: url.split('/').pop() || 'document.pdf',
      mimeType: response.headers.get('content-type') || 'application/pdf',
      size: buffer.byteLength,
    }
  } catch {
    return null
  }
}

/**
 * Fetch from a direct URL
 */
async function fetchFromDirectUrl(url: string): Promise<FetchedDocument | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Research-Analysis-Platform (zeyyad-saleh@hotmail.com)',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      return null
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'

    // Only accept PDF or text content
    if (!contentType.includes('pdf') && !contentType.includes('text')) {
      return null
    }

    const buffer = await response.arrayBuffer()

    return {
      content: Buffer.from(buffer),
      source: {
        type: 'direct',
        url,
        confidence: 0.75,
      },
      fileName: url.split('/').pop() || 'document.pdf',
      mimeType: contentType,
      size: buffer.byteLength,
    }
  } catch {
    return null
  }
}

/**
 * Extract arXiv ID from various formats
 */function extractArXivId(text: string): string | null {
  const matches = text.match(/(?:arxiv\.org\/abs\/)?([\d.]+(?:v\d+)?)/i)
  return matches ? matches[1] : null
}

/**
 * Fetch a document using multiple strategies
 * Tries different sources in order of reliability and likelihood
 */
export async function fetchDocument(paperData: {
  openAlexId?: string
  doi?: string
  url?: string
  abstract?: string
}): Promise<FetchedDocument | null> {
  // Strategy 1: Try DOI (most reliable for published papers)
  if (paperData.doi) {
    const doiResult = await fetchFromDoi(paperData.doi)
    if (doiResult) return doiResult
  }

  // Strategy 2: Try OpenAlex PDF URL
  if (paperData.url?.includes('.pdf')) {
    const urlResult = await fetchFromOpenAlexUrl(paperData.url)
    if (urlResult) return urlResult
  }

  // Strategy 3: Extract and try arXiv ID if available
  if (paperData.openAlexId) {
    const arxivId = extractArXivId(paperData.openAlexId)
    if (arxivId) {
      const arxivResult = await fetchFromArXiv(arxivId)
      if (arxivResult) return arxivResult
    }
  }

  // Strategy 4: Try direct URL
  if (paperData.url && !paperData.url.includes('.pdf')) {
    const directResult = await fetchFromDirectUrl(paperData.url)
    if (directResult) return directResult
  }

  // Strategy 5: Try OpenAlex landing page URL
  if (paperData.url) {
    const directResult = await fetchFromDirectUrl(paperData.url)
    if (directResult) return directResult
  }

  // No document could be fetched
  return null
}

/**
 * Try to fetch document with size limits to prevent memory issues
 * Large PDFs (>50MB) are skipped to avoid processing huge files
 */
export async function fetchDocumentSafe(
  paperId: string,
  paperData: {
    openAlexId?: string
    doi?: string
    url?: string
    abstract?: string
  },
  maxSizeBytes: number = 50 * 1024 * 1024 // 50MB default limit
): Promise<FetchedDocument | null> {
  try {
    const doc = await fetchDocument(paperData)

    if (doc && doc.size > maxSizeBytes) {
      console.warn(`Document too large (${doc.size} bytes), skipping`, paperId)
      return null
    }

    return doc
  } catch (error) {
    console.error('Error fetching document:', error)
    return null
  }
}

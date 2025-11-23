import { NextRequest, NextResponse } from 'next/server'
import { Paper } from '@/app/types'

// Simple deterministic hash function for stable ID generation
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `paper-${Math.abs(hash).toString(36)}`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const page = searchParams.get('page') || '1'
    const author = searchParams.get('author')
    const fromYear = searchParams.get('fromYear')
    const toYear = searchParams.get('toYear')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const limit = 10
    const pageNum = parseInt(page)

    // OpenAlex API endpoint
    const worksUrl = 'https://api.openalex.org/works'
    const authorsUrl = 'https://api.openalex.org/authors'

    // User agent for OpenAlex polite pool
    const userAgent = 'Research-Analysis-Platform (zeyyad-saleh@hotmail.com)'

    console.log(`Searching OpenAlex for: "${query}"`)

    // Step 1: If author filter provided, get the author ID first
    let authorFilter = ''
    if (author) {
      console.log(`Looking up author: "${author}"`)
      const authorSearchUrl = `${authorsUrl}?search=${encodeURIComponent(author)}&per-page=5`

      const authorResponse = await fetch(authorSearchUrl, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'application/json',
        },
      })

      if (authorResponse.ok) {
        const authorData = await authorResponse.json()
        const authors = authorData.results || []

        if (authors.length > 0) {
          // Use the first match's ID for filtering
          const authorId = authors[0].id
          authorFilter = `authorships.author.id:${authorId}`
          console.log(`Found author ID: ${authorId}`)
        } else {
          console.log(`No author found matching: "${author}"`)
          // Return empty results if author not found
          return NextResponse.json({
            papers: [],
            totalHits: 0,
            hasMore: false,
            currentPage: pageNum,
          })
        }
      }
    }

    // Step 2: Build the works query with all filters
    const params = new URLSearchParams({
      search: query,
      sort: 'cited_by_count:desc', // Sort by citations
      per_page: limit.toString(),
      page: pageNum.toString(),
    })

    // Build filter string
    const filters: string[] = []

    if (authorFilter) {
      filters.push(authorFilter)
    }

    if (fromYear) {
      filters.push(`publication_year:${fromYear}-${toYear || new Date().getFullYear()}`)
    } else if (toYear) {
      filters.push(`publication_year:1900-${toYear}`)
    }

    if (filters.length > 0) {
      params.append('filter', filters.join(','))
    }

    const fullUrl = `${worksUrl}?${params.toString()}`
    console.log('OpenAlex Request URL:', fullUrl)

    const fullResponse = await fetch(fullUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/json',
      },
    })

    if (!fullResponse.ok) {
      const errorText = await fullResponse.text()
      console.error('OpenAlex Full Search Error:', fullResponse.status, errorText.substring(0, 200))
      return NextResponse.json(
        {
          error: `OpenAlex Search Error: ${fullResponse.status}`,
          details: errorText.substring(0, 200),
        },
        { status: fullResponse.status }
      )
    }

    const data = await fullResponse.json()
    const results = data.results || []

    if (!Array.isArray(results)) {
      console.error('Invalid OpenAlex response format:', data)
      return NextResponse.json(
        { error: 'Invalid response format from OpenAlex API' },
        { status: 500 }
      )
    }

    // Transform OpenAlex response to our Paper format
    const papers: Paper[] = results
      .filter((p: any) => p && p.title) // Filter out invalid entries
      .map((p: any) => {
        const authors = p.authorships || []
        const primaryTopic = p.primary_topic

        return {
          id: p.id || hashString(p.title || 'unknown'),
          title: p.title || 'Untitled',
          authors: authors
            .map((a: any) => a.author?.display_name || 'Unknown')
            .filter((name: string) => name !== 'Unknown'),
          doi: p.doi ? p.doi.replace('https://doi.org/', '') : undefined,
          abstract: p.abstract_inverted_index ? reconstructAbstract(p.abstract_inverted_index) : undefined,
          publicationDate: p.publication_date || undefined,
          url: p.primary_location?.pdf_url || p.primary_location?.landing_page_url || p.doi || undefined,
          year: p.publication_year,
          documentType: p.type || 'article', // article, preprint, etc.
          field: primaryTopic?.display_name || extractPrimaryField(primaryTopic),
          subfield: primaryTopic?.level1_name || undefined,
          domain: primaryTopic?.level0_name || undefined,
          topics: p.topics?.slice(0, 5).map((t: any) => t.display_name).filter(Boolean) || [],
          citationCount: p.cited_by_count || 0,
          openAccessStatus: p.open_access?.is_oa || false,
          openAlexId: p.id,
        }
      })

    console.log(`Successfully retrieved ${papers.length} papers from OpenAlex`)

    return NextResponse.json({
      papers,
      totalHits: data.meta?.count || papers.length,
      hasMore: data.meta?.has_more || false,
      currentPage: pageNum,
    })
  } catch (error) {
    console.error('Search error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to search papers: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// Helper function to reconstruct abstract from OpenAlex inverted index
function reconstructAbstract(invertedIndex: Record<string, number[]>): string {
  if (!invertedIndex || typeof invertedIndex !== 'object') return ''

  const maxIndex = Math.max(...Object.values(invertedIndex).flat())
  const words = new Array(maxIndex + 1)

  for (const [word, positions] of Object.entries(invertedIndex)) {
    positions.forEach(pos => {
      words[pos] = word
    })
  }

  return words.filter(Boolean).join(' ')
}

// Helper function to extract primary field from topic
function extractPrimaryField(topic: any): string {
  if (!topic) return 'Multidisciplinary'

  // Map OpenAlex topics to our field categories
  const topicName = topic.display_name || ''
  const topicLower = topicName.toLowerCase()

  if (topicLower.includes('physics') || topicLower.includes('chemistry') || topicLower.includes('biology')) {
    return 'Natural Sciences'
  }
  if (topicLower.includes('engineering') || topicLower.includes('computer')) {
    return 'Engineering & Technology'
  }
  if (topicLower.includes('medicine') || topicLower.includes('health') || topicLower.includes('nursing')) {
    return 'Medical Sciences'
  }
  if (topicLower.includes('agriculture') || topicLower.includes('environmental')) {
    return 'Agricultural & Environmental Sciences'
  }
  if (topicLower.includes('psychology') || topicLower.includes('sociology') || topicLower.includes('economics') || topicLower.includes('education')) {
    return 'Social Sciences'
  }
  if (topicLower.includes('history') || topicLower.includes('philosophy') || topicLower.includes('literature')) {
    return 'Humanities'
  }
  if (topicLower.includes('mathematics') || topicLower.includes('logic')) {
    return 'Formal Sciences'
  }

  return 'Multidisciplinary'
}

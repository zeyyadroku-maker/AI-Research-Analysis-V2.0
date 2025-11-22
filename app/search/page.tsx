'use client'

import { useState } from 'react'
import SearchBar, { SearchFilters } from '../components/SearchBar'
import ResultsCard from '../components/ResultsCard'
import DetailedAnalysisView from '../components/DetailedAnalysisView'
import PaginationBar from '../components/PaginationBar'
import Navigation from '../components/Navigation'
import FileUploadTab from '../components/FileUploadTab'
import { Paper, AnalysisResult } from '../types'

type TabType = 'search' | 'upload'

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<TabType>('search')
  const [filteredResults, setFilteredResults] = useState<Paper[]>([])
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzingPaperId, setAnalyzingPaperId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [totalHits, setTotalHits] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [lastQuery, setLastQuery] = useState<string>('')
  const [lastFilters, setLastFilters] = useState<SearchFilters | undefined>()

  // Apply filters to search results (client-side refinement of API results)
  const applyFilters = (papers: Paper[], filters: SearchFilters) => {
    let filtered = papers

    // Filter by date range
    if (filters.fromYear) {
      const fromYear = parseInt(filters.fromYear)
      filtered = filtered.filter(p => (p.year || 0) >= fromYear)
    }

    if (filters.toYear) {
      const toYear = parseInt(filters.toYear)
      filtered = filtered.filter(p => (p.year || 9999) <= toYear)
    }

    // Filter by keyword (searches in abstract and title)
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      filtered = filtered.filter(
        p =>
          p.title.toLowerCase().includes(keyword) ||
          (p.abstract && p.abstract.toLowerCase().includes(keyword))
      )
    }

    // Filter by title
    if (filters.title) {
      const titleFilter = filters.title.toLowerCase()
      filtered = filtered.filter(p => p.title.toLowerCase().includes(titleFilter))
    }

    // Filter by author (word-based matching)
    if (filters.author) {
      const authorWords = filters.author.toLowerCase().split(/\s+/).filter(w => w.length > 0)
      filtered = filtered.filter(p =>
        p.authors.some(author => {
          const authorLower = author.toLowerCase()
          // All words must appear in the author name
          return authorWords.every(word => authorLower.includes(word))
        })
      )
    }

    return filtered
  }

  const performSearch = async (query: string, page: number, filters?: SearchFilters) => {
    setIsSearching(true)
    setError(null)
    setAnalysis(null)

    try {
      // Use "research" as default query if no query provided (for filter-only searches)
      const searchQuery = query.trim() || 'research'

      // Build URL with filters
      const apiUrl = new URL(`/api/search`, window.location.origin)
      apiUrl.searchParams.append('q', searchQuery)
      apiUrl.searchParams.append('page', page.toString())
      if (filters?.author) {
        apiUrl.searchParams.append('author', filters.author)
      }
      if (filters?.keyword) {
        apiUrl.searchParams.append('keyword', filters.keyword)
      }
      if (filters?.title) {
        apiUrl.searchParams.append('title', filters.title)
      }
      if (filters?.fromYear) {
        apiUrl.searchParams.append('fromYear', filters.fromYear)
      }
      if (filters?.toYear) {
        apiUrl.searchParams.append('toYear', filters.toYear)
      }

      const response = await fetch(apiUrl.toString())
      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.details ? `${data.error} - ${data.details}` : data.error
        throw new Error(errorMessage || 'Failed to search papers')
      }

      if (!data.papers || !Array.isArray(data.papers)) {
        throw new Error('Invalid response format from server')
      }

      setFilteredResults(data.papers)
      setTotalHits(data.totalHits || 0)
      setHasMore(data.hasMore || false)
      setCurrentPage(page)

      // Apply filters if provided
      const results = filters ? applyFilters(data.papers, filters) : data.papers
      setFilteredResults(results)

      if (results.length === 0 && page === 1) {
        if (query.trim()) {
          setError('No papers found. Try a different search term or adjust filters.')
        } else if (filters && Object.values(filters).some(v => v)) {
          setError('No papers found matching your filters. Try adjusting your filter criteria.')
        } else {
          setError('No papers found. Please enter a search term or use the advanced filters.')
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during search'
      setError(errorMessage)
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = async (query: string, filters?: SearchFilters) => {
    setCurrentPage(1)
    setLastQuery(query)
    setLastFilters(filters)
    await performSearch(query, 1, filters)
  }

  const handlePageChange = async (page: number) => {
    await performSearch(lastQuery, page, lastFilters)
  }

  const handleAnalyze = async (paper: Paper) => {
    setIsAnalyzing(true)
    setAnalyzingPaperId(paper.id)
    setError(null)

    try {
      const fullText = paper.abstract || 'This is a research paper...'

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paper,
          fullText,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Handle specific error cases
        if (errorData.details?.error?.message?.includes('credit balance')) {
          throw new Error(
            'Claude API credits exhausted. Please add credits to your Anthropic account at console.anthropic.com/account/billing/overview'
          )
        }

        const errorMsg = errorData.details?.message || errorData.error || 'Failed to analyze paper'
        throw new Error(errorMsg)
      }

      const result = await response.json() as AnalysisResult
      setAnalysis(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis'
      setError(errorMessage)
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
      setAnalyzingPaperId(null)
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      {/* Navigation */}
      <Navigation onLogoClick={() => window.location.href = '/'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Navigation */}
        <div className="mb-8 flex gap-4 border-b border-gray-200 dark:border-dark-700">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-3 font-medium text-lg border-b-2 transition-all duration-200 ${activeTab === 'search'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Papers
            </div>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-3 font-medium text-lg border-b-2 transition-all duration-200 ${activeTab === 'upload'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Document
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'search' && (
          <>
            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} isLoading={isSearching} />

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6 text-red-700 dark:text-red-200 animate-slide-up">
                <div className="flex gap-3 justify-between items-center">
                  <span className="flex-1">{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="flex-shrink-0 ml-4 text-red-700 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 transition-colors"
                    title="Dismiss error"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {filteredResults.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Search Results
                    <span className="text-gray-600 dark:text-gray-400 text-lg font-normal ml-2">
                      ({filteredResults.length} of {totalHits})
                    </span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.map((paper) => (
                    <ResultsCard
                      key={paper.id}
                      paper={paper}
                      onAnalyze={handleAnalyze}
                      isAnalyzing={analyzingPaperId === paper.id && isAnalyzing}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <PaginationBar
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalHits / 10)}
                  hasMore={hasMore}
                  onPageChange={handlePageChange}
                  isLoading={isSearching}
                />
              </div>
            )}

            {/* Empty State */}
            {filteredResults.length === 0 && !isSearching && !error && (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400 dark:text-gray-500 mb-4">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                </svg>
                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Begin Your Analysis</h3>
                <p className="text-gray-600 dark:text-gray-400">Use the search above to find and analyze research papers</p>
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-2 text-gray-400">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching for papers...
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'upload' && (
          <>
            {/* File Upload Tab */}
            <FileUploadTab
              onAnalysisStart={() => {
                setError(null)
                setAnalysis(null)
              }}
              onAnalysisComplete={(result) => {
                setAnalysis(result)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              onError={(err) => setError(err)}
            />
          </>
        )}
      </div>

      {/* Detailed Analysis Modal */}
      {analysis && (
        <DetailedAnalysisView
          analysis={analysis}
          onClose={() => {
            setAnalysis(null)
          }}
        />
      )}
    </main>
  )
}

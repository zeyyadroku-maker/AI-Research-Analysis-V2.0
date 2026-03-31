'use client'

import { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string, filters?: SearchFilters) => void
  isLoading?: boolean
}

export interface SearchFilters {
  fromYear?: string
  toYear?: string
  keyword?: string
  title?: string
  author?: string
}

export default function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [fromYear, setFromYear] = useState('')
  const [toYear, setToYear] = useState('')
  const [keyword, setKeyword] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [dateError, setDateError] = useState<string | null>(null)

  // Check if any filters are active
  const hasActiveFilters = !!(fromYear || toYear || keyword || title || author)

  // Filters should only be ENABLED when the main search bar has text
  const hasMainQuery = !!query.trim()
  const filtersDisabled = !hasMainQuery


  // Validate date range
  const validateDateRange = (): boolean => {
    if (fromYear && toYear) {
      const from = parseInt(fromYear)
      const to = parseInt(toYear)
      if (from > to) {
        setDateError(`From year (${from}) cannot be later than To year (${to})`)
        return false
      }
    }
    setDateError(null)
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate date range before submitting
    if (!validateDateRange()) {
      return
    }

    // Allow search if query is provided (filters optional but only work with a main query)
    if (query.trim()) {
      onSearch(query, {
        fromYear: fromYear || undefined,
        toYear: toYear || undefined,
        keyword: keyword || undefined,
        title: title || undefined,
        author: author || undefined,
      })
    }
  }

  const handleClearFilters = () => {
    setFromYear('')
    setToYear('')
    setKeyword('')
    setTitle('')
    setAuthor('')
  }

  return (
    <div className="w-full mb-8">
      {/* Main Search Bar */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research papers by topic, author, keywords..."
            disabled={isLoading}
            className="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-primary-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-500 focus:ring-opacity-30"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || (!query.trim() && !hasActiveFilters)}
          className="px-6 py-3 bg-blue-600 dark:bg-primary-600 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </span>
          ) : (
            'Search'
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-3 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          title="Toggle advanced filters"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
      </form>

      {/* Date Range Error */}
      {dateError && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-200">{dateError}</p>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className={`border rounded-lg p-6 mb-4 animate-slide-down transition-all ${filtersDisabled
            ? 'bg-gray-100 dark:bg-dark-800/50 border-gray-300 dark:border-dark-700'
            : 'bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600'
          }`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-gray-900 dark:text-white font-semibold">Advanced Filters</h3>
              {filtersDisabled && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Enter a search term above to use filters</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={filtersDisabled}
              className={`text-sm transition-colors ${filtersDisabled
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              Clear filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ opacity: filtersDisabled ? 0.6 : 1, pointerEvents: filtersDisabled ? 'none' : 'auto' }}>
            {/* From Year */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">From Year</label>
              <select
                value={fromYear}
                onChange={(e) => setFromYear(e.target.value)}
                disabled={filtersDisabled}
                className={`w-full px-3 py-2 rounded text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-primary-500 transition-all cursor-pointer ${filtersDisabled
                    ? 'bg-gray-200 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 text-gray-600 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600'
                  }`}
              >
                <option value="">Any Year</option>
                {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => new Date().getFullYear() - i).map((year) => {
                  const isDisabled = !!(toYear && year > parseInt(toYear))
                  return (
                    <option key={year} value={year} disabled={isDisabled}>
                      {year}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* To Year */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">To Year</label>
              <select
                value={toYear}
                onChange={(e) => setToYear(e.target.value)}
                disabled={filtersDisabled}
                className={`w-full px-3 py-2 rounded text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-primary-500 transition-all cursor-pointer ${filtersDisabled
                    ? 'bg-gray-200 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 text-gray-600 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600'
                  }`}
              >
                <option value="">Any Year</option>
                {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => new Date().getFullYear() - i).map((year) => {
                  const isDisabled = !!(fromYear && year < parseInt(fromYear))
                  return (
                    <option key={year} value={year} disabled={isDisabled}>
                      {year}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Keyword Filter */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Keyword</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={filtersDisabled}
                placeholder="Filter by keyword..."
                className={`w-full px-3 py-2 rounded text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-primary-500 transition-all ${filtersDisabled
                    ? 'bg-gray-200 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 text-gray-600 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600'
                  }`}
              />
            </div>

            {/* Title Filter */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Title Contains</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={filtersDisabled}
                placeholder="Filter by title..."
                className={`w-full px-3 py-2 rounded text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-primary-500 transition-all ${filtersDisabled
                    ? 'bg-gray-200 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 text-gray-600 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600'
                  }`}
              />
            </div>

            {/* Author Filter */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Author Name</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={filtersDisabled}
                placeholder="Filter by author..."
                className={`w-full px-3 py-2 rounded text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-primary-500 transition-all ${filtersDisabled
                    ? 'bg-gray-200 dark:bg-dark-900 border border-gray-300 dark:border-dark-700 text-gray-600 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600'
                  }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

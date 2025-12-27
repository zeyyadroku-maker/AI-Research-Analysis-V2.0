'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationBarProps {
  currentPage: number
  totalPages: number
  hasMore: boolean
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export default function PaginationBar({
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
  isLoading = false,
}: PaginationBarProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    // Enable next if either hasMore is true OR currentPage < totalPages
    const canGoNext = hasMore || (totalPages > 0 && currentPage < totalPages)
    if (canGoNext) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value, 10)
    if (page > 0 && (totalPages === 0 || page <= totalPages)) {
      onPageChange(page)
    }
  }

  const canGoNext = hasMore || (totalPages > 0 && currentPage < totalPages)

  return (
    <div className="flex items-center justify-between gap-4 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-4 mt-6 shadow-sm transition-colors">
      <div className="flex items-center gap-2">
        {/* Only show Previous button if not on first page */}
        {currentPage > 1 && (
          <button
            onClick={handlePrevious}
            disabled={isLoading}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canGoNext || isLoading}
          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-medium text-sm"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <span>Page</span>
        <input
          type="number"
          min="1"
          value={currentPage}
          onChange={handlePageInput}
          disabled={isLoading}
          className="w-14 px-2 py-1 rounded-md bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-white text-center disabled:opacity-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
        />
        {totalPages > 0 && <span>of {totalPages}</span>}
        {totalPages === 0 && hasMore && <span>(more available)</span>}
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400 min-w-[80px] text-right">
        {isLoading && (
          <span className="flex items-center justify-end gap-2 text-primary-600 dark:text-primary-400">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading
          </span>
        )}
      </div>
    </div>
  )
}

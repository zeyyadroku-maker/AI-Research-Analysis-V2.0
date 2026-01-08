'use client'

import { Paper } from '@/app/types'
import DocumentTypeIndicator from './DocumentTypeIndicator'

interface ResultsCardProps {
  paper: Paper
  onAnalyze: (paper: Paper) => void
  isAnalyzing?: boolean
}

export default function ResultsCard({ paper, onAnalyze, isAnalyzing = false }: ResultsCardProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const handleCardClick = () => {
    if (paper.url) {
      window.open(paper.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-3 sm:p-5 hover:border-blue-500 dark:hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group animate-slide-up ${paper.url ? 'cursor-pointer' : ''}`}
    >
      <div className="flex flex-col h-full">
        {/* Title */}
        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 group-hover:text-blue-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
          {paper.title}
        </h3>

        {/* Document Type Badge */}
        {paper.documentType && (
          <div className="mb-2 sm:mb-3">
            <DocumentTypeIndicator
              documentTypeString={paper.documentType}
              field={paper.field}
              subfield={paper.subfield}
              domain={paper.domain}
              compact={true}
            />
          </div>
        )}

        {/* Topics */}
        {paper.topics && paper.topics.length > 0 && (
          <div className="mb-2 sm:mb-3 flex flex-wrap gap-1">
            {paper.topics.slice(0, 2).map((topic, idx) => (
              <span
                key={idx}
                className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 truncate"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* Authors and Meta */}
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 space-y-0.5 sm:space-y-1">
          {paper.authors && paper.authors.length > 0 && (
            <p className="truncate">
              <span className="font-medium">Authors:</span> <span className="text-xs">{truncateText(paper.authors.slice(0, 1).join(', '), 40)}</span>
            </p>
          )}
          {paper.year && (
            <p>
              <span className="font-medium">Year:</span> {paper.year}
            </p>
          )}
        </div>

        {/* Abstract preview - hide on mobile */}
        {paper.abstract && (
          <p className="hidden sm:block text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
            {truncateText(paper.abstract, 200)}
          </p>
        )}

        {/* Footer with button */}
        <div className="mt-auto flex gap-1 sm:gap-2 pt-2 sm:pt-4 border-t border-gray-200 dark:border-dark-700">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAnalyze(paper)
            }}
            disabled={isAnalyzing}
            className="flex-1 px-2 sm:px-4 py-1 sm:py-2 bg-blue-600 dark:bg-primary-600 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white text-xs sm:text-sm font-medium rounded transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-3 sm:h-4 w-3 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden sm:inline">Analyzing...</span>
              </>
            ) : (
              <>
                <svg className="w-3 sm:w-4 h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Analyze</span>
              </>
            )}
          </button>
          {paper.url && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.open(paper.url, '_blank', 'noopener,noreferrer')
              }}
              className="px-1.5 sm:px-3 py-1 sm:py-2 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xs sm:text-sm font-medium rounded transition-all duration-200 flex items-center gap-1"
              title="Open full paper in new tab"
            >
              <svg className="w-3 sm:w-4 h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden sm:inline">Link</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

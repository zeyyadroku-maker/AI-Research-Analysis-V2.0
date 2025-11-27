'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DetailedAnalysisView from '@/app/components/DetailedAnalysisView'
import Navigation from '@/app/components/Navigation'
import { BookmarkedPaper, AnalysisResult } from '@/app/types'
import { getBookmarks, removeBookmark } from '@/app/lib/bookmarks'

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedPaper[]>([])
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBookmarks = async () => {
      const data = await getBookmarks()
      setBookmarks(data)
      setIsLoading(false)
    }
    fetchBookmarks()
  }, [])

  const handleRemoveBookmark = async (id: string) => {
    await removeBookmark(id)
    const data = await getBookmarks()
    setBookmarks(data)
  }

  const handleViewAnalysis = (analysis: AnalysisResult) => {
    setSelectedAnalysis(analysis)
  }

  const getMaxWeight = (analysis: AnalysisResult) => {
    return (
      analysis.credibility.methodologicalRigor.maxScore +
      analysis.credibility.dataTransparency.maxScore +
      analysis.credibility.sourceQuality.maxScore +
      analysis.credibility.authorCredibility.maxScore +
      analysis.credibility.statisticalValidity.maxScore +
      analysis.credibility.logicalConsistency.maxScore
    )
  }

  const getRating = (percentage: number) => {
    if (percentage >= 90) return 'Exemplary'
    if (percentage >= 70) return 'Strong'
    if (percentage >= 50) return 'Moderate'
    if (percentage >= 30) return 'Weak'
    return 'Very Poor'
  }

  return (
    <main className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Saved Papers
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {bookmarks.length} paper{bookmarks.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Bookmarks List */}
        {isLoading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg">
            <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z" />
            </svg>
            <h3 className="text-2xl font-medium text-gray-700 dark:text-gray-300 mb-2">No bookmarks yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Start analyzing papers and bookmark the ones you find interesting</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/50"
            >
              Search Papers
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => {
              const maxScore = bookmark.analysis.credibility.maxTotalScore || getMaxWeight(bookmark.analysis)
              const percentage = Math.round((bookmark.analysis.credibility.totalScore / maxScore) * 100)
              const rating = getRating(percentage)

              return (
                <div
                  key={bookmark.id}
                  className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-6 hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20 group animate-slide-up"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4 sm:gap-0">
                    <div className="flex-1 sm:mr-4 w-full">
                      <button
                        onClick={() => {
                          const url = bookmark.analysis.paper.url ||
                            (bookmark.analysis.paper.doi ? `https://doi.org/${bookmark.analysis.paper.doi}` : null)
                          if (url) {
                            window.open(url, '_blank')
                          }
                        }}
                        disabled={!bookmark.analysis.paper.url && !bookmark.analysis.paper.doi}
                        className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2 mb-2 text-left bg-none border-none p-0 cursor-pointer hover:underline disabled:cursor-default disabled:opacity-75 disabled:hover:no-underline"
                      >
                        {bookmark.analysis.paper.title}
                      </button>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {bookmark.analysis.paper.authors.slice(0, 3).join(', ')}
                        {bookmark.analysis.paper.authors.length > 3 && ` +${bookmark.analysis.paper.authors.length - 3} more`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {bookmark.analysis.paper.journal} • {bookmark.analysis.paper.year}
                      </p>
                    </div>

                    {/* Credibility Score Badge */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 border-gray-100 dark:border-dark-700 pt-3 sm:pt-0">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:hidden">Credibility Score</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600 mb-1">
                          {bookmark.analysis.credibility.totalScore.toFixed(1)}/{maxScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {percentage}% • {rating}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bias Level */}
                  <div className="flex gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-dark-700">
                    <div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Bias Level</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${bookmark.analysis.bias.overallLevel === 'Low'
                        ? 'bg-green-900 text-green-200'
                        : bookmark.analysis.bias.overallLevel === 'Medium'
                          ? 'bg-yellow-900 text-yellow-200'
                          : 'bg-red-900 text-red-200'
                        }`}>
                        {bookmark.analysis.bias.overallLevel}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">Bookmarked</span>
                      <span className="text-xs text-gray-300">
                        {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {bookmark.notes && (
                    <div className="mb-4 bg-gray-100 dark:bg-dark-700 rounded p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Your Notes</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{bookmark.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewAnalysis(bookmark.analysis)}
                      className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/50 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Analysis
                    </button>
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.id)}
                      className="px-4 py-2 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium rounded transition-all duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Analysis Modal */}
      {selectedAnalysis && (
        <DetailedAnalysisView
          analysis={selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
        />
      )}
    </main>
  )
}

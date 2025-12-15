'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookmarkedPaper, AnalysisResult } from '@/app/types'
import Navigation from '@/app/components/Navigation'
import { getBookmarks } from '@/app/lib/bookmarks'

export default function InsightsPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedPaper[]>([])
  const [loading, setLoading] = useState(true)

  // Load bookmarks from Supabase
  const loadBookmarks = async () => {
    try {
      const data = await getBookmarks()
      setBookmarks(data)
    } catch (error) {
      console.error('Error loading bookmarks:', error)
      setBookmarks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookmarks()
  }, [])

  const getMaxWeight = (analysis: AnalysisResult) => {
    if (analysis.credibility.maxTotalScore) return analysis.credibility.maxTotalScore
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

  // Calculate statistics
  const totalPapers = bookmarks.length
  let totalScoreSum = 0
  let totalMaxScoreSum = 0
  let highBiasCount = 0
  const byField: Record<string, number> = {}
  const byDocType: Record<string, number> = {}
  const credibilityDistribution = {
    exemplary: 0,
    strong: 0,
    moderate: 0,
    weak: 0,
    veryPoor: 0,
  }

  bookmarks.forEach(b => {
    const maxScore = getMaxWeight(b.analysis)
    const score = b.analysis.credibility.totalScore
    totalScoreSum += score
    totalMaxScoreSum += maxScore

    if (b.analysis.bias.overallLevel === 'High') highBiasCount++

    const field = b.analysis.paper.field || 'Unknown'
    const docType = b.analysis.paper.documentType || 'Unknown'
    byField[field] = (byField[field] || 0) + 1
    byDocType[docType] = (byDocType[docType] || 0) + 1

    const percentage = Math.round((score / maxScore) * 100)
    const rating = getRating(percentage)

    if (rating === 'Exemplary') credibilityDistribution.exemplary++
    else if (rating === 'Strong') credibilityDistribution.strong++
    else if (rating === 'Moderate') credibilityDistribution.moderate++
    else if (rating === 'Weak') credibilityDistribution.weak++
    else credibilityDistribution.veryPoor++
  })


  const avgBiasLevel = totalPapers > 0 ? (highBiasCount / totalPapers) * 100 : 0

  return (
    <main className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Analysis Insights Dashboard</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Statistics and insights from your bookmarked research papers</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-400">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading insights...
            </div>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v16a2 2 0 0 0 2 2h16" />
              <rect x="7" y="13" width="9" height="4" rx="1" />
              <rect x="7" y="5" width="12" height="4" rx="1" />
            </svg>
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">No Insights Available Yet</h3>
            <p className="text-gray-600 dark:text-gray-500 mb-6">Bookmark papers to see insights and statistics here</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Browse Papers
            </Link>
          </div>
        ) : (
          <>
            {/* Key Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-3 sm:p-6">
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Total Papers</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{totalPapers}</p>
              </div>
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-3 sm:p-6">
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Avg Credibility</p>
                <p className="text-xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  {totalPapers > 0 ? Math.round((totalScoreSum / totalMaxScoreSum) * 100) : 0}%
                </p>
              </div>
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-3 sm:p-6">
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">High Bias Papers</p>
                <p className="text-xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400">{Math.round(avgBiasLevel)}%</p>
              </div>
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-3 sm:p-6">
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Unique Fields</p>
                <p className="text-xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">{Object.keys(byField).length}</p>
              </div>
            </div>

            {/* Credibility Distribution */}
            <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-3 sm:p-6 mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Credibility Distribution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">{credibilityDistribution.exemplary}</div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Exemplary</p>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">{credibilityDistribution.strong}</div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Strong</p>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400">{credibilityDistribution.moderate}</div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Moderate</p>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400">{credibilityDistribution.weak}</div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Weak</p>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400">{credibilityDistribution.veryPoor}</div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Very Poor</p>
                </div>
              </div>
            </div>

            {/* Field Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-3 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Papers by Field</h3>
                <div className="space-y-2 sm:space-y-3">
                  {Object.entries(byField)
                    .sort(([, a], [, b]) => b - a)
                    .map(([field, count]) => (
                      <div key={field} className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm truncate">{field.replace(/-/g, ' ')}</span>
                        <div className="flex items-center gap-2 sm:gap-3 ml-2">
                          <div className="w-16 sm:w-32 h-2 bg-gray-300 dark:bg-dark-700 rounded overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500"
                              style={{ width: `${(count / totalPapers) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm w-6 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-3 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Papers by Type</h3>
                <div className="space-y-2 sm:space-y-3">
                  {Object.entries(byDocType)
                    .sort(([, a], [, b]) => b - a)
                    .map(([docType, count]) => (
                      <div key={docType} className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm capitalize truncate">{docType.replace(/-/g, ' ')}</span>
                        <div className="flex items-center gap-2 sm:gap-3 ml-2">
                          <div className="w-16 sm:w-32 h-2 bg-gray-300 dark:bg-dark-700 rounded overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500"
                              style={{ width: `${(count / totalPapers) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm w-6 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Recent Papers */}
            <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Recent Bookmarks</h3>
              <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                {bookmarks
                  .sort((a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime())
                  .slice(0, 10)
                  .map((paper) => {
                    const maxScore = getMaxWeight(paper.analysis)
                    const percentage = Math.round((paper.analysis.credibility.totalScore / maxScore) * 100)
                    const rating = getRating(percentage)

                    return (
                      <div key={paper.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-start p-2 sm:p-3 bg-gray-100 dark:bg-dark-700 rounded border border-gray-300 dark:border-dark-600">
                        <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{paper.analysis.paper.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                            {paper.analysis.paper.authors.slice(0, 2).join(', ')}
                            {paper.analysis.paper.authors.length > 2 && ' +more'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 sm:ml-4 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                              {paper.analysis.credibility.totalScore.toFixed(1)}/{maxScore.toFixed(1)}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{rating}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

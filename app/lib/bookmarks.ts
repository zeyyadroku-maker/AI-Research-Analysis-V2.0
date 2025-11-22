import { BookmarkedPaper, AnalysisResult } from '@/app/types'

const BOOKMARKS_KEY = 'research_analysis_bookmarks'

export function getBookmarks(): BookmarkedPaper[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to get bookmarks:', error)
    return []
  }
}

export function saveBookmark(analysis: AnalysisResult, notes?: string): BookmarkedPaper {
  const bookmarks = getBookmarks()

  const bookmarkedPaper: BookmarkedPaper = {
    id: `${analysis.paper.id}-${Date.now()}`,
    analysis,
    bookmarkedAt: new Date().toISOString(),
    notes,
  }

  bookmarks.push(bookmarkedPaper)

  if (typeof window !== 'undefined') {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))
  }

  return bookmarkedPaper
}

export function removeBookmark(id: string): void {
  const bookmarks = getBookmarks()
  const filtered = bookmarks.filter(b => b.id !== id)

  if (typeof window !== 'undefined') {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered))
  }
}

export function isBookmarked(paperId: string): boolean {
  const bookmarks = getBookmarks()
  return bookmarks.some(b => b.analysis.paper.id === paperId)
}

export function getBookmark(paperId: string): BookmarkedPaper | undefined {
  const bookmarks = getBookmarks()
  return bookmarks.find(b => b.analysis.paper.id === paperId)
}

export function updateBookmarkNotes(id: string, notes: string): void {
  const bookmarks = getBookmarks()
  const bookmark = bookmarks.find(b => b.id === id)

  if (bookmark) {
    bookmark.notes = notes
    if (typeof window !== 'undefined') {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))
    }
  }
}

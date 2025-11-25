import { BookmarkedPaper, AnalysisResult } from '@/app/types'
import { supabase } from '@/app/lib/supabase'

// Helper to get a client ID for anonymous users
function getClientId(): string {
  if (typeof window === 'undefined') return 'server-side'
  let clientId = localStorage.getItem('research_client_id')
  if (!clientId) {
    clientId = crypto.randomUUID()
    localStorage.setItem('research_client_id', clientId)
  }
  return clientId
}

export async function getBookmarks(): Promise<BookmarkedPaper[]> {
  const clientId = getClientId()

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookmarks:', error)
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    analysis: item.analysis_data,
    bookmarkedAt: item.created_at,
    notes: item.notes
  }))
}

export async function saveBookmark(analysis: AnalysisResult, notes?: string): Promise<BookmarkedPaper | null> {
  const clientId = getClientId()

  // Check if already bookmarked using limit(1) to avoid 406 on duplicates
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('client_id', clientId)
    .eq('paper_id', analysis.paper.id)
    .limit(1)

  if (existing && existing.length > 0) {
    console.log('Paper already bookmarked')
    return null
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert({
      paper_id: analysis.paper.id,
      analysis_data: analysis,
      notes: notes,
      client_id: clientId
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving bookmark:', error)
    return null
  }

  return {
    id: data.id,
    analysis: data.analysis_data,
    bookmarkedAt: data.created_at,
    notes: data.notes
  }
}

export async function removeBookmark(id: string): Promise<void> {
  const clientId = getClientId()

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)
    .eq('client_id', clientId)

  if (error) {
    console.error('Error removing bookmark:', error)
  }
}

export async function isBookmarked(paperId: string): Promise<boolean> {
  const clientId = getClientId()

  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('client_id', clientId)
    .eq('paper_id', paperId)
    .limit(1)

  if (error) {
    console.error('Error checking bookmark status:', error)
    return false
  }

  return data && data.length > 0
}

export async function getBookmark(paperId: string): Promise<BookmarkedPaper | undefined> {
  const clientId = getClientId()

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('client_id', clientId)
    .eq('paper_id', paperId)
    .limit(1)

  if (error || !data || data.length === 0) {
    return undefined
  }

  const item = data[0]
  return {
    id: item.id,
    analysis: item.analysis_data,
    bookmarkedAt: item.created_at,
    notes: item.notes
  }
}

export async function updateBookmarkNotes(id: string, notes: string): Promise<void> {
  const clientId = getClientId()

  const { error } = await supabase
    .from('bookmarks')
    .update({ notes })
    .eq('id', id)
    .eq('client_id', clientId)

  if (error) {
    console.error('Error updating notes:', error)
  }
}

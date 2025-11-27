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

// Helper to get the current user ID if authenticated
async function getUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id || null
}

export async function getBookmarks(): Promise<BookmarkedPaper[]> {
  const userId = await getUserId()
  const clientId = getClientId()

  let query = supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  } else {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching bookmarks:', JSON.stringify(error, null, 2))
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
  const userId = await getUserId()
  const clientId = getClientId()

  // Check if already bookmarked
  let checkQuery = supabase
    .from('bookmarks')
    .select('id')
    .eq('paper_id', analysis.paper.id)
    .limit(1)

  if (userId) {
    checkQuery = checkQuery.eq('user_id', userId)
  } else {
    checkQuery = checkQuery.eq('client_id', clientId)
  }

  const { data: existing } = await checkQuery

  if (existing && existing.length > 0) {
    console.log('Paper already bookmarked')
    return null
  }

  // If authenticated, check if this paper exists in ANY bookmark to reuse analysis (optional optimization, 
  // but we already have the analysis object passed in, so we just save it).
  // The requirement "reuse the existing analysis from cache" is implicitly handled because 
  // the 'analysis' object passed here likely came from the cache if the user just viewed it.

  const insertData: any = {
    paper_id: analysis.paper.id,
    analysis_data: analysis,
    notes: notes,
  }

  if (userId) {
    insertData.user_id = userId
    // We can also store client_id as fallback or for tracking
    insertData.client_id = clientId
  } else {
    insertData.client_id = clientId
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error saving bookmark:', JSON.stringify(error, null, 2))
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
  const userId = await getUserId()
  const clientId = getClientId()

  // We need to handle removing by ID. 
  // If we are using the bookmark's UUID, that's unique enough.
  // But for safety, we should ensure the user owns it.

  let query = supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)

  if (userId) {
    query = query.eq('user_id', userId)
  } else {
    query = query.eq('client_id', clientId)
  }

  const { error } = await query

  if (error) {
    console.error('Error removing bookmark:', error)
  }
}

export async function isBookmarked(paperId: string): Promise<boolean> {
  const userId = await getUserId()
  const clientId = getClientId()

  let query = supabase
    .from('bookmarks')
    .select('id')
    .eq('paper_id', paperId)
    .limit(1)

  if (userId) {
    query = query.eq('user_id', userId)
  } else {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error checking bookmark status:', error)
    return false
  }

  return data && data.length > 0
}

export async function getBookmark(paperId: string): Promise<BookmarkedPaper | undefined> {
  const userId = await getUserId()
  const clientId = getClientId()

  let query = supabase
    .from('bookmarks')
    .select('*')
    .eq('paper_id', paperId)
    .limit(1)

  if (userId) {
    query = query.eq('user_id', userId)
  } else {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query

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
  const userId = await getUserId()
  const clientId = getClientId()

  let query = supabase
    .from('bookmarks')
    .update({ notes })
    .eq('id', id)

  if (userId) {
    query = query.eq('user_id', userId)
  } else {
    query = query.eq('client_id', clientId)
  }

  const { error } = await query

  if (error) {
    console.error('Error updating notes:', error)
  }
}

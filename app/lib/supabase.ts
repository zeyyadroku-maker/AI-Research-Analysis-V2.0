import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('[Supabase Config] URL:', supabaseUrl ? 'Loaded' : 'Missing')
console.log('[Supabase Config] Key:', supabaseAnonKey ? 'Loaded' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing. Please check your .env.local file or Vercel project settings.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing. Please check your .env.local file or Vercel project settings.')
}

// Create a client with empty strings if env vars are missing to prevent immediate crash,
// but log the error above. This allows the app to render error states instead of blank screen.
export const supabase = createBrowserClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
)

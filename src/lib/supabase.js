import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

let supabase
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} catch (e) {
  console.warn('Supabase client init failed, using local mode:', e)
  supabase = null
}

export { supabase }

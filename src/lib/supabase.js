import { createClient } from '@supabase/supabase-js'

// Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ztcvqqwckiunvdkkvzqd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3ZxcXdja2l1bnZka2t2enFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NDUzODIsImV4cCI6MjEwNTQyMTM4Mn0.wn1fypn0fvd6CUTxPjU_dAoG4RPgMoSvZXvlVuH2Xxw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Standard RFC4122 UUID v4 Generator
 */
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Check if connection to Supabase is active and tables are accessible
 */
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('medicines').select('id', { count: 'exact', head: true })
    if (error) {
      console.warn('Supabase table check notice:', error.message)
      return { connected: false, error: error.message }
    }
    return { connected: true }
  } catch (err) {
    console.warn('Supabase connection error:', err)
    return { connected: false, error: err.message || 'Connection failed' }
  }
}

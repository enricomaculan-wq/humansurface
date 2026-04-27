import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function getSupabaseServerConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return { supabaseUrl, supabaseAnonKey }
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const { supabaseUrl, supabaseAnonKey } = getSupabaseServerConfig()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {
      },
    },
  })
}

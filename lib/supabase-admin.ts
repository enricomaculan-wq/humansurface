import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function getSupabaseAdminConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }

  return { supabaseUrl, serviceRoleKey }
}

let supabaseAdminClient: SupabaseClient | null = null

export function getSupabaseAdmin() {
  if (!supabaseAdminClient) {
    const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig()

    supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return supabaseAdminClient
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin()
    const value = Reflect.get(client, prop, client)

    return typeof value === 'function' ? value.bind(client) : value
  },
})

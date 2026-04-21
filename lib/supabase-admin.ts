import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const rawServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('SERVICE ROLE PRESENT', !!rawServiceRoleKey)

if (!rawSupabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!rawServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

const supabaseUrl: string = rawSupabaseUrl
const serviceRoleKey: string = rawServiceRoleKey

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
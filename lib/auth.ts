import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return null
  }

  return data.user
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}
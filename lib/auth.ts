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

function getAdminEmails() {
  return [
    process.env.ADMIN_EMAIL,
    process.env.ADMIN_EMAIL_2,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())
}

export async function requireAdminUser() {
  const user = await requireAuthenticatedUser()
  const userEmail = user.email?.trim().toLowerCase() ?? ''
  const adminEmails = getAdminEmails()

  if (!userEmail || adminEmails.length === 0 || !adminEmails.includes(userEmail)) {
    throw new Error('Forbidden')
  }

  return user
}
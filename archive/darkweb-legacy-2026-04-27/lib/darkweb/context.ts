import { createSupabaseAuthServerClient } from '@/lib/supabase-auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function isMissingRefreshTokenError(error: unknown) {
  return (
    !!error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string' &&
    (
      (error as { message: string }).message.includes('Refresh Token Not Found') ||
      (error as { message: string }).message.includes('Invalid Refresh Token')
    )
  )
}

export async function getCurrentDarkwebContext() {
  const supabase = await createSupabaseAuthServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    if (isMissingRefreshTokenError(userError)) {
      return null
    }
    throw userError
  }

  if (!user) {
    return null
  }

  const { data: companyUser, error: companyUserError } = await supabaseAdmin
    .from('company_users')
    .select('company_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (companyUserError) {
    throw companyUserError
  }

  if (!companyUser?.company_id) {
    return null
  }

  const { data: company, error: companyError } = await supabaseAdmin
    .from('companies')
    .select('id, name, domain')
    .eq('id', companyUser.company_id)
    .maybeSingle()

  if (companyError) {
    throw companyError
  }

  if (!company?.domain) {
    return null
  }

  const { data: organization, error: organizationError } = await supabaseAdmin
    .from('organizations')
    .select('id, name, domain')
    .eq('domain', company.domain)
    .maybeSingle()

  if (organizationError) {
    throw organizationError
  }

  if (!organization?.id) {
    return null
  }

  const { data: assessment, error: assessmentError } = await supabaseAdmin
    .from('assessments')
    .select(`
      id,
      organization_id,
      slug,
      status,
      overall_score,
      overall_risk_level,
      executive_summary,
      what_changed,
      created_at,
      updated_at
    `)
    .eq('organization_id', organization.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (assessmentError) {
    throw assessmentError
  }

  return {
    user,
    company,
    organization,
    assessment,
  }
}

export async function requireCurrentDarkwebContext() {
  const context = await getCurrentDarkwebContext()

  if (!context?.user) {
    throw new Error('No authenticated user found for dark web context.')
  }

  if (!context.company?.id) {
    throw new Error('No company linked to the current user.')
  }

  if (!context.organization?.id) {
    throw new Error('No organization matched the current company domain.')
  }

  return context
}
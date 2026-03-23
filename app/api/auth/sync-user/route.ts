import { NextResponse } from 'next/server'
import { createSupabaseAuthServerClient } from '@/lib/supabase-auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST() {
  try {
    const supabase = await createSupabaseAuthServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      return NextResponse.json(
        { error: `Auth user lookup failed: ${userError.message}` },
        { status: 500 },
      )
    }

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 })
    }

    const email = user.email.toLowerCase()

    const { data: existingCompanyUser, error: companyUserError } = await supabaseAdmin
      .from('company_users')
      .select('id, auth_user_id')
      .eq('email', email)
      .maybeSingle()

    if (companyUserError) {
      return NextResponse.json(
        { error: `Company user lookup failed: ${companyUserError.message}` },
        { status: 500 },
      )
    }

    if (existingCompanyUser?.id) {
      if (!existingCompanyUser.auth_user_id) {
        const { error: updateError } = await supabaseAdmin
          .from('company_users')
          .update({
            auth_user_id: user.id,
          })
          .eq('id', existingCompanyUser.id)

        if (updateError) {
          return NextResponse.json(
            { error: `Company user update failed: ${updateError.message}` },
            { status: 500 },
          )
        }
      }

      return NextResponse.json({ ok: true, linked: true })
    }

    return NextResponse.json({ ok: true, linked: false })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected sync error',
      },
      { status: 500 },
    )
  }
}
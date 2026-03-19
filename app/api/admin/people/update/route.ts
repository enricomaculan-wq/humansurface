import { NextResponse } from 'next/server'
import { requireAuthenticatedUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    await requireAuthenticatedUser()

    const body = await req.json()

    const id = typeof body?.id === 'string' ? body.id.trim() : ''
    const fullName =
      typeof body?.fullName === 'string' && body.fullName.trim().length > 0
        ? body.fullName.trim()
        : null
    const roleTitle =
      typeof body?.roleTitle === 'string' ? body.roleTitle.trim() : ''
    const department =
      typeof body?.department === 'string' && body.department.trim().length > 0
        ? body.department.trim()
        : null
    const email =
      typeof body?.email === 'string' && body.email.trim().length > 0
        ? body.email.trim().toLowerCase()
        : null
    const isKeyPerson = Boolean(body?.isKeyPerson)

    if (!id) {
      return NextResponse.json(
        { error: 'Person ID is required.' },
        { status: 400 },
      )
    }

    if (!roleTitle) {
      return NextResponse.json(
        { error: 'Role title is required.' },
        { status: 400 },
      )
    }

    const { error } = await supabaseAdmin
      .from('people')
      .update({
        full_name: fullName,
        role_title: roleTitle,
        department,
        email,
        is_key_person: isKeyPerson,
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error.'

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
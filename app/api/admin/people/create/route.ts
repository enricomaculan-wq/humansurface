import { NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    await requireAdminUser()

    const body = await req.json()

    const organizationId =
      typeof body?.organizationId === 'string' ? body.organizationId.trim() : ''
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

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization is required.' },
        { status: 400 },
      )
    }

    if (!roleTitle) {
      return NextResponse.json(
        { error: 'Role title is required.' },
        { status: 400 },
      )
    }

    const { error } = await supabaseAdmin.from('people').insert({
      organization_id: organizationId,
      full_name: fullName,
      role_title: roleTitle,
      department,
      email,
      is_key_person: isKeyPerson,
    })

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

    if (message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }


    return NextResponse.json({ error: message }, { status: 500 })
  }
}
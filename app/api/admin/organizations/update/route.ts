import { NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    await requireAdminUser()

    const body = await req.json()

    const id = typeof body?.id === 'string' ? body.id.trim() : ''
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const domain =
      typeof body?.domain === 'string' ? body.domain.trim().toLowerCase() : ''
    const industry =
      typeof body?.industry === 'string' && body.industry.trim().length > 0
        ? body.industry.trim()
        : null

    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID is required.' },
        { status: 400 },
      )
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Company name is required.' },
        { status: 400 },
      )
    }

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required.' },
        { status: 400 },
      )
    }

    const { error } = await supabaseAdmin
      .from('organizations')
      .update({
        name,
        domain,
        industry,
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

    if (message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }


    return NextResponse.json({ error: message }, { status: 500 })
  }
}
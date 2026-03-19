import { NextResponse } from 'next/server'
import { requireAuthenticatedUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    await requireAuthenticatedUser()

    const body = await req.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const domain = typeof body?.domain === 'string' ? body.domain.trim().toLowerCase() : ''
    const industry =
      typeof body?.industry === 'string' && body.industry.trim().length > 0
        ? body.industry.trim()
        : null

    if (!name) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
    }

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required.' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('organizations').insert({
      name,
      domain,
      industry,
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

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
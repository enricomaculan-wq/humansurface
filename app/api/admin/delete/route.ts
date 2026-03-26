import { NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

type AllowedTable =
  | 'organizations'
  | 'assessments'
  | 'people'
  | 'findings'
  | 'scores'
  | 'remediation_tasks'

const ALLOWED_TABLES: AllowedTable[] = [
  'organizations',
  'assessments',
  'people',
  'findings',
  'scores',
  'remediation_tasks',
]

export async function POST(req: Request) {
  try {
    await requireAdminUser()

    const body = await req.json()
    const table = body?.table as AllowedTable | undefined
    const id = typeof body?.id === 'string' ? body.id.trim() : ''

    if (!table || !ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Invalid table.' }, { status: 400 })
    }

    if (!id) {
      return NextResponse.json({ error: 'ID is required.' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from(table).delete().eq('id', id)

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
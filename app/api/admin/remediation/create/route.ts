import { NextResponse } from 'next/server'
import { requireAuthenticatedUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    await requireAuthenticatedUser()

    const body = await req.json()

    const assessmentId =
      typeof body?.assessmentId === 'string' ? body.assessmentId.trim() : ''
    const title =
      typeof body?.title === 'string' ? body.title.trim() : ''
    const priority =
      typeof body?.priority === 'string' ? body.priority.trim() : 'medium'
    const effort =
      typeof body?.effort === 'string' ? body.effort.trim() : 'medium'
    const impact =
      typeof body?.impact === 'string' ? body.impact.trim() : 'medium'
    const status =
      typeof body?.status === 'string' ? body.status.trim() : 'open'

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Assessment is required.' },
        { status: 400 },
      )
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Task title is required.' },
        { status: 400 },
      )
    }

    const { error } = await supabaseAdmin.from('remediation_tasks').insert({
      assessment_id: assessmentId,
      title,
      priority,
      effort,
      impact,
      status,
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
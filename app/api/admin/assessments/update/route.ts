import { NextResponse } from 'next/server'
import { requireAuthenticatedUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    await requireAuthenticatedUser()

    const body = await req.json()

    const id = typeof body?.id === 'string' ? body.id.trim() : ''
    const status = typeof body?.status === 'string' ? body.status.trim() : ''
    const overallRiskLevel =
      typeof body?.overallRiskLevel === 'string'
        ? body.overallRiskLevel.trim()
        : ''

    const parsedScore =
      typeof body?.overallScore === 'number'
        ? body.overallScore
        : Number(body?.overallScore)

    if (!id) {
      return NextResponse.json({ error: 'Assessment ID is required.' }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required.' }, { status: 400 })
    }

    if (!['low', 'medium', 'high'].includes(overallRiskLevel)) {
      return NextResponse.json({ error: 'Invalid risk level.' }, { status: 400 })
    }

    const safeScore = Number.isNaN(parsedScore)
      ? 0
      : Math.max(0, Math.min(100, Math.round(parsedScore)))

    const { error } = await supabaseAdmin
      .from('assessments')
      .update({
        status,
        overall_score: safeScore,
        overall_risk_level: overallRiskLevel,
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
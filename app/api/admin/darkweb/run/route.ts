import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminUser } from '@/lib/auth'
import { coerceDarkwebRawIngestionInputs } from '@/lib/darkweb/ingest'
import { runInternalDarkwebPipeline } from '@/lib/darkweb/pipeline'
import { supabaseAdmin } from '@/lib/supabase-admin'

type AssessmentLookup = {
  id: string
  organization_id: string | null
}

export async function POST(request: Request) {
  let assessmentId = ''
  let organizationId: string | null = null
  let rawResultCount = 0

  try {
    await requireAdminUser()

    const body = await request.json().catch(() => ({}))
    assessmentId =
      typeof body?.assessmentId === 'string' ? body.assessmentId.trim() : ''

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'assessmentId is required.' },
        { status: 400 },
      )
    }

    const { data: assessmentData, error: assessmentError } = await supabaseAdmin
      .from('assessments')
      .select('id, organization_id')
      .eq('id', assessmentId)
      .maybeSingle()

    if (assessmentError) {
      console.error('[darkweb-run] assessment lookup failed', {
        assessmentId,
        error: assessmentError,
      })

      return NextResponse.json(
        { error: `Assessment lookup failed: ${assessmentError.message}` },
        { status: 500 },
      )
    }

    const assessment = assessmentData as AssessmentLookup | null

    if (!assessment?.organization_id) {
      return NextResponse.json(
        { error: 'Assessment not found or missing organization.' },
        { status: 404 },
      )
    }

    organizationId = assessment.organization_id
    const rawResults = coerceDarkwebRawIngestionInputs(body?.rawResults)
    rawResultCount = rawResults.length
    const result = await runInternalDarkwebPipeline({
      organizationId,
      assessmentId,
      triggerSource: 'manual',
      rawResults,
      metadata: {
        admin_triggered: true,
        raw_result_input_count: rawResultCount,
      },
    })

    revalidatePath(`/admin/assessments/${assessmentId}`)

    return NextResponse.json({
      ok: true,
      runId: result.run.id,
      seedCount: result.seeds.length,
      rawResultCount: result.rawResults.length,
      findingCount: result.findings.length,
      score: result.score.score,
      riskLevel: result.score.riskLevel,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected dark web run error.'

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.error('[darkweb-run] pipeline trigger failed', {
      assessmentId: assessmentId || null,
      organizationId,
      rawResultCount,
      error,
    })

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

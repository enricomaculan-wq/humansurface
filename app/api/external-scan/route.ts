import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { runExternalPublicScanForAssessment } from '@/lib/scanner/run-external-scan'

type AssessmentLookupRow = {
  id: string
  organization_id: string | null
  scan_diagnostics?: Record<string, unknown> | null
}

export async function POST(request: NextRequest) {
  let assessmentId = ''

  try {
    const body = await request.json()

    assessmentId =
      typeof body?.assessmentId === 'string' ? body.assessmentId.trim() : ''

    let organizationId =
      typeof body?.organizationId === 'string' ? body.organizationId.trim() : ''

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'assessmentId is required.' },
        { status: 400 },
      )
    }

    if (!organizationId) {
      const { data: assessmentData, error: assessmentError } = await supabaseAdmin
        .from('assessments')
        .select('id, organization_id, scan_diagnostics')
        .eq('id', assessmentId)
        .maybeSingle()

      if (assessmentError) {
        return NextResponse.json(
          { error: `Assessment lookup failed: ${assessmentError.message}` },
          { status: 500 },
        )
      }

      if (!assessmentData) {
        return NextResponse.json(
          { error: 'Assessment not found.' },
          { status: 404 },
        )
      }

      const assessment = assessmentData as AssessmentLookupRow
      organizationId = assessment.organization_id ?? ''

      if (!organizationId) {
        return NextResponse.json(
          { error: 'organizationId could not be resolved from assessment.' },
          { status: 400 },
        )
      }
    }

    await supabaseAdmin
      .from('assessments')
      .update({
        status: 'draft',
      })
      .eq('id', assessmentId)

    const result = await runExternalPublicScanForAssessment(
      assessmentId,
      organizationId,
    )

    const { data: currentAssessmentData } = await supabaseAdmin
      .from('assessments')
      .select('scan_diagnostics')
      .eq('id', assessmentId)
      .maybeSingle()

    const existingDiagnostics =
      (currentAssessmentData?.scan_diagnostics as Record<string, unknown> | null) ?? {}

    await supabaseAdmin
      .from('assessments')
      .update({
        status: 'in_review',
        scan_diagnostics: {
          ...existingDiagnostics,
          externalScanTriggeredAt:
            (existingDiagnostics.externalScanTriggeredAt as string | undefined) ??
            new Date().toISOString(),
          externalScanCompletedAt: new Date().toISOString(),
        },
      })
      .eq('id', assessmentId)

    return NextResponse.json({
      ok: true,
      result,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown external scan error'

    if (assessmentId) {
      const { data: currentAssessmentData } = await supabaseAdmin
        .from('assessments')
        .select('scan_diagnostics')
        .eq('id', assessmentId)
        .maybeSingle()

      const existingDiagnostics =
        (currentAssessmentData?.scan_diagnostics as Record<string, unknown> | null) ?? {}

      await supabaseAdmin
        .from('assessments')
        .update({
          status: 'draft',
          scan_diagnostics: {
            ...existingDiagnostics,
            error: message,
            failedAt: new Date().toISOString(),
          },
        })
        .eq('id', assessmentId)
    }

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    )
  }
}
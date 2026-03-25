import { NextResponse } from 'next/server'
import { requireAuthenticatedUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  canTransitionAssessmentStatus,
  type AssessmentStatus,
} from '@/lib/assessments/assessment-status'

type AssessmentRow = {
  id: string
  organization_id: string | null
  status: string
  overall_score: number | null
  overall_risk_level: 'low' | 'medium' | 'high' | 'critical' | null
  created_at: string | null
  updated_at?: string | null
  published_at?: string | null
  executive_summary?: string | null
  what_changed?: unknown
}

type AssessmentOrderRow = {
  id: string
  assessment_id: string | null
}

type FindingRow = {
  id: string
  assessment_id: string
}

type ScoreRow = {
  id: string
  assessment_id: string
  person_id: string | null
  score_type: string
  score_value: number
  risk_level: string
}

const ALLOWED_STATUSES: AssessmentStatus[] = [
  'draft',
  'in_review',
  'published',
  'archived',
]

const ALLOWED_RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const

function normalizeIncomingStatus(value: string): AssessmentStatus | null {
  switch (value) {
    case 'draft':
      return 'draft'
    case 'in_review':
      return 'in_review'
    case 'published':
      return 'published'
    case 'archived':
      return 'archived'
    case 'completed':
      return 'in_review'
    case 'running':
      return 'draft'
    case 'failed':
      return 'draft'
    default:
      return null
  }
}

function normalizeStoredStatus(value: string): AssessmentStatus | null {
  return ALLOWED_STATUSES.includes(value as AssessmentStatus)
    ? (value as AssessmentStatus)
    : normalizeIncomingStatus(value)
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function validateAssessmentForPublishRealSchema(input: {
  assessment: AssessmentRow
  orders: AssessmentOrderRow[]
  findings: FindingRow[]
  scores: ScoreRow[]
}) {
  const errors: string[] = []
  const warnings: string[] = []

  const { assessment, orders, findings, scores } = input

  const normalizedStatus = normalizeStoredStatus(assessment.status)
  const executiveSummary = normalizeString(assessment.executive_summary)

  const assessmentLevelScores = scores.filter((score) => score.person_id === null)
  const overallScore = assessmentLevelScores.find(
    (score) => score.score_type === 'overall',
  )

  if (normalizedStatus !== 'in_review') {
    errors.push('Assessment must be in review before publication.')
  }

  if (!assessment.organization_id) {
    errors.push('Missing organization association.')
  }

  if (!assessment.overall_risk_level) {
    errors.push('Missing overall risk level.')
  }

  if (!orders.length) {
    errors.push('No linked assessment order found.')
  }

  if (!findings.length) {
    errors.push('At least one finding is required before publication.')
  }

  if (!overallScore) {
    errors.push('An overall assessment-level score is required before publication.')
  }

  if (!executiveSummary) {
    warnings.push('Executive summary is empty.')
  }

  if (findings.length < 3) {
    warnings.push('Fewer than 3 findings are currently available.')
  }

  return {
    canPublish: errors.length === 0,
    errors,
    warnings,
  }
}

export async function POST(req: Request) {
  try {
    await requireAuthenticatedUser()

    const body = await req.json()

    const id = typeof body?.id === 'string' ? body.id.trim() : ''
    const requestedStatusRaw =
      typeof body?.status === 'string' ? body.status.trim() : ''
    const overallRiskLevel =
      typeof body?.overallRiskLevel === 'string'
        ? body.overallRiskLevel.trim().toLowerCase()
        : ''
    const executiveSummary =
      typeof body?.executiveSummary === 'string'
        ? body.executiveSummary.trim()
        : undefined

    const parsedScore =
      typeof body?.overallScore === 'number'
        ? body.overallScore
        : Number(body?.overallScore)

    if (!id) {
      return NextResponse.json(
        { error: 'Assessment ID is required.' },
        { status: 400 },
      )
    }

    const requestedStatus = normalizeIncomingStatus(requestedStatusRaw)
    if (!requestedStatus) {
      return NextResponse.json(
        { error: 'Invalid assessment status.' },
        { status: 400 },
      )
    }

    if (
      !ALLOWED_RISK_LEVELS.includes(
        overallRiskLevel as (typeof ALLOWED_RISK_LEVELS)[number],
      )
    ) {
      return NextResponse.json({ error: 'Invalid risk level.' }, { status: 400 })
    }

    const safeScore = Number.isNaN(parsedScore)
      ? 0
      : Math.max(0, Math.min(100, Math.round(parsedScore)))

    const { data: assessmentData, error: assessmentError } = await supabaseAdmin
      .from('assessments')
      .select(
        `
          id,
          organization_id,
          status,
          overall_score,
          overall_risk_level,
          created_at,
          updated_at,
          published_at,
          executive_summary,
          what_changed
        `,
      )
      .eq('id', id)
      .maybeSingle()

    if (assessmentError) {
      return NextResponse.json({ error: assessmentError.message }, { status: 500 })
    }

    const assessment = assessmentData as AssessmentRow | null

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found.' },
        { status: 404 },
      )
    }

    const currentStatus = normalizeStoredStatus(assessment.status)
    if (!currentStatus) {
      return NextResponse.json(
        { error: 'Current assessment status is invalid.' },
        { status: 400 },
      )
    }

    if (
      currentStatus !== requestedStatus &&
      !canTransitionAssessmentStatus(currentStatus, requestedStatus)
    ) {
      return NextResponse.json(
        {
          error: `Invalid status transition from "${currentStatus}" to "${requestedStatus}".`,
        },
        { status: 400 },
      )
    }

    const now = new Date().toISOString()

    if (requestedStatus === 'published') {
      const [
        { data: ordersData, error: ordersError },
        { data: findingsData, error: findingsError },
        { data: scoresData, error: scoresError },
      ] = await Promise.all([
        supabaseAdmin
          .from('assessment_orders')
          .select('id, assessment_id')
          .eq('assessment_id', id),
        supabaseAdmin
          .from('findings')
          .select('id, assessment_id')
          .eq('assessment_id', id),
        supabaseAdmin
          .from('scores')
          .select('id, assessment_id, person_id, score_type, score_value, risk_level')
          .eq('assessment_id', id),
      ])

      if (ordersError) {
        return NextResponse.json({ error: ordersError.message }, { status: 500 })
      }

      if (findingsError) {
        return NextResponse.json({ error: findingsError.message }, { status: 500 })
      }

      if (scoresError) {
        return NextResponse.json({ error: scoresError.message }, { status: 500 })
      }

      const validation = validateAssessmentForPublishRealSchema({
        assessment: {
          ...assessment,
          status: requestedStatus,
          overall_score: safeScore,
          overall_risk_level: overallRiskLevel as
            | 'low'
            | 'medium'
            | 'high'
            | 'critical',
          executive_summary:
            executiveSummary !== undefined
              ? executiveSummary
              : assessment.executive_summary ?? null,
        },
        orders: (ordersData ?? []) as AssessmentOrderRow[],
        findings: (findingsData ?? []) as FindingRow[],
        scores: (scoresData ?? []) as ScoreRow[],
      })

      if (!validation.canPublish) {
        return NextResponse.json(
          {
            error: 'Assessment cannot be published yet.',
            validation,
          },
          { status: 400 },
        )
      }

      const updatePayload: Record<string, unknown> = {
        status: requestedStatus,
        overall_score: safeScore,
        overall_risk_level: overallRiskLevel,
        published_at: assessment.published_at ?? now,
        updated_at: now,
      }

      if (executiveSummary !== undefined) {
        updatePayload.executive_summary = executiveSummary
      }

      const { error: updateError } = await supabaseAdmin
        .from('assessments')
        .update(updatePayload)
        .eq('id', id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({
        ok: true,
        status: requestedStatus,
        publishedAt: assessment.published_at ?? now,
        validation,
      })
    }

    const updatePayload: Record<string, unknown> = {
      status: requestedStatus,
      overall_score: safeScore,
      overall_risk_level: overallRiskLevel,
      updated_at: now,
    }

    if (executiveSummary !== undefined) {
      updatePayload.executive_summary = executiveSummary
    }

    const { error: updateError } = await supabaseAdmin
      .from('assessments')
      .update(updatePayload)
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      status: requestedStatus,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error.'

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
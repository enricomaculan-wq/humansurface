import Link from 'next/link'
import AdminTopbar from '@/app/components/admin/admin-topbar'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type AssessmentStatus = 'draft' | 'in_review' | 'published' | 'archived'

type Assessment = {
  id: string
  organization_id: string
  status: string
  overall_score: number
  overall_risk_level: string
  created_at: string
  published_at?: string | null
}

type Organization = {
  id: string
  name: string
  domain: string
}

type DarkwebScoreSnapshot = {
  assessment_id: string | null
  run_id: string | null
  score: number
  risk_level: string
  total_findings: number
  created_at: string
}

type DarkwebFindingReviewSignal = {
  assessment_id: string | null
  run_id: string | null
  severity: string
  status: string
  requires_review: boolean
}

type DarkwebAssessmentSignal = {
  latestScore: DarkwebScoreSnapshot | null
  reviewRequiredCount: number
  highSeverityCount: number
}

function normalizeAssessmentStatus(value: string | null | undefined): AssessmentStatus | null {
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
      return 'published'
    case 'running':
      return 'draft'
    case 'failed':
      return 'draft'
    default:
      return null
  }
}

function formatStatusLabel(value: string | null | undefined) {
  if (!value) return 'unknown'
  return value.replace(/_/g, ' ')
}

function RiskBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase()

  const cls =
    normalized === 'critical'
      ? 'border-red-400/20 bg-red-400/10 text-red-200'
      : normalized === 'high'
        ? 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200'
        : normalized === 'medium' || normalized === 'moderate'
          ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
          : 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${cls}`}>
      {formatStatusLabel(value)}
    </span>
  )
}

function StatusBadge({ value }: { value: string | null | undefined }) {
  const normalized = (value ?? 'unknown').toLowerCase()

  const cls =
    normalized === 'published' || normalized === 'completed'
      ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
      : normalized === 'in_review'
        ? 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200'
        : normalized === 'draft' || normalized === 'processing' || normalized === 'queued'
          ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
          : normalized === 'archived'
            ? 'border-white/10 bg-white/[0.03] text-slate-300'
            : 'border-red-400/20 bg-red-400/10 text-red-200'

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${cls}`}>
      {formatStatusLabel(value)}
    </span>
  )
}

function MetricCard({
  label,
  value,
  accent = 'default',
}: {
  label: string
  value: number
  accent?: 'default' | 'cyan' | 'fuchsia' | 'emerald'
}) {
  const cls =
    accent === 'cyan'
      ? 'border-cyan-300/20 bg-cyan-300/[0.08]'
      : accent === 'fuchsia'
        ? 'border-fuchsia-400/20 bg-fuchsia-400/[0.08]'
        : accent === 'emerald'
          ? 'border-emerald-300/20 bg-emerald-300/[0.08]'
          : 'border-white/10 bg-white/[0.04]'

  return (
    <div className={`rounded-2xl border p-5 backdrop-blur-xl ${cls}`}>
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
      {label}
    </div>
  )
}

function AssessmentCard({
  assessment,
  organization,
  darkwebSignal,
  priority = false,
}: {
  assessment: Assessment
  organization: Organization | null
  darkwebSignal?: DarkwebAssessmentSignal
  priority?: boolean
}) {
  const normalizedStatus = normalizeAssessmentStatus(assessment.status) ?? assessment.status
  const latestDarkwebScore = darkwebSignal?.latestScore ?? null
  const darkwebFindingCount =
    latestDarkwebScore?.total_findings ??
    ((darkwebSignal?.reviewRequiredCount ?? 0) + (darkwebSignal?.highSeverityCount ?? 0) > 0
      ? darkwebSignal?.reviewRequiredCount ?? 0
      : 0)

  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        priority
          ? 'border-fuchsia-400/20 bg-fuchsia-400/[0.06]'
          : 'border-white/10 bg-[#030815]'
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-white">
              {organization?.name || 'Unknown organization'}
            </div>
            <StatusBadge value={normalizedStatus} />
          </div>

          <div className="mt-1 text-sm text-slate-400">{organization?.domain || '—'}</div>

          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
            <span>Created: {new Date(assessment.created_at).toLocaleString()}</span>
            {assessment.published_at ? (
              <span>Published: {new Date(assessment.published_at).toLocaleString()}</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="text-3xl font-semibold text-white">{assessment.overall_score}</div>
          <RiskBadge value={assessment.overall_risk_level} />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Dark web
            </div>
            <div className="mt-2 text-sm text-slate-300">
              {latestDarkwebScore ? (
                <>
                  Score {latestDarkwebScore.score} · {darkwebFindingCount} finding
                  {darkwebFindingCount === 1 ? '' : 's'} ·{' '}
                  {darkwebSignal?.reviewRequiredCount ?? 0} need
                  {(darkwebSignal?.reviewRequiredCount ?? 0) === 1 ? 's' : ''} review
                </>
              ) : (
                'No dark web output'
              )}
            </div>
          </div>

          {latestDarkwebScore ? (
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <RiskBadge value={latestDarkwebScore.risk_level} />
              {(darkwebSignal?.highSeverityCount ?? 0) > 0 ? (
                <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-medium uppercase text-fuchsia-200">
                  {darkwebSignal?.highSeverityCount} high severity
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/admin/assessments/${assessment.id}`}
          className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          Open
        </Link>

        <Link
          href={`/admin/assessments/${assessment.id}/report`}
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
        >
          Report
        </Link>

        <Link
          href={`/admin/assessments/${assessment.id}/print`}
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
        >
          Print
        </Link>
      </div>
    </div>
  )
}

function AssessmentSection({
  title,
  subtitle,
  assessments,
  organizations,
  darkwebSignals,
  priority = false,
}: {
  title: string
  subtitle: string
  assessments: Assessment[]
  organizations: Organization[]
  darkwebSignals: Map<string, DarkwebAssessmentSignal>
  priority?: boolean
}) {
  return (
    <section
      className={`rounded-[28px] border p-6 backdrop-blur-xl ${
        priority
          ? 'border-fuchsia-400/20 bg-fuchsia-400/[0.05]'
          : 'border-white/10 bg-white/[0.04]'
      }`}
    >
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {assessments.length === 0 ? (
          <EmptyState label={`No assessments in ${title.toLowerCase()}.`} />
        ) : (
          assessments.map((assessment) => {
            const organization =
              organizations.find((org) => org.id === assessment.organization_id) ?? null

            return (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                organization={organization}
                darkwebSignal={darkwebSignals.get(assessment.id)}
                priority={priority}
              />
            )
          })
        )}
      </div>
    </section>
  )
}

export default async function AssessmentsPage() {
  const supabase = await createSupabaseServerClient()

  const [{ data: assessmentsData }, { data: organizationsData }] = await Promise.all([
    supabase.from('assessments').select('*').order('created_at', { ascending: false }),
    supabase.from('organizations').select('id, name, domain'),
  ])

  const assessments = (assessmentsData ?? []) as Assessment[]
  const organizations = (organizationsData ?? []) as Organization[]
  const assessmentIds = assessments.map((assessment) => assessment.id)

  const [
    { data: darkwebScoreSnapshotsData, error: darkwebScoreSnapshotsError },
    { data: darkwebFindingsData, error: darkwebFindingsError },
  ] =
    assessmentIds.length > 0
      ? await Promise.all([
          supabaseAdmin
            .from('darkweb_score_snapshots')
            .select('assessment_id, run_id, score, risk_level, total_findings, created_at')
            .in('assessment_id', assessmentIds)
            .order('created_at', { ascending: false }),
          supabaseAdmin
            .from('darkweb_findings')
            .select('assessment_id, run_id, severity, status, requires_review')
            .in('assessment_id', assessmentIds)
            .neq('status', 'suppressed'),
        ])
      : [
          { data: [], error: null },
          { data: [], error: null },
        ]

  if (darkwebScoreSnapshotsError) {
    throw new Error(
      `Dark web score snapshots read failed: ${darkwebScoreSnapshotsError.message}`,
    )
  }

  if (darkwebFindingsError) {
    throw new Error(`Dark web findings read failed: ${darkwebFindingsError.message}`)
  }

  const darkwebSignals = new Map<string, DarkwebAssessmentSignal>()

  for (const assessment of assessments) {
    darkwebSignals.set(assessment.id, {
      latestScore: null,
      reviewRequiredCount: 0,
      highSeverityCount: 0,
    })
  }

  for (const snapshot of (darkwebScoreSnapshotsData ?? []) as DarkwebScoreSnapshot[]) {
    if (!snapshot.assessment_id) continue

    const signal = darkwebSignals.get(snapshot.assessment_id)
    if (signal && !signal.latestScore) {
      signal.latestScore = snapshot
    }
  }

  for (const finding of (darkwebFindingsData ?? []) as DarkwebFindingReviewSignal[]) {
    if (!finding.assessment_id) continue

    const signal = darkwebSignals.get(finding.assessment_id)
    if (!signal) continue
    if (!signal.latestScore?.run_id || finding.run_id !== signal.latestScore.run_id) continue

    if (finding.requires_review && finding.status === 'new') {
      signal.reviewRequiredCount += 1
    }

    if (finding.severity === 'high' || finding.severity === 'critical') {
      signal.highSeverityCount += 1
    }
  }

  const darkwebReviewRequiredAssessments = assessments.filter(
    (assessment) => (darkwebSignals.get(assessment.id)?.reviewRequiredCount ?? 0) > 0,
  )

  const inReviewAssessments = assessments.filter(
    (assessment) => normalizeAssessmentStatus(assessment.status) === 'in_review',
  )

  const draftAssessments = assessments.filter(
    (assessment) => normalizeAssessmentStatus(assessment.status) === 'draft',
  )

  const publishedAssessments = assessments.filter(
    (assessment) => normalizeAssessmentStatus(assessment.status) === 'published',
  )

  const archivedAssessments = assessments.filter(
    (assessment) => normalizeAssessmentStatus(assessment.status) === 'archived',
  )

  return (
    <>
      <AdminTopbar
        title="Assessments"
        subtitle="Validate reviewed assessments, publish reports, and monitor delivery status."
      />

      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Needs review" value={inReviewAssessments.length} accent="fuchsia" />
          <MetricCard label="Draft" value={draftAssessments.length} accent="cyan" />
          <MetricCard label="Published" value={publishedAssessments.length} accent="emerald" />
          <MetricCard label="Archived" value={archivedAssessments.length} />
          <MetricCard
            label="Dark web review"
            value={darkwebReviewRequiredAssessments.length}
            accent="fuchsia"
          />
        </section>

        {darkwebReviewRequiredAssessments.length > 0 ? (
          <AssessmentSection
            title="Dark web review"
            subtitle="Assessments with new dark web findings that still need analyst validation."
            assessments={darkwebReviewRequiredAssessments}
            organizations={organizations}
            darkwebSignals={darkwebSignals}
            priority
          />
        ) : null}

        <AssessmentSection
          title="Needs review"
          subtitle="Assessments ready for admin validation before client publication."
          assessments={inReviewAssessments}
          organizations={organizations}
          darkwebSignals={darkwebSignals}
          priority
        />

        <AssessmentSection
          title="Draft"
          subtitle="Assessments still being prepared or not yet ready for final review."
          assessments={draftAssessments}
          organizations={organizations}
          darkwebSignals={darkwebSignals}
        />

        <AssessmentSection
          title="Published"
          subtitle="Assessments already released to clients."
          assessments={publishedAssessments}
          organizations={organizations}
          darkwebSignals={darkwebSignals}
        />

        <AssessmentSection
          title="Archived"
          subtitle="Historical assessments no longer active."
          assessments={archivedAssessments}
          organizations={organizations}
          darkwebSignals={darkwebSignals}
        />
      </div>
    </>
  )
}

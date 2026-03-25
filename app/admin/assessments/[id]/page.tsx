import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { formatDateTime } from '@/lib/date'
import DeleteButton from '@/app/components/admin/delete-button'
import AssessmentEditor from './assessment-editor'
import RunExternalScanButton from '@/app/components/admin/run-external-scan-button'

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
  industry: string | null
}

type Finding = {
  id: string
  assessment_id: string
  person_id: string | null
  title: string
  description: string | null
  severity: string
  category: string
  created_at: string
  source_url: string | null
  source_title: string | null
  source_type: string | null
}

type Person = {
  id: string
  organization_id: string
  full_name: string | null
  role_title: string
  department: string | null
  email: string | null
  is_key_person: boolean
}

type Score = {
  id: string
  assessment_id: string
  person_id: string | null
  score_type: string
  score_value: number
  risk_level: string
  reason_summary: string | null
  score_scope?: string | null
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

function RunningScanNotice() {
  return (
    <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.08] p-6 backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.18em] text-cyan-200">
            Scan in progress
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            HumanSurface is analyzing public pages
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            The page refreshes automatically while the assessment is running. New findings,
            scores, and people will appear as soon as processing is completed.
          </p>
        </div>

        <div className="min-w-[180px] rounded-2xl border border-cyan-200/10 bg-[#030815]/50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-cyan-100">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-300" />
            Running
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-cyan-300" />
          </div>
        </div>
      </div>
    </div>
  )
}

function AutoRefreshWhileRunning() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          setTimeout(() => {
            window.location.reload();
          }, 7000);
        `,
      }}
    />
  )
}

function ChecklistItem({
  label,
  ok,
  helper,
}: {
  label: string
  ok: boolean
  helper: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071022] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-medium text-white">{label}</div>
          <div className="mt-2 text-sm leading-6 text-slate-400">{helper}</div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium uppercase ${
            ok
              ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
              : 'border-amber-300/20 bg-amber-300/10 text-amber-100'
          }`}
        >
          {ok ? 'ok' : 'review'}
        </span>
      </div>
    </div>
  )
}

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const [
    { data: assessmentData },
    { data: organizationsData },
    { data: findingsData },
    { data: peopleData },
    { data: scoresData },
  ] = await Promise.all([
    supabase.from('assessments').select('*').eq('id', id).maybeSingle(),
    supabase.from('organizations').select('*'),
    supabase
      .from('findings')
      .select('*')
      .eq('assessment_id', id)
      .order('created_at', { ascending: false }),
    supabase.from('people').select('*'),
    supabase
      .from('scores')
      .select('*')
      .eq('assessment_id', id)
      .order('created_at', { ascending: false }),
  ])

  const assessment = assessmentData as Assessment | null
  if (!assessment) notFound()

  const organizations = (organizationsData ?? []) as Organization[]
  const findings = (findingsData ?? []) as Finding[]
  const people = (peopleData ?? []) as Person[]
  const scores = (scoresData ?? []) as Score[]

  const organization =
    organizations.find((org) => org.id === assessment.organization_id) ?? null

  const assessmentScores = scores.filter((score) => score.person_id === null)
  const personScores = scores.filter((score) => score.person_id !== null)

  const normalizedStatus = normalizeAssessmentStatus(assessment.status)
  const isRunning = assessment.status === 'running' || assessment.status === 'processing'

  const hasAssessmentOverall = assessmentScores.some((score) => score.score_type === 'overall')
  const hasMeaningfulFindings = findings.length > 0
  const hasPersonCoverage = people.length > 0 || personScores.length > 0
  const hasReasonSummaries = assessmentScores.some((score) => !!score.reason_summary)
  const notPublishedYet = normalizedStatus !== 'published'

  const readyToPublish =
    !isRunning &&
    hasAssessmentOverall &&
    hasMeaningfulFindings &&
    hasPersonCoverage &&
    hasReasonSummaries &&
    notPublishedYet

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      {isRunning ? <AutoRefreshWhileRunning /> : null}

      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Assessment console
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {organization?.name || 'Unknown organization'}
            </h1>
            <p className="mt-3 text-slate-400">
              {organization?.domain || '—'}
              {organization?.industry ? ` · ${organization.industry}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
            <Link
              href="/admin/assessments"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              Back
            </Link>

            <Link
              href={`/admin/assessments/${assessment.id}/report`}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Open report
            </Link>

            <RunExternalScanButton
              assessmentId={assessment.id}
              organizationId={assessment.organization_id}
            />

            <Link
              href={`/admin/assessments/${assessment.id}/print`}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              Print / Export
            </Link>

            <div className="ml-auto">
              <DeleteButton
                table="assessments"
                id={assessment.id}
                label="Delete assessment"
                redirectTo="/admin/assessments"
              />
            </div>
          </div>
        </div>

        {isRunning ? (
          <div className="mb-6">
            <RunningScanNotice />
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Overview</h2>
                <RiskBadge value={assessment.overall_risk_level} />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Status
                  </div>
                  <div className="mt-2">
                    {isRunning ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-medium uppercase text-cyan-100">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                        running
                      </span>
                    ) : (
                      <StatusBadge value={normalizedStatus ?? assessment.status} />
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Overall score
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    {assessment.overall_score}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Created
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    {formatDateTime(assessment.created_at)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Published
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    {assessment.published_at ? formatDateTime(assessment.published_at) : 'Not yet'}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-fuchsia-400/20 bg-fuchsia-400/[0.06] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.16em] text-fuchsia-200">
                    Review status
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Ready to publish checklist
                  </h2>
                </div>

                <span
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase ${
                    readyToPublish
                      ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
                      : 'border-amber-300/20 bg-amber-300/10 text-amber-100'
                  }`}
                >
                  {readyToPublish ? 'Ready for publication' : 'Needs review'}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ChecklistItem
                  label="Assessment-level overall score is present"
                  ok={hasAssessmentOverall}
                  helper="The report should include at least one overall assessment score before publication."
                />
                <ChecklistItem
                  label="Findings are present"
                  ok={hasMeaningfulFindings}
                  helper="At least one finding should be recorded so the client report does not appear empty."
                />
                <ChecklistItem
                  label="People or role coverage is present"
                  ok={hasPersonCoverage}
                  helper="There should be visible people, roles, or person-level scoring context where relevant."
                />
                <ChecklistItem
                  label="Score rationale is present"
                  ok={hasReasonSummaries}
                  helper="At least one assessment score should include a summary reason to support readability."
                />
                <ChecklistItem
                  label="Assessment is not currently published"
                  ok={notPublishedYet}
                  helper="Once published, the report is already visible to the client."
                />
                <ChecklistItem
                  label="Scan is not currently running"
                  ok={!isRunning}
                  helper="Publication should happen only after scan activity is complete and stable."
                />
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-[#071022] p-4">
                <div className="text-sm leading-7 text-slate-300">
                  {readyToPublish
                    ? 'This assessment appears ready for publication. You can move it to Published when final review is complete.'
                    : 'This assessment still needs review before publication. Check findings, scores, and client-facing clarity before releasing it.'}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <h2 className="mb-5 text-2xl font-semibold">Edit assessment</h2>
              <AssessmentEditor
                id={assessment.id}
                initialStatus={assessment.status}
                initialScore={assessment.overall_score}
                initialRiskLevel={assessment.overall_risk_level}
              />
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Findings</h2>
              </div>

              <div className="space-y-4">
                {findings.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                    No findings yet.
                  </div>
                ) : (
                  findings.map((finding) => {
                    const person = finding.person_id
                      ? people.find((p) => p.id === finding.person_id)
                      : null

                    return (
                      <div
                        key={finding.id}
                        className="rounded-2xl border border-white/10 bg-[#030815] p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="max-w-4xl">
                            <div className="font-medium text-white">{finding.title}</div>

                            {finding.description ? (
                              <div className="mt-2 text-sm leading-7 text-slate-400">
                                {finding.description}
                              </div>
                            ) : null}

                            <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                                {finding.category}
                              </span>

                              {person ? (
                                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                                  {person.full_name || person.role_title}
                                </span>
                              ) : null}
                            </div>

                            {finding.source_url ? (
                              <div className="mt-3 text-xs text-slate-500">
                                Source: {finding.source_title || finding.source_url} ·{' '}
                                {finding.source_type || 'unknown'}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex flex-col items-start gap-3 lg:items-end">
                            <RiskBadge value={finding.severity} />
                            <DeleteButton
                              table="findings"
                              id={finding.id}
                              label="Delete finding"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.08] p-6 backdrop-blur-xl">
              <h2 className="mb-5 text-2xl font-semibold">Assessment scores</h2>

              <div className="space-y-3">
                {assessmentScores.length === 0 ? (
                  <div className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4 text-cyan-50/80">
                    No scores yet. Run recalculation first.
                  </div>
                ) : (
                  assessmentScores.map((score) => (
                    <div
                      key={score.id}
                      className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.16em] text-cyan-200">
                            {score.score_type}
                          </div>
                          <div className="mt-2 text-3xl font-semibold text-white">
                            {score.score_value}
                          </div>
                          {score.reason_summary ? (
                            <div className="mt-2 text-sm leading-6 text-slate-300">
                              {score.reason_summary}
                            </div>
                          ) : null}
                        </div>
                        <RiskBadge value={score.risk_level} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">People / role scores</h2>
              </div>

              <div className="space-y-3">
                {personScores.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                    No person-level scores yet.
                  </div>
                ) : (
                  personScores.map((score) => {
                    const person = people.find((p) => p.id === score.person_id)

                    return (
                      <div
                        key={score.id}
                        className="rounded-2xl border border-white/10 bg-[#030815] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-white">
                              {person?.full_name || person?.role_title || 'Unknown person'}
                            </div>
                            {person ? (
                              <div className="mt-1 text-sm text-slate-400">
                                {person.role_title}
                                {person.department ? ` · ${person.department}` : ''}
                              </div>
                            ) : null}
                            {score.reason_summary ? (
                              <div className="mt-2 text-sm leading-6 text-slate-400">
                                {score.reason_summary}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="text-2xl font-semibold text-white">
                              {score.score_value}
                            </div>
                            <RiskBadge value={score.risk_level} />
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
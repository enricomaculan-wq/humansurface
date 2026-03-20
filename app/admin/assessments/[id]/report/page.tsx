import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type Assessment = {
  id: string
  organization_id: string
  status: string
  overall_score: number
  overall_risk_level: string
  created_at: string
  scan_diagnostics: {
    scannedUrls?: string[]
    failedUrls?: Array<{ url: string; error: string }>
    scannedPages?: number
    completedAt?: string
    failedAt?: string
    error?: string
  } | null
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
}

type RemediationTask = {
  id: string
  assessment_id: string
  title: string
  priority: string
  effort: string
  impact: string
  status: string
}

function RiskBadge({ value }: { value: string }) {
  const cls =
    value === 'high'
      ? 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200'
      : value === 'medium'
        ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
        : 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${cls}`}>
      {value}
    </span>
  )
}

function ScoreCard({
  label,
  value,
  risk,
}: {
  label: string
  value: number
  risk: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="text-4xl font-semibold text-white">{value}</div>
        <RiskBadge value={risk} />
      </div>
    </div>
  )
}

export default async function AssessmentReportPage({
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
    { data: remediationData },
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
    supabase
      .from('remediation_tasks')
      .select('*')
      .eq('assessment_id', id)
      .order('created_at', { ascending: false }),
  ])

  const assessment = assessmentData as Assessment | null
  if (!assessment) notFound()
  const scanDiagnostics = assessment.scan_diagnostics ?? null
  const scannedUrls = scanDiagnostics?.scannedUrls ?? []
  const failedUrls = scanDiagnostics?.failedUrls ?? []
  const scannedPages = scanDiagnostics?.scannedPages ?? 0
  const organizations = (organizationsData ?? []) as Organization[]
  const findings = (findingsData ?? []) as Finding[]
  const people = (peopleData ?? []) as Person[]
  const scores = (scoresData ?? []) as Score[]
  const remediationTasks = (remediationData ?? []) as RemediationTask[]

  const organization =
    organizations.find((org) => org.id === assessment.organization_id) ?? null

  const assessmentScores = scores.filter((score) => score.person_id === null)
  const personScores = scores.filter((score) => score.person_id !== null)

  const overallScore =
    assessmentScores.find((s) => s.score_type === 'overall') ?? null
  const impersonationScore =
    assessmentScores.find((s) => s.score_type === 'impersonation_risk') ?? null
  const financeScore =
    assessmentScores.find((s) => s.score_type === 'finance_fraud_risk') ?? null
  const hrScore =
    assessmentScores.find((s) => s.score_type === 'hr_social_engineering_risk') ?? null

  const topPeople = [...personScores]
    .sort((a, b) => b.score_value - a.score_value)
    .slice(0, 5)

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Executive report
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {organization?.name || 'Unknown organization'}
            </h1>
            <p className="mt-3 text-slate-400">
              {organization?.domain || '—'}
              {organization?.industry ? ` · ${organization.industry}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/assessments/${assessment.id}/print`}
              className="rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Print / Export
            </Link>

            <Link
              href={`/admin/assessments/${assessment.id}`}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              Back to assessment
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
            <div className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-cyan-300">
                  HumanSurface report
                </div>
                <h2 className="mt-2 text-3xl font-semibold">Assessment summary</h2>
                <p className="mt-3 max-w-3xl text-slate-400">
                  Executive-ready overview of publicly exposed people, roles, and
                  signals that may enable phishing, impersonation, and fraud.
                </p>
              </div>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <h2 className="mb-5 text-2xl font-semibold">Scan diagnostics</h2>

              {scanDiagnostics?.error ? (
                <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
                  <div className="text-sm font-medium text-red-200">Scan error</div>
                  <div className="mt-2 text-sm text-red-100 break-words">
                    {scanDiagnostics.error}
                  </div>
                  {scanDiagnostics.failedAt ? (
                    <div className="mt-2 text-xs text-red-200/70">
                      Failed at: {scanDiagnostics.failedAt}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Scanned URLs
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    {scannedUrls.length}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Processed pages
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    {scannedPages}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Skipped / failed URLs
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    {failedUrls.length}
                  </div>
                </div>
              </div>

              {failedUrls.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-[#030815] p-4">
                  <div className="mb-3 text-sm font-medium text-white">
                    Failed or skipped URLs
                  </div>

                  <div className="space-y-3">
                    {failedUrls.slice(0, 10).map((item, index) => (
                      <div
                        key={`${item.url}-${index}`}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                      >
                        <div className="break-all text-sm text-slate-200">{item.url}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Overall score
                  </div>
                  <div className="mt-1 text-5xl font-semibold text-white">
                    {overallScore?.score_value ?? assessment.overall_score}
                  </div>
                </div>
                <RiskBadge
                  value={overallScore?.risk_level ?? assessment.overall_risk_level}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <ScoreCard
                label="Overall"
                value={overallScore?.score_value ?? assessment.overall_score}
                risk={overallScore?.risk_level ?? assessment.overall_risk_level}
              />
              <ScoreCard
                label="Impersonation"
                value={impersonationScore?.score_value ?? 0}
                risk={impersonationScore?.risk_level ?? 'low'}
              />
              <ScoreCard
                label="Finance Fraud"
                value={financeScore?.score_value ?? 0}
                risk={financeScore?.risk_level ?? 'low'}
              />
              <ScoreCard
                label="HR / Social"
                value={hrScore?.score_value ?? 0}
                risk={hrScore?.risk_level ?? 'low'}
              />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <h3 className="mb-5 text-2xl font-semibold">Top findings</h3>

              <div className="space-y-4">
                {findings.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                    No findings yet.
                  </div>
                ) : (
                  findings.slice(0, 6).map((finding) => {
                    const linkedPerson = finding.person_id
                      ? people.find((p) => p.id === finding.person_id)
                      : null

                    return (
                      <div
                        key={finding.id}
                        className="rounded-2xl border border-white/10 bg-[#030815] p-4"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
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
                              {linkedPerson ? (
                                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                                  {linkedPerson.full_name || linkedPerson.role_title}
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

                          <RiskBadge value={finding.severity} />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.08] p-6 backdrop-blur-xl">
                <h3 className="mb-5 text-2xl font-semibold">Most exposed people / roles</h3>

                <div className="space-y-3">
                  {topPeople.length === 0 ? (
                    <div className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4 text-cyan-50/80">
                      No person-level scores yet.
                    </div>
                  ) : (
                    topPeople.map((score) => {
                      const linkedPerson = people.find((p) => p.id === score.person_id)

                      return (
                        <div
                          key={score.id}
                          className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-medium text-white">
                                {linkedPerson?.full_name ||
                                  linkedPerson?.role_title ||
                                  'Unknown person'}
                              </div>
                              {linkedPerson ? (
                                <div className="mt-1 text-sm text-slate-300">
                                  {linkedPerson.role_title}
                                  {linkedPerson.department
                                    ? ` · ${linkedPerson.department}`
                                    : ''}
                                </div>
                              ) : null}
                              {score.reason_summary ? (
                                <div className="mt-2 text-sm leading-6 text-slate-400">
                                  {score.reason_summary}
                                </div>
                              ) : null}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <div className="text-3xl font-semibold text-white">
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

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <h3 className="mb-5 text-2xl font-semibold">Immediate remediation</h3>

                <div className="space-y-3">
                  {remediationTasks.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                      No remediation tasks yet.
                    </div>
                  ) : (
                    remediationTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-2xl border border-white/10 bg-[#030815] p-4"
                      >
                        <div className="font-medium text-white">{task.title}</div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                          <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-fuchsia-200">
                            priority · {task.priority}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                            effort · {task.effort}
                          </span>
                          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-cyan-100">
                            impact · {task.impact}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                            status · {task.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
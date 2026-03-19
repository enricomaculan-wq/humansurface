import Link from 'next/link'
import { notFound } from 'next/navigation'
import PrintButton from '@/app/components/admin/print-button'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type Assessment = {
  id: string
  organization_id: string
  status: string
  overall_score: number
  overall_risk_level: string
  created_at: string
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
      ? 'border-fuchsia-300/30 bg-fuchsia-50 text-fuchsia-700'
      : value === 'medium'
        ? 'border-cyan-300/30 bg-cyan-50 text-cyan-700'
        : 'border-emerald-300/30 bg-emerald-50 text-emerald-700'

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${cls}`}>
      {value}
    </span>
  )
}

function ScoreBox({
  label,
  value,
  risk,
}: {
  label: string
  value: number
  risk: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="text-4xl font-semibold text-slate-950">{value}</div>
        <RiskBadge value={risk} />
      </div>
    </div>
  )
}

export default async function AssessmentPrintPage({
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

  const topPeople = [...personScores].sort((a, b) => b.score_value - a.score_value).slice(0, 5)

  const executiveSummary =
    findings.length === 0
      ? 'No findings have been recorded for this assessment yet.'
      : 'This assessment identified public exposure patterns that may increase phishing, impersonation, and fraud risk through visible people, roles, and business context.'

  return (
    <main className="min-h-screen bg-[#eef2f7] print:bg-white">
      <div className="mx-auto max-w-5xl px-6 py-8 print:max-w-none print:px-0 print:py-0">
        <div className="mb-6 flex flex-wrap gap-3 print:hidden">
          <Link
            href={`/admin/assessments/${assessment.id}/report`}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back to report
          </Link>

          <PrintButton />
        </div>

        <article className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-200 print:rounded-none print:shadow-none print:ring-0">
          <header className="border-b border-slate-200 pb-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-700">
                  HumanSurface
                </div>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                  Exposure Assessment Report
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                  Public exposure analysis focused on phishing, impersonation, and human-targeted fraud.
                </p>
              </div>

              <div className="space-y-3 md:text-right">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Organization</div>
                  <div className="mt-1 text-lg font-semibold text-slate-950">
                    {organization?.name || 'Unknown organization'}
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  {organization?.domain || '—'}
                  {organization?.industry ? ` · ${organization.industry}` : ''}
                </div>
                <div className="text-sm text-slate-500">
                  Assessment date: {new Date(assessment.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </header>

          <section className="mt-8">
            <div className="grid gap-4 md:grid-cols-4">
              <ScoreBox
                label="Overall"
                value={overallScore?.score_value ?? assessment.overall_score}
                risk={overallScore?.risk_level ?? assessment.overall_risk_level}
              />
              <ScoreBox
                label="Impersonation"
                value={impersonationScore?.score_value ?? 0}
                risk={impersonationScore?.risk_level ?? 'low'}
              />
              <ScoreBox
                label="Finance Fraud"
                value={financeScore?.score_value ?? 0}
                risk={financeScore?.risk_level ?? 'low'}
              />
              <ScoreBox
                label="HR / Social"
                value={hrScore?.score_value ?? 0}
                risk={hrScore?.risk_level ?? 'low'}
              />
            </div>
          </section>

          <section className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Executive summary</h2>
              <p className="mt-4 leading-8 text-slate-700">{executiveSummary}</p>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-semibold text-slate-900">Overall conclusion</div>
                <p className="mt-3 leading-7 text-slate-700">
                  {overallScore?.risk_level === 'high' || assessment.overall_risk_level === 'high'
                    ? 'The organization currently presents a high level of human-surface exposure, with the strongest signals concentrated around visible roles, public contact paths, and impersonation-enabling business context.'
                    : overallScore?.risk_level === 'medium' || assessment.overall_risk_level === 'medium'
                      ? 'The organization presents a moderate level of public exposure. Several signals should be reduced to lower phishing and impersonation risk.'
                      : 'The organization currently shows a relatively limited level of recorded public exposure, but continued monitoring is recommended.'}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Assessment facts</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Status</div>
                  <div className="mt-2 text-lg font-medium text-slate-950">{assessment.status}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Findings</div>
                  <div className="mt-2 text-lg font-medium text-slate-950">{findings.length}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">People / Roles</div>
                  <div className="mt-2 text-lg font-medium text-slate-950">{topPeople.length || people.length}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Remediation tasks</div>
                  <div className="mt-2 text-lg font-medium text-slate-950">{remediationTasks.length}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-slate-950">Top findings</h2>

            <div className="mt-5 space-y-4">
              {findings.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-500">
                  No findings available.
                </div>
              ) : (
                findings.slice(0, 8).map((finding) => {
                  const linkedPerson = finding.person_id
                    ? people.find((p) => p.id === finding.person_id)
                    : null

                  return (
                    <div key={finding.id} className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="font-semibold text-slate-950">{finding.title}</div>
                          {finding.description ? (
                            <p className="mt-3 leading-7 text-slate-700">{finding.description}</p>
                          ) : null}
                          <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                              {finding.category}
                            </span>
                            {linkedPerson ? (
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
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
          </section>

          <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Most exposed people / roles</h2>

              <div className="mt-5 space-y-4">
                {topPeople.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-500">
                    No person-level scores available.
                  </div>
                ) : (
                  topPeople.map((score) => {
                    const linkedPerson = people.find((p) => p.id === score.person_id)

                    return (
                      <div key={score.id} className="rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-slate-950">
                              {linkedPerson?.full_name || linkedPerson?.role_title || 'Unknown person'}
                            </div>
                            {linkedPerson ? (
                              <div className="mt-2 text-sm text-slate-600">
                                {linkedPerson.role_title}
                                {linkedPerson.department ? ` · ${linkedPerson.department}` : ''}
                              </div>
                            ) : null}
                            {score.reason_summary ? (
                              <div className="mt-3 text-sm leading-6 text-slate-700">
                                {score.reason_summary}
                              </div>
                            ) : null}
                          </div>

                          <div className="text-right">
                            <div className="text-3xl font-semibold text-slate-950">{score.score_value}</div>
                            <div className="mt-2">
                              <RiskBadge value={score.risk_level} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Immediate remediation</h2>

              <div className="mt-5 space-y-4">
                {remediationTasks.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-500">
                    No remediation tasks available.
                  </div>
                ) : (
                  remediationTasks.map((task) => (
                    <div key={task.id} className="rounded-2xl border border-slate-200 p-5">
                      <div className="font-semibold text-slate-950">{task.title}</div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-50 px-3 py-1 text-fuchsia-700">
                          priority · {task.priority}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                          effort · {task.effort}
                        </span>
                        <span className="rounded-full border border-cyan-300/30 bg-cyan-50 px-3 py-1 text-cyan-700">
                          impact · {task.impact}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                          status · {task.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </article>
      </div>
    </main>
  )
}
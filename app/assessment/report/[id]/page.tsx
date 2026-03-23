import { notFound, redirect } from 'next/navigation'
import { createSupabaseAuthServerClient } from '@/lib/supabase-auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { formatDateTime } from '@/lib/date'

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
    peopleDetected?: number
    peopleInserted?: number
    peopleMatchedExisting?: number
    findingsInserted?: number
    findingsLinkedToPeople?: number
    personScoresGenerated?: number
    externalSourcesScanned?: number
    externalSignalsAccepted?: number
    externalPeopleDetected?: number
    externalPeopleInserted?: number
    externalPeopleMatchedExisting?: number
    externalFindingsInserted?: number
    externalFindingsLinkedToPeople?: number
    externalPersonScoresGenerated?: number
    externalCompletedAt?: string
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
  evidence_origin?: string | null
  source_domain?: string | null
}

type Person = {
  id: string
  organization_id: string
  full_name: string | null
  role_title: string
  department: string | null
  email: string | null
  is_key_person: boolean
  evidence_origin?: string | null
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

export default async function CustomerAssessmentReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const auth = await createSupabaseAuthServerClient()
  const {
    data: { user },
  } = await auth.auth.getUser()

  if (!user?.email) {
    redirect('/login')
  }

  const { data: orderData, error: orderError } = await supabaseAdmin
    .from('assessment_orders')
    .select('id, email, assessment_id')
    .eq('assessment_id', id)
    .eq('email', user.email.toLowerCase())
    .maybeSingle()

  if (orderError) {
    throw new Error(`Order lookup failed: ${orderError.message}`)
  }

  if (!orderData) {
    notFound()
  }

  const [
    { data: assessmentData },
    { data: findingsData },
    { data: scoresData },
  ] = await Promise.all([
    supabaseAdmin.from('assessments').select('*').eq('id', id).maybeSingle(),
    supabaseAdmin
      .from('findings')
      .select('*')
      .eq('assessment_id', id)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('scores')
      .select('*')
      .eq('assessment_id', id)
      .order('created_at', { ascending: false }),
  ])

  const assessment = assessmentData as Assessment | null
  if (!assessment) notFound()

  if (assessment.status !== 'completed') {
    redirect(`/assessment/status/${assessment.id}`)
  }

  const [{ data: organizationData }, { data: peopleData }] = await Promise.all([
    supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('id', assessment.organization_id)
      .maybeSingle(),
    supabaseAdmin
      .from('people')
      .select('*')
      .eq('organization_id', assessment.organization_id),
  ])

  const organization = organizationData as Organization | null
  const findings = (findingsData ?? []) as Finding[]
  const scores = (scoresData ?? []) as Score[]
  const people = (peopleData ?? []) as Person[]

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
              Client report
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {organization?.name || 'Unknown organization'}
            </h1>
            <p className="mt-3 text-slate-400">
              {organization?.domain || '—'}
              {organization?.industry ? ` · ${organization.industry}` : ''}
            </p>
          </div>

          <div className="text-sm text-slate-400">
            Created: {formatDateTime(assessment.created_at)}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
            <div className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-sm uppercase tracking-[0.18em] text-cyan-300">
                  HumanSurface report
                </div>
                <h2 className="mt-2 text-3xl font-semibold">Executive summary</h2>
                <p className="mt-3 text-slate-400">
                  Summary of public exposure that may support phishing,
                  impersonation, and fraud scenarios.
                </p>
              </div>

              <div className="flex items-center gap-4 self-start lg:self-end">
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
                    No findings available.
                  </div>
                ) : (
                  findings.slice(0, 8).map((finding) => {
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
                          </div>

                          <RiskBadge value={finding.severity} />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.08] p-6 backdrop-blur-xl">
              <h3 className="mb-5 text-2xl font-semibold">Most exposed people / roles</h3>

              <div className="space-y-3">
                {topPeople.length === 0 ? (
                  <div className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4 text-cyan-50/80">
                    No person-level scores available.
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
          </div>
        </div>
      </div>
    </main>
  )
}
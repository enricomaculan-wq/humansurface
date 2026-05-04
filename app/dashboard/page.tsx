import { redirect } from 'next/navigation'
import { requireAdminUser } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'


type Organization = {
  id: string
  name: string
  domain: string
  industry: string | null
}

type Assessment = {
  id: string
  organization_id: string
  status: string
  overall_score: number
  overall_risk_level: string
  created_at: string
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
  created_at: string
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 flex items-end justify-between gap-4">
        <div className="text-3xl font-semibold text-white">{value}</div>
        <RiskBadge value={risk} />
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  try {
    await requireAdminUser()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'

    if (message === 'Unauthorized') {
      redirect('/login')
    }

    redirect('/client')
  }

  const supabase = await createSupabaseServerClient()
  const [
    { data: organizations, error: organizationsError },
    { data: assessments, error: assessmentsError },
    { data: findings, error: findingsError },
    { data: people, error: peopleError },
    { data: scores, error: scoresError },
  ] = await Promise.all([
    supabase.from('organizations').select('*').order('created_at', { ascending: false }),
    supabase.from('assessments').select('*').order('created_at', { ascending: false }),
    supabase.from('findings').select('*').order('created_at', { ascending: false }),
    supabase.from('people').select('*').order('created_at', { ascending: false }),
    supabase.from('scores').select('*').order('created_at', { ascending: false }),
  ])

  const error =
    organizationsError ||
    assessmentsError ||
    findingsError ||
    peopleError ||
    scoresError

  const orgs = (organizations ?? []) as Organization[]
  const assRows = (assessments ?? []) as Assessment[]
  const findingRows = (findings ?? []) as Finding[]
  const peopleRows = (people ?? []) as Person[]
  const scoreRows = (scores ?? []) as Score[]

  const latestAssessment = assRows[0] ?? null
  const latestOrg = latestAssessment
    ? orgs.find((o) => o.id === latestAssessment.organization_id) ?? null
    : orgs[0] ?? null

  const findingsForLatest = latestAssessment
    ? findingRows.filter((f) => f.assessment_id === latestAssessment.id)
    : []

  const peopleForLatestOrg = latestOrg
    ? peopleRows.filter((p) => p.organization_id === latestOrg.id)
    : []

  const scoresForLatest = latestAssessment
    ? scoreRows.filter((s) => s.assessment_id === latestAssessment.id && s.person_id === null)
    : []

  const personScoresForLatest = latestAssessment
    ? scoreRows.filter((s) => s.assessment_id === latestAssessment.id && s.person_id !== null)
    : []

  const overallScore =
    scoresForLatest.find((s) => s.score_type === 'overall') ?? null

  const impersonationScore =
    scoresForLatest.find((s) => s.score_type === 'impersonation_risk') ?? null

  const financeScore =
    scoresForLatest.find((s) => s.score_type === 'finance_fraud_risk') ?? null

  const hrScore =
    scoresForLatest.find((s) => s.score_type === 'hr_social_engineering_risk') ?? null

  return (
    <main className="hs-light min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            HumanSurface
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-3 text-slate-400">
            Real data from organizations, assessments, people, findings, and scores.
          </p>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-red-400/20 bg-red-400/10 p-6 text-red-200">
            {error.message}
          </div>
        ) : !latestAssessment || !latestOrg ? (
          <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-6 text-amber-200">
            No assessment data available yet. Create an organization, an assessment, and some findings first.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <div className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-sm uppercase tracking-[0.18em] text-cyan-300">
                      Latest assessment
                    </div>
                    <h2 className="mt-2 text-3xl font-semibold">{latestOrg.name}</h2>
                    <p className="mt-2 text-slate-400">
                      {latestOrg.domain}
                      {latestOrg.industry ? ` · ${latestOrg.industry}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Overall score
                      </div>
                      <div className="mt-1 text-5xl font-semibold">
                        {overallScore?.score_value ?? latestAssessment.overall_score}
                      </div>
                    </div>
                    <RiskBadge
                      value={overallScore?.risk_level ?? latestAssessment.overall_risk_level}
                    />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <ScoreCard
                    label="Overall"
                    value={overallScore?.score_value ?? latestAssessment.overall_score}
                    risk={overallScore?.risk_level ?? latestAssessment.overall_risk_level}
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

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Assessment status
                    </div>
                    <div className="mt-2 text-2xl font-semibold">{latestAssessment.status}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Findings
                    </div>
                    <div className="mt-2 text-2xl font-semibold">{findingsForLatest.length}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      People / roles
                    </div>
                    <div className="mt-2 text-2xl font-semibold">{peopleForLatestOrg.length}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.08] p-6 backdrop-blur-xl">
                <div className="text-sm uppercase tracking-[0.18em] text-cyan-100">
                  Quick summary
                </div>
                <div className="mt-4 space-y-3 text-cyan-50">
                  <div className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4">
                    Latest org: {latestOrg.name}
                  </div>
                  <div className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4">
                    Risk level: {overallScore?.risk_level ?? latestAssessment.overall_risk_level}
                  </div>
                  <div className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4">
                    Score: {overallScore?.score_value ?? latestAssessment.overall_score}/100
                  </div>
                  <div className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4">
                    Assessment ID: {latestAssessment.id.slice(0, 8)}...
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-2xl font-semibold">Findings</h3>
                  <span className="text-sm text-slate-500">{findingsForLatest.length} items</span>
                </div>

                <div className="space-y-3">
                  {findingsForLatest.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                      No findings yet.
                    </div>
                  ) : (
                    findingsForLatest.map((finding) => (
                      <div
                        key={finding.id}
                        className="rounded-2xl border border-white/10 bg-[#030815] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-white">{finding.title}</div>
                            {finding.description ? (
                              <div className="mt-2 text-sm leading-7 text-slate-400">
                                {finding.description}
                              </div>
                            ) : null}
                            <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                              {finding.category}
                            </div>
                          </div>
                          <RiskBadge value={finding.severity} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-2xl font-semibold">People / Roles</h3>
                  <span className="text-sm text-slate-500">{peopleForLatestOrg.length} items</span>
                </div>

                <div className="space-y-3">
                  {peopleForLatestOrg.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                      No people or roles yet.
                    </div>
                  ) : (
                    peopleForLatestOrg.map((person) => {
                      const personScore =
                        personScoresForLatest.find((s) => s.person_id === person.id) ?? null

                      return (
                        <div
                          key={person.id}
                          className="rounded-2xl border border-white/10 bg-[#030815] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-medium text-white">
                                {person.full_name || person.role_title}
                              </div>
                              <div className="mt-1 text-sm text-slate-400">
                                {person.role_title}
                                {person.department ? ` · ${person.department}` : ''}
                              </div>
                              {person.email ? (
                                <div className="mt-2 text-sm text-slate-500">{person.email}</div>
                              ) : null}
                              {personScore?.reason_summary ? (
                                <div className="mt-2 text-sm text-slate-400">
                                  {personScore.reason_summary}
                                </div>
                              ) : null}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              {person.is_key_person ? (
                                <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-medium text-fuchsia-200">
                                  Key person
                                </span>
                              ) : null}

                              {personScore ? (
                                <div className="text-right">
                                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                    Risk score
                                  </div>
                                  <div className="mt-1 text-2xl font-semibold">
                                    {personScore.score_value}
                                  </div>
                                  <div className="mt-1">
                                    <RiskBadge value={personScore.risk_level} />
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Organizations</h3>
                <span className="text-sm text-slate-500">{orgs.length} total</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {orgs.map((org) => (
                  <div key={org.id} className="rounded-2xl border border-white/10 bg-[#030815] p-4">
                    <div className="font-medium text-white">{org.name}</div>
                    <div className="mt-2 text-sm text-slate-400">{org.domain}</div>
                    {org.industry ? (
                      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {org.industry}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Score records</h3>
                <span className="text-sm text-slate-500">{scoresForLatest.length} assessment-level items</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {scoresForLatest.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400 md:col-span-2 xl:col-span-4">
                    No scores yet. Run score recalculation first.
                  </div>
                ) : (
                  scoresForLatest.map((score) => (
                    <div key={score.id} className="rounded-2xl border border-white/10 bg-[#030815] p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        {score.score_type}
                      </div>
                      <div className="mt-2 text-3xl font-semibold text-white">
                        {score.score_value}
                      </div>
                      <div className="mt-2">
                        <RiskBadge value={score.risk_level} />
                      </div>
                      {score.reason_summary ? (
                        <div className="mt-3 text-sm leading-6 text-slate-400">
                          {score.reason_summary}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

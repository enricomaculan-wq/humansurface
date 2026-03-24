import { notFound, redirect } from 'next/navigation'
import { createSupabaseAuthServerClient } from '@/lib/supabase-auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { formatDateTime } from '@/lib/date'
import PrintReportButton from './print-report-button'

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

type CompanyUserLookupRow = {
  id: string
}

function RiskBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase()

  const cls =
    normalized === 'high'
      ? 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200'
      : normalized === 'medium'
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 print:border-slate-200 print:bg-white">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="text-4xl font-semibold text-white print:text-black">{value}</div>
        <RiskBadge value={risk} />
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  accent = 'default',
}: {
  label: string
  value: string | number
  accent?: 'default' | 'fuchsia' | 'cyan'
}) {
  const cls =
    accent === 'fuchsia'
      ? 'border-fuchsia-400/20 bg-fuchsia-400/10'
      : accent === 'cyan'
        ? 'border-cyan-300/20 bg-cyan-300/[0.08]'
        : 'border-white/10 bg-white/[0.03]'

  return (
    <div className={`rounded-2xl border p-4 print:border-slate-200 print:bg-white ${cls}`}>
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white print:text-black">{value}</div>
    </div>
  )
}

function pickAssessmentScore(
  scores: Score[],
  scoreType: string,
  preferredScopes: Array<string | null> = ['combined', 'website', 'external', null],
) {
  const candidates = scores.filter((score) => score.score_type === scoreType)

  for (const scope of preferredScopes) {
    const found =
      scope === null
        ? candidates.find((score) => !score.score_scope)
        : candidates.find((score) => score.score_scope === scope)

    if (found) return found
  }

  return candidates[0] ?? null
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

  if (!user?.id) {
    redirect('/login')
  }

  const { data: companyUserData, error: companyUserError } = await supabaseAdmin
    .from('company_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (companyUserError) {
    throw new Error(`Company user lookup failed: ${companyUserError.message}`)
  }

  if (!companyUserData?.id) {
    notFound()
  }

  const companyUser = companyUserData as CompanyUserLookupRow

  const { data: orderData, error: orderError } = await supabaseAdmin
    .from('assessment_orders')
    .select('id, assessment_id, company_user_id')
    .eq('assessment_id', id)
    .eq('company_user_id', companyUser.id)
    .maybeSingle()

  if (orderError) {
    throw new Error(`Order lookup failed: ${orderError.message}`)
  }

  if (!orderData) {
    notFound()
  }

  const [
    { data: assessmentData, error: assessmentError },
    { data: findingsData, error: findingsError },
    { data: scoresData, error: scoresError },
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

  if (assessmentError) {
    throw new Error(`Assessment read failed: ${assessmentError.message}`)
  }

  if (findingsError) {
    throw new Error(`Findings read failed: ${findingsError.message}`)
  }

  if (scoresError) {
    throw new Error(`Scores read failed: ${scoresError.message}`)
  }

  const assessment = assessmentData as Assessment | null
  if (!assessment) notFound()

  if (assessment.status !== 'completed') {
    redirect(`/assessment/status/${assessment.id}`)
  }

  const [
    { data: organizationData, error: organizationError },
    { data: peopleData, error: peopleError },
  ] = await Promise.all([
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

  if (organizationError) {
    throw new Error(`Organization read failed: ${organizationError.message}`)
  }

  if (peopleError) {
    throw new Error(`People read failed: ${peopleError.message}`)
  }

  const organization = organizationData as Organization | null
  const findings = (findingsData ?? []) as Finding[]
  const scores = (scoresData ?? []) as Score[]
  const people = (peopleData ?? []) as Person[]

  const diagnostics = assessment.scan_diagnostics ?? null

  const assessmentScores = scores.filter((score) => score.person_id === null)
  const personScores = scores.filter((score) => score.person_id !== null)

  const overallScore = pickAssessmentScore(assessmentScores, 'overall') ?? null
  const impersonationScore = pickAssessmentScore(assessmentScores, 'impersonation_risk') ?? null
  const financeScore = pickAssessmentScore(assessmentScores, 'finance_fraud_risk') ?? null
  const hrScore = pickAssessmentScore(assessmentScores, 'hr_social_engineering_risk') ?? null

  const topPeople = [...personScores].sort((a, b) => b.score_value - a.score_value).slice(0, 5)

  const externalFindings = findings.filter(
    (finding) =>
      finding.evidence_origin === 'external' ||
      finding.source_type === 'external' ||
      (finding.source_domain && organization?.domain && finding.source_domain !== organization.domain),
  )

  const websiteFindings = findings.filter(
    (finding) => !externalFindings.some((item) => item.id === finding.id),
  )

  const uniqueExternalDomains = Array.from(
    new Set(
      externalFindings
        .map((finding) => finding.source_domain)
        .filter((value): value is string => !!value),
    ),
  )

  const whatChangedItems = [
    diagnostics?.externalSignalsAccepted
      ? `+${diagnostics.externalSignalsAccepted} external signals accepted`
      : null,
    diagnostics?.externalPeopleDetected
      ? `+${diagnostics.externalPeopleDetected} externally visible people or roles detected`
      : null,
    diagnostics?.externalFindingsInserted
      ? `+${diagnostics.externalFindingsInserted} external findings generated`
      : null,
    diagnostics?.peopleDetected
      ? `${diagnostics.peopleDetected} people or roles detected overall`
      : null,
    diagnostics?.findingsInserted
      ? `${diagnostics.findingsInserted} findings recorded in this assessment`
      : null,
  ]
    .filter((value): value is string => !!value)
    .slice(0, 4)

  const immediateRecommendations = [
    'Reduce direct public exposure of finance, HR, and executive email addresses where possible.',
    'Introduce a secondary verification step for urgent payment or bank detail change requests.',
    'Review leadership and team pages to limit unnecessary role and contact detail visibility.',
    'Train HR, finance, and executive-facing staff on impersonation and social engineering scenarios.',
    'Monitor external sources where staff names, roles, and business context may be exposed.',
  ]

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white print:bg-white print:px-0 print:py-0 print:text-black">
      <div className="mx-auto max-w-7xl print:max-w-none">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between print:mb-6">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300 print:text-slate-600">
              Client report
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight print:text-3xl">
              {organization?.name || 'Unknown organization'}
            </h1>
            <p className="mt-3 text-slate-400 print:text-slate-600">
              {organization?.domain || '—'}
              {organization?.industry ? ` · ${organization.industry}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <div className="text-sm text-slate-400">
              Created: {formatDateTime(assessment.created_at)}
            </div>
            <PrintReportButton />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl print:rounded-none print:border print:border-slate-200 print:bg-white print:p-6">
            <div className="flex flex-col gap-6 border-b border-white/10 pb-6 print:border-slate-200 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-sm uppercase tracking-[0.18em] text-cyan-300 print:text-slate-600">
                  HumanSurface report
                </div>
                <h2 className="mt-2 text-3xl font-semibold print:text-2xl">Executive summary</h2>
                <p className="mt-3 text-slate-400 print:text-slate-700">
                  Summary of public exposure that may support phishing, impersonation, and fraud scenarios.
                </p>
              </div>

              <div className="flex items-center gap-4 self-start lg:self-end">
                <div className="text-right">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Overall score
                  </div>
                  <div className="mt-1 text-5xl font-semibold text-white print:text-black">
                    {overallScore?.score_value ?? assessment.overall_score}
                  </div>
                </div>
                <RiskBadge value={overallScore?.risk_level ?? assessment.overall_risk_level} />
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
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl print:rounded-none print:border print:border-slate-200 print:bg-white">
              <h3 className="mb-5 text-2xl font-semibold">Top findings</h3>

              <div className="space-y-4">
                {websiteFindings.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400 print:border-slate-200 print:text-slate-600">
                    No findings available.
                  </div>
                ) : (
                  websiteFindings.slice(0, 8).map((finding) => {
                    const linkedPerson = finding.person_id
                      ? people.find((p) => p.id === finding.person_id)
                      : null

                    return (
                      <div
                        key={finding.id}
                        className="rounded-2xl border border-white/10 bg-[#030815] p-4 print:border-slate-200 print:bg-white"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="font-medium text-white print:text-black">
                              {finding.title}
                            </div>

                            {finding.description ? (
                              <div className="mt-2 text-sm leading-7 text-slate-400 print:text-slate-700">
                                {finding.description}
                              </div>
                            ) : null}

                            <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 print:border-slate-200 print:bg-slate-50">
                                {finding.category}
                              </span>
                              {linkedPerson ? (
                                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 print:border-slate-200 print:bg-slate-50">
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

            <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.08] p-6 backdrop-blur-xl print:rounded-none print:border print:border-slate-200 print:bg-white">
              <h3 className="mb-5 text-2xl font-semibold">Most exposed people / roles</h3>

              <div className="space-y-3">
                {topPeople.length === 0 ? (
                  <div className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4 text-cyan-50/80 print:border-slate-200 print:bg-slate-50 print:text-slate-600">
                    No person-level scores available.
                  </div>
                ) : (
                  topPeople.map((score) => {
                    const linkedPerson = people.find((p) => p.id === score.person_id)

                    return (
                      <div
                        key={score.id}
                        className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4 print:border-slate-200 print:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-white print:text-black">
                              {linkedPerson?.full_name || linkedPerson?.role_title || 'Unknown person'}
                            </div>
                            {linkedPerson ? (
                              <div className="mt-1 text-sm text-slate-300 print:text-slate-700">
                                {linkedPerson.role_title}
                                {linkedPerson.department ? ` · ${linkedPerson.department}` : ''}
                              </div>
                            ) : null}
                            {score.reason_summary ? (
                              <div className="mt-2 text-sm leading-6 text-slate-400 print:text-slate-700">
                                {score.reason_summary}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="text-3xl font-semibold text-white print:text-black">
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

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-fuchsia-400/20 bg-fuchsia-400/10 p-6 backdrop-blur-xl print:rounded-none print:border print:border-slate-200 print:bg-white">
              <h3 className="mb-5 text-2xl font-semibold">External exposure</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label="External sources scanned"
                  value={diagnostics?.externalSourcesScanned ?? 0}
                  accent="fuchsia"
                />
                <MetricCard
                  label="External signals accepted"
                  value={diagnostics?.externalSignalsAccepted ?? 0}
                  accent="fuchsia"
                />
                <MetricCard
                  label="External people detected"
                  value={diagnostics?.externalPeopleDetected ?? 0}
                  accent="fuchsia"
                />
                <MetricCard
                  label="External findings"
                  value={externalFindings.length || diagnostics?.externalFindingsInserted || 0}
                  accent="fuchsia"
                />
              </div>

              <div className="mt-6 space-y-3">
                {externalFindings.length === 0 ? (
                  <div className="rounded-2xl border border-fuchsia-300/20 bg-[#030815]/30 p-4 text-slate-300 print:border-slate-200 print:bg-slate-50 print:text-slate-700">
                    No dedicated external findings were rendered for this assessment.
                  </div>
                ) : (
                  externalFindings.slice(0, 4).map((finding) => (
                    <div
                      key={finding.id}
                      className="rounded-2xl border border-fuchsia-300/20 bg-[#030815]/30 p-4 print:border-slate-200 print:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-white print:text-black">
                            {finding.title}
                          </div>
                          {finding.description ? (
                            <div className="mt-2 text-sm leading-6 text-slate-300 print:text-slate-700">
                              {finding.description}
                            </div>
                          ) : null}
                          <div className="mt-2 text-xs text-slate-400 print:text-slate-600">
                            {finding.source_domain ||
                              finding.source_title ||
                              finding.source_url ||
                              'External source'}
                          </div>
                        </div>
                        <RiskBadge value={finding.severity} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {uniqueExternalDomains.length > 0 ? (
                <div className="mt-6">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    External source domains
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {uniqueExternalDomains.slice(0, 8).map((domain) => (
                      <span
                        key={domain}
                        className="rounded-full border border-fuchsia-300/20 bg-[#030815]/30 px-3 py-1 text-xs text-slate-300 print:border-slate-200 print:bg-slate-50 print:text-slate-700"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl print:rounded-none print:border print:border-slate-200 print:bg-white">
              <h3 className="mb-5 text-2xl font-semibold">What changed</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard label="Pages scanned" value={diagnostics?.scannedPages ?? 0} accent="cyan" />
                <MetricCard label="People detected" value={diagnostics?.peopleDetected ?? 0} accent="cyan" />
                <MetricCard
                  label="Findings recorded"
                  value={diagnostics?.findingsInserted ?? findings.length}
                  accent="cyan"
                />
                <MetricCard
                  label="Signals linked to people"
                  value={diagnostics?.findingsLinkedToPeople ?? 0}
                  accent="cyan"
                />
              </div>

              <div className="mt-6 space-y-3">
                {whatChangedItems.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400 print:border-slate-200 print:text-slate-700">
                    No change summary was generated for this assessment.
                  </div>
                ) : (
                  whatChangedItems.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 print:border-slate-200 print:bg-slate-50 print:text-slate-700"
                    >
                      {item}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-[#071022] p-4 print:border-slate-200 print:bg-slate-50">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Why this matters
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-300 print:text-slate-700">
                  Public leadership visibility, externally discoverable roles, and repeated exposure signals
                  increase the credibility of impersonation, invoice fraud, and social engineering attempts
                  against your organization.
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl print:rounded-none print:border print:border-slate-200 print:bg-white">
            <h3 className="mb-5 text-2xl font-semibold">Immediate recommendations</h3>

            <div className="grid gap-3 md:grid-cols-2">
              {immediateRecommendations.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-[#071022] p-4 text-sm leading-7 text-slate-300 print:border-slate-200 print:bg-slate-50 print:text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
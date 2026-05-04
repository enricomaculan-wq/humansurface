import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { formatDateTime } from '@/lib/date'
import { getImmediateRecommendationsFromTasks } from '@/lib/assessments/assessment-remediation'
import {
  buildDarkwebPresentationSummary,
  type DarkwebPresentationFinding,
  type DarkwebPresentationSummary,
  type DarkwebPresentationScoreSnapshot,
} from '@/lib/darkweb/presentation'

type Assessment = {
  id: string
  organization_id: string
  status: string
  overall_score: number
  overall_risk_level: string
  created_at: string
  published_at?: string | null
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
    externalSearchDebug?: Array<{
      query: string
      ok: boolean
      resultCount: number
      error?: string
    }>
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
  confidence?: number | null
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
  source_url?: string | null
  confidence?: number | null
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

type RemediationTask = {
  id: string
  assessment_id: string
  title: string
  priority: string
  effort: string
  impact: string
  status: string
  created_at: string
}

type DarkwebScoreSnapshot = DarkwebPresentationScoreSnapshot & {
  id: string
  run_id: string | null
}

type DarkwebFinding = DarkwebPresentationFinding

function normalizeLabel(value: string | null | undefined, fallback = '—') {
  if (!value) return fallback
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function severityRank(value: string) {
  switch ((value || '').toLowerCase()) {
    case 'critical':
      return 4
    case 'high':
      return 3
    case 'medium':
    case 'moderate':
      return 2
    default:
      return 1
  }
}

function RiskBadge({ value }: { value: string }) {
  const normalized = (value || 'low').toLowerCase()

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
      {normalizeLabel(normalized)}
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

function DiagnosticCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  )
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  )
}

function FindingsSection({
  title,
  findings,
  people,
}: {
  title: string
  findings: Finding[]
  people: Person[]
}) {
  return (
    <SectionCard title={title}>
      <div className="space-y-4">
        {findings.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
            No findings yet.
          </div>
        ) : (
          findings.slice(0, 8).map((finding) => {
            const linkedPerson = finding.person_id
              ? people.find((p) => p.id === finding.person_id)
              : null

            return (
              <article
                key={finding.id}
                className="rounded-2xl border border-white/10 bg-[#030815] p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-4xl">
                    <div className="font-medium text-white">{finding.title}</div>

                    {finding.description ? (
                      <div className="mt-2 text-sm leading-7 text-slate-400">
                        {finding.description}
                      </div>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                        {normalizeLabel(finding.category)}
                      </span>

                      {linkedPerson ? (
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                          {linkedPerson.full_name || linkedPerson.role_title}
                        </span>
                      ) : null}

                      {finding.evidence_origin ? (
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                          {normalizeLabel(finding.evidence_origin)}
                        </span>
                      ) : null}
                    </div>

                    {finding.source_url ? (
                      <div className="mt-3 text-xs text-slate-500">
                        Source: {finding.source_title || finding.source_url} ·{' '}
                        {finding.source_type || 'unknown'}
                        {finding.source_domain ? ` · ${finding.source_domain}` : ''}
                      </div>
                    ) : null}
                  </div>

                  <RiskBadge value={finding.severity} />
                </div>
              </article>
            )
          })
        )}
      </div>
    </SectionCard>
  )
}

function PeopleScoresSection({
  title,
  scores,
  people,
  accent = 'cyan',
}: {
  title: string
  scores: Score[]
  people: Person[]
  accent?: 'cyan' | 'fuchsia'
}) {
  const accentClasses =
    accent === 'fuchsia'
      ? 'border-fuchsia-400/20 bg-fuchsia-400/[0.08]'
      : 'border-cyan-300/20 bg-cyan-300/[0.08]'

  const itemClasses =
    accent === 'fuchsia'
      ? 'border-fuchsia-200/10 bg-[#030815]/40'
      : 'border-cyan-200/10 bg-[#030815]/40'

  const textAccent = accent === 'fuchsia' ? 'text-fuchsia-200' : 'text-cyan-200'

  return (
    <div className={`rounded-[28px] p-6 backdrop-blur-xl ${accentClasses}`}>
      <h3 className="mb-5 text-2xl font-semibold text-white">{title}</h3>

      <div className="space-y-3">
        {scores.length === 0 ? (
          <div className={`rounded-2xl p-4 ${itemClasses} text-slate-300`}>
            No person-level scores yet.
          </div>
        ) : (
          scores.slice(0, 6).map((score) => {
            const linkedPerson = people.find((p) => p.id === score.person_id)

            return (
              <div
                key={score.id}
                className={`rounded-2xl border p-4 ${itemClasses}`}
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
                        {linkedPerson.department ? ` · ${linkedPerson.department}` : ''}
                        {linkedPerson.evidence_origin
                          ? ` · ${normalizeLabel(linkedPerson.evidence_origin)}`
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
                    <div className={`text-3xl font-semibold ${textAccent}`}>
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
  )
}

function DarkwebReportSection({
  summary,
  scoreSnapshot,
}: {
  summary: DarkwebPresentationSummary
  scoreSnapshot: DarkwebScoreSnapshot | null
}) {
  return (
    <section className="rounded-[28px] border border-fuchsia-400/20 bg-fuchsia-400/[0.06] p-6 backdrop-blur-xl">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.18em] text-fuchsia-200">
            Dark web review
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Dark web exposure summary
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            Internal review section from dark web findings. Kept separate from public
            exposure findings and not merged into the shared client report flow.
          </p>
        </div>

        <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-1 text-xs font-semibold uppercase text-fuchsia-100">
          admin review
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#030815] p-4">
          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Score and risk
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">
            {scoreSnapshot ? scoreSnapshot.score : '—'}
          </div>
          <div className="mt-3">
            <RiskBadge value={scoreSnapshot?.risk_level ?? 'low'} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#030815] p-4">
          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Findings
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">
            {summary.totalFindings}
          </div>
          <div className="mt-3 text-xs leading-5 text-slate-500">
            {summary.criticalOrHighCount} high-severity finding
            {summary.criticalOrHighCount === 1 ? '' : 's'}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#030815] p-4">
          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Review queue
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">
            {summary.reviewRequiredCount}
          </div>
          <div className="mt-3 text-xs leading-5 text-slate-500">
            Require analyst review
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-[#030815] p-5">
        <h3 className="text-xl font-semibold text-white">{summary.headline}</h3>
        <p className="mt-3 max-w-5xl text-sm leading-7 text-slate-300">
          {summary.keyTakeaway}
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          <span className="text-slate-500">Recommended action: </span>
          {summary.recommendedAction}
        </p>
      </div>

      {summary.groups.length > 0 ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {summary.groups.slice(0, 3).map((group) => (
            <div key={group.key} className="rounded-2xl border border-white/10 bg-[#030815] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-white">{group.label}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">
                    {group.description}
                  </div>
                </div>
                <RiskBadge value={group.highestSeverity} />
              </div>
              <div className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">
                {group.count} finding{group.count === 1 ? '' : 's'} ·{' '}
                {group.reviewCount} need review
              </div>
              <div className="mt-3 text-sm leading-6 text-slate-300">
                {group.remediation}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {summary.findings.length > 0 ? (
        <div className="mt-5 space-y-3">
          {summary.findings.slice(0, 5).map((finding) => (
            <article
              key={finding.id}
              className="rounded-2xl border border-white/10 bg-[#030815] p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-4xl">
                  <div className="font-medium text-white">{finding.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">
                    {finding.reviewerSummary}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                      {finding.categoryLabel}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                      {finding.confidenceLabel}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                      {finding.reviewLabel}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 lg:items-end">
                  <RiskBadge value={finding.severity} />
                  <span className="text-right text-xs leading-5 text-slate-500">
                    {finding.severityLabel}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
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

export default async function AssessmentReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const [
    { data: assessmentData, error: assessmentError },
    { data: organizationsData, error: organizationsError },
    { data: findingsData, error: findingsError },
    { data: peopleData, error: peopleError },
    { data: scoresData, error: scoresError },
    { data: remediationData, error: remediationError },
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

  if (assessmentError) {
    throw new Error(`Assessment read failed: ${assessmentError.message}`)
  }

  if (organizationsError) {
    throw new Error(`Organizations read failed: ${organizationsError.message}`)
  }

  if (findingsError) {
    throw new Error(`Findings read failed: ${findingsError.message}`)
  }

  if (peopleError) {
    throw new Error(`People read failed: ${peopleError.message}`)
  }

  if (scoresError) {
    throw new Error(`Scores read failed: ${scoresError.message}`)
  }

  if (remediationError) {
    throw new Error(`Remediation read failed: ${remediationError.message}`)
  }

  const assessment = assessmentData as Assessment | null
  if (!assessment) notFound()

  const { data: darkwebScoreSnapshotsData, error: darkwebScoreSnapshotsError } =
    await supabaseAdmin
      .from('darkweb_score_snapshots')
      .select(`
        id,
        run_id,
        score,
        risk_level,
        total_findings,
        critical_findings,
        high_findings,
        credential_findings,
        fraud_relevant_findings,
        created_at
      `)
      .eq('assessment_id', assessment.id)
      .eq('organization_id', assessment.organization_id)
      .order('created_at', { ascending: false })
      .limit(1)

  if (darkwebScoreSnapshotsError) {
    throw new Error(
      `Dark web score snapshots read failed: ${darkwebScoreSnapshotsError.message}`,
    )
  }

  const latestDarkwebScore =
    ((darkwebScoreSnapshotsData ?? []) as DarkwebScoreSnapshot[])[0] ?? null
  const { data: darkwebFindingsData, error: darkwebFindingsError } =
    latestDarkwebScore?.run_id
      ? await supabaseAdmin
          .from('darkweb_findings')
          .select(`
            id,
            source_type,
            source_name,
            category,
            matched_term,
            matched_entity_type,
            confidence,
            severity,
            title,
            summary,
            evidence_snippet,
            raw_reference,
            requires_review,
            status,
            created_at
          `)
          .eq('assessment_id', assessment.id)
          .eq('organization_id', assessment.organization_id)
          .eq('run_id', latestDarkwebScore.run_id)
          .neq('status', 'suppressed')
          .order('created_at', { ascending: false })
          .limit(20)
      : { data: [], error: null }

  if (darkwebFindingsError) {
    throw new Error(`Dark web findings read failed: ${darkwebFindingsError.message}`)
  }

  const scanDiagnostics = assessment.scan_diagnostics ?? null
  const scannedUrls = scanDiagnostics?.scannedUrls ?? []
  const failedUrls = scanDiagnostics?.failedUrls ?? []
  const scannedPages = scanDiagnostics?.scannedPages ?? 0
  const peopleDetected = scanDiagnostics?.peopleDetected ?? 0
  const peopleInserted = scanDiagnostics?.peopleInserted ?? 0
  const peopleMatchedExisting = scanDiagnostics?.peopleMatchedExisting ?? 0
  const findingsInserted = scanDiagnostics?.findingsInserted ?? 0
  const findingsLinkedToPeople = scanDiagnostics?.findingsLinkedToPeople ?? 0
  const personScoresGenerated = scanDiagnostics?.personScoresGenerated ?? 0

  const externalSourcesScanned = scanDiagnostics?.externalSourcesScanned ?? 0
  const externalSignalsAccepted = scanDiagnostics?.externalSignalsAccepted ?? 0
  const externalPeopleDetected = scanDiagnostics?.externalPeopleDetected ?? 0
  const externalPeopleInserted = scanDiagnostics?.externalPeopleInserted ?? 0
  const externalPeopleMatchedExisting =
    scanDiagnostics?.externalPeopleMatchedExisting ?? 0
  const externalFindingsInserted = scanDiagnostics?.externalFindingsInserted ?? 0
  const externalFindingsLinkedToPeople =
    scanDiagnostics?.externalFindingsLinkedToPeople ?? 0
  const externalPersonScoresGenerated =
    scanDiagnostics?.externalPersonScoresGenerated ?? 0
  const externalSearchDebug = scanDiagnostics?.externalSearchDebug ?? []

  const organizations = (organizationsData ?? []) as Organization[]
  const findings = (findingsData ?? []) as Finding[]
  const people = (peopleData ?? []) as Person[]
  const scores = (scoresData ?? []) as Score[]
  const remediationTasks = (remediationData ?? []) as RemediationTask[]
  const darkwebFindings = (darkwebFindingsData ?? []) as DarkwebFinding[]
  const darkwebSummary = buildDarkwebPresentationSummary({
    findings: darkwebFindings,
    scoreSnapshot: latestDarkwebScore,
  })
  const shouldShowDarkwebReportSection =
    darkwebSummary.totalFindings > 0 || latestDarkwebScore !== null

  const organization =
    organizations.find((org) => org.id === assessment.organization_id) ?? null

  const websiteFindings = findings.filter(
    (finding) => (finding.evidence_origin ?? 'website') === 'website',
  )
  const externalFindings = findings.filter(
    (finding) => finding.evidence_origin === 'external',
  )

  const websitePeople = people.filter(
    (person) => (person.evidence_origin ?? 'website') !== 'external',
  )
  const externalPeople = people.filter(
    (person) => person.evidence_origin === 'external',
  )

  const assessmentScores = scores.filter((score) => score.person_id === null)
  const personScores = scores.filter((score) => score.person_id !== null)

  const websiteAssessmentScores = assessmentScores.filter(
    (score) => (score.score_scope ?? 'website') === 'website',
  )
  const externalAssessmentScores = assessmentScores.filter(
    (score) => score.score_scope === 'external',
  )
  const combinedAssessmentScores = assessmentScores.filter(
    (score) => score.score_scope === 'combined',
  )

  const websitePersonScores = personScores.filter(
    (score) => (score.score_scope ?? 'website') === 'website',
  )
  const externalPersonScores = personScores.filter(
    (score) => score.score_scope === 'external',
  )

  const overallScore =
    pickAssessmentScore(websiteAssessmentScores, 'overall', ['website', null]) ??
    assessmentScores.find((s) => s.score_type === 'overall') ??
    null
  const impersonationScore =
    pickAssessmentScore(websiteAssessmentScores, 'impersonation_risk', ['website', null]) ??
    null
  const financeScore =
    pickAssessmentScore(websiteAssessmentScores, 'finance_fraud_risk', ['website', null]) ??
    null
  const hrScore =
    pickAssessmentScore(
      websiteAssessmentScores,
      'hr_social_engineering_risk',
      ['website', null],
    ) ?? null

  const externalOverallScore =
    pickAssessmentScore(externalAssessmentScores, 'overall', ['external']) ?? null
  const externalImpersonationScore =
    pickAssessmentScore(externalAssessmentScores, 'impersonation_risk', ['external']) ??
    null
  const externalFinanceScore =
    pickAssessmentScore(externalAssessmentScores, 'finance_fraud_risk', ['external']) ??
    null
  const externalHrScore =
    pickAssessmentScore(
      externalAssessmentScores,
      'hr_social_engineering_risk',
      ['external'],
    ) ?? null

  const combinedOverallScore =
    pickAssessmentScore(combinedAssessmentScores, 'overall', ['combined']) ?? null
  const combinedImpersonationScore =
    pickAssessmentScore(combinedAssessmentScores, 'impersonation_risk', ['combined']) ??
    null
  const combinedFinanceScore =
    pickAssessmentScore(combinedAssessmentScores, 'finance_fraud_risk', ['combined']) ??
    null
  const combinedHrScore =
    pickAssessmentScore(
      combinedAssessmentScores,
      'hr_social_engineering_risk',
      ['combined'],
    ) ?? null

  const topFindings = [...findings]
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
    .slice(0, 5)

  const immediateRecommendations = getImmediateRecommendationsFromTasks(remediationTasks)

  const fallbackImmediateRecommendations = [
    'Review high-risk findings and confirm exposure relevance.',
    'Validate exposed people, roles, and public contact points.',
    'Prioritize controls against impersonation, phishing, and finance fraud scenarios.',
  ]

  const recommendationsToRender =
    immediateRecommendations.length > 0
      ? immediateRecommendations
      : fallbackImmediateRecommendations

  const strategicRecommendations = [
    'Establish a recurring HumanSurface review cycle for public exposure changes.',
    'Define ownership for exposed identities, public contact channels, and remediation follow-up.',
    'Introduce a formal validation workflow before publishing externally visible staff and role details.',
    'Track repeated findings over time to measure exposure reduction.',
  ]

  const whatChanged = [
    websiteFindings.length > 0
      ? `${websiteFindings.length} website findings are currently included in the report.`
      : 'No website findings are currently included.',
    externalFindings.length > 0
      ? `${externalFindings.length} external findings were identified from public sources beyond the website.`
      : 'No external findings were identified from additional public sources.',
    remediationTasks.length > 0
      ? `${remediationTasks.length} remediation tasks are available for prioritization.`
      : 'No remediation tasks have been added yet.',
  ]

  const summaryLine =
    scannedUrls.length > 0
      ? `${scannedPages} public pages analyzed, with ${failedUrls.length} skipped or unavailable URLs.`
      : 'No useful public pages have been analyzed yet.'

  const executiveSummary = [
    `HumanSurface assessed public website exposure and additional external signals for ${organization?.name || 'this organization'}.`,
    `The current combined overall score is ${combinedOverallScore?.score_value ?? overallScore?.score_value ?? assessment.overall_score}, with a ${normalizeLabel(combinedOverallScore?.risk_level ?? overallScore?.risk_level ?? assessment.overall_risk_level)} overall exposure profile.`,
    websiteFindings.length > 0 || externalFindings.length > 0
      ? `The assessment identified ${findings.length} total findings across website and external sources, with the most relevant themes centered on impersonation, finance fraud, and social engineering exposure.`
      : 'No material findings have been recorded yet, so the assessment should be reviewed before publication.',
    remediationTasks.length > 0
      ? `Immediate remediation actions are already available and can be prioritized for operational follow-up.`
      : 'Remediation actions have not yet been defined and should be added before final publication.',
  ].join(' ')

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
          <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
            <div className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-sm uppercase tracking-[0.18em] text-cyan-300">
                  HumanSurface report
                </div>
                <h2 className="mt-2 text-3xl font-semibold">Assessment summary</h2>
                <p className="mt-3 text-slate-400">
                  Executive-ready overview of website and external public exposure
                  that may enable phishing, impersonation, and fraud.
                </p>
                <p className="mt-3 text-sm text-slate-500">{summaryLine}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Created: {formatDateTime(assessment.created_at)}
                </p>
                {assessment.published_at ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Published: {formatDateTime(assessment.published_at)}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-4 self-start lg:self-end">
                <div className="text-right">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Combined overall score
                  </div>
                  <div className="mt-1 text-5xl font-semibold text-white">
                    {combinedOverallScore?.score_value ??
                      overallScore?.score_value ??
                      assessment.overall_score}
                  </div>
                </div>
                <RiskBadge
                  value={
                    combinedOverallScore?.risk_level ??
                    overallScore?.risk_level ??
                    assessment.overall_risk_level
                  }
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <ScoreCard
                label="Website overall"
                value={overallScore?.score_value ?? assessment.overall_score}
                risk={overallScore?.risk_level ?? assessment.overall_risk_level}
              />
              <ScoreCard
                label="External overall"
                value={externalOverallScore?.score_value ?? 0}
                risk={externalOverallScore?.risk_level ?? 'low'}
              />
              <ScoreCard
                label="Combined overall"
                value={combinedOverallScore?.score_value ?? 0}
                risk={combinedOverallScore?.risk_level ?? 'low'}
              />
              <ScoreCard
                label="Open remediation"
                value={remediationTasks.filter((task) => task.status !== 'done').length}
                risk={
                  remediationTasks.some(
                    (task) => (task.priority || '').toLowerCase() === 'high',
                  )
                    ? 'high'
                    : remediationTasks.length > 0
                      ? 'medium'
                      : 'low'
                }
              />
            </div>
          </section>

          <SectionCard title="Executive summary">
            <p className="max-w-5xl whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {executiveSummary}
            </p>
          </SectionCard>

          {shouldShowDarkwebReportSection ? (
            <DarkwebReportSection
              summary={darkwebSummary}
              scoreSnapshot={latestDarkwebScore}
            />
          ) : null}

          <SectionCard
            title="Top findings"
            subtitle="Highest-priority findings currently surfaced by the assessment."
          >
            <div className="space-y-4">
              {topFindings.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                  No findings yet.
                </div>
              ) : (
                topFindings.map((finding) => {
                  const linkedPerson = finding.person_id
                    ? people.find((p) => p.id === finding.person_id)
                    : null

                  return (
                    <article
                      key={finding.id}
                      className="rounded-2xl border border-white/10 bg-[#030815] p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-4xl">
                          <div className="font-medium text-white">{finding.title}</div>
                          {finding.description ? (
                            <div className="mt-2 text-sm leading-7 text-slate-400">
                              {finding.description}
                            </div>
                          ) : null}

                          <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                              {normalizeLabel(finding.category)}
                            </span>
                            {linkedPerson ? (
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                                {linkedPerson.full_name || linkedPerson.role_title}
                              </span>
                            ) : null}
                            {finding.evidence_origin ? (
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                                {normalizeLabel(finding.evidence_origin)}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <RiskBadge value={finding.severity} />
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="Immediate recommendations">
              <ul className="space-y-3 text-sm leading-7 text-slate-300">
                {recommendationsToRender.map((item) => (
                  <li key={item} className="rounded-2xl border border-white/10 bg-[#030815] p-4">
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Strategic recommendations">
              <ul className="space-y-3 text-sm leading-7 text-slate-300">
                {strategicRecommendations.map((item) => (
                  <li key={item} className="rounded-2xl border border-white/10 bg-[#030815] p-4">
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <SectionCard title="What changed">
            <ul className="space-y-3 text-sm leading-7 text-slate-300">
              {whatChanged.map((item) => (
                <li key={item} className="rounded-2xl border border-white/10 bg-[#030815] p-4">
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>

          <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.08] p-6 backdrop-blur-xl">
            <h2 className="mb-5 text-2xl font-semibold">Website exposure scores</h2>

            <div className="grid gap-4 md:grid-cols-4">
              <ScoreCard
                label="Website overall"
                value={overallScore?.score_value ?? assessment.overall_score}
                risk={overallScore?.risk_level ?? assessment.overall_risk_level}
              />
              <ScoreCard
                label="Website impersonation"
                value={impersonationScore?.score_value ?? 0}
                risk={impersonationScore?.risk_level ?? 'low'}
              />
              <ScoreCard
                label="Website finance"
                value={financeScore?.score_value ?? 0}
                risk={financeScore?.risk_level ?? 'low'}
              />
              <ScoreCard
                label="Website HR / social"
                value={hrScore?.score_value ?? 0}
                risk={hrScore?.risk_level ?? 'low'}
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-fuchsia-400/20 bg-fuchsia-400/[0.08] p-6 backdrop-blur-xl">
            <h2 className="mb-5 text-2xl font-semibold">External exposure scores</h2>

            <div className="grid gap-4 md:grid-cols-4">
              <ScoreCard
                label="External overall"
                value={externalOverallScore?.score_value ?? 0}
                risk={externalOverallScore?.risk_level ?? 'low'}
              />
              <ScoreCard
                label="External impersonation"
                value={externalImpersonationScore?.score_value ?? 0}
                risk={externalImpersonationScore?.risk_level ?? 'low'}
              />
              <ScoreCard
                label="External finance"
                value={externalFinanceScore?.score_value ?? 0}
                risk={externalFinanceScore?.risk_level ?? 'low'}
              />
              <ScoreCard
                label="External HR / social"
                value={externalHrScore?.score_value ?? 0}
                risk={externalHrScore?.risk_level ?? 'low'}
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-emerald-300/20 bg-emerald-300/[0.08] p-6 backdrop-blur-xl">
            <h2 className="mb-5 text-2xl font-semibold">Combined exposure scores</h2>

            <div className="grid gap-4 md:grid-cols-4">
              <ScoreCard
                label="Combined overall"
                value={combinedOverallScore?.score_value ?? 0}
                risk={combinedOverallScore?.risk_level ?? 'low'}
              />
              <ScoreCard
                label="Combined impersonation"
                value={combinedImpersonationScore?.score_value ?? 0}
                risk={combinedImpersonationScore?.risk_level ?? 'low'}
              />
              <ScoreCard
                label="Combined finance"
                value={combinedFinanceScore?.score_value ?? 0}
                risk={combinedFinanceScore?.risk_level ?? 'low'}
              />
              <ScoreCard
                label="Combined HR / social"
                value={combinedHrScore?.score_value ?? 0}
                risk={combinedHrScore?.risk_level ?? 'low'}
              />
            </div>
          </div>

          <SectionCard title="Website scan diagnostics">
            {scanDiagnostics?.error ? (
              <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
                <div className="text-sm font-medium text-red-200">Scan error</div>
                <div className="mt-2 break-words text-sm text-red-100">
                  {scanDiagnostics.error}
                </div>
                {scanDiagnostics.failedAt ? (
                  <div className="mt-2 text-xs text-red-200/70">
                    Failed at: {formatDateTime(scanDiagnostics.failedAt)}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              <DiagnosticCard label="Scanned URLs" value={scannedUrls.length} />
              <DiagnosticCard label="Processed pages" value={scannedPages} />
              <DiagnosticCard label="Skipped / failed URLs" value={failedUrls.length} />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <DiagnosticCard label="People detected" value={peopleDetected} />
              <DiagnosticCard label="People inserted" value={peopleInserted} />
              <DiagnosticCard label="People matched existing" value={peopleMatchedExisting} />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <DiagnosticCard label="Findings inserted" value={findingsInserted} />
              <DiagnosticCard label="Findings linked to people" value={findingsLinkedToPeople} />
              <DiagnosticCard label="Person scores generated" value={personScoresGenerated} />
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
          </SectionCard>

          <div className="rounded-[28px] border border-fuchsia-400/20 bg-fuchsia-400/[0.08] p-6 backdrop-blur-xl">
            <h2 className="mb-5 text-2xl font-semibold">External exposure diagnostics</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <DiagnosticCard label="External sources scanned" value={externalSourcesScanned} />
              <DiagnosticCard label="External signals accepted" value={externalSignalsAccepted} />
              <DiagnosticCard label="External findings inserted" value={externalFindingsInserted} />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <DiagnosticCard label="External people detected" value={externalPeopleDetected} />
              <DiagnosticCard label="External people inserted" value={externalPeopleInserted} />
              <DiagnosticCard
                label="External people matched existing"
                value={externalPeopleMatchedExisting}
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <DiagnosticCard
                label="External findings linked to people"
                value={externalFindingsLinkedToPeople}
              />
              <DiagnosticCard
                label="External person scores generated"
                value={externalPersonScoresGenerated}
              />
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  External completed
                </div>
                <div className="mt-2 text-sm text-white">
                  {scanDiagnostics?.externalCompletedAt
                    ? formatDateTime(scanDiagnostics.externalCompletedAt)
                    : '—'}
                </div>
              </div>
            </div>
          </div>

          {externalSearchDebug.length > 0 ? (
            <SectionCard title="External search debug">
              <div className="space-y-3">
                {externalSearchDebug.map((item, index) => (
                  <div
                    key={`${item.query}-${index}`}
                    className="rounded-2xl border border-white/10 bg-[#030815] p-4"
                  >
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="break-words text-sm font-medium text-white">
                          {item.query}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {item.ok ? 'ok' : 'failed'} · results: {item.resultCount}
                        </div>
                        {item.error ? (
                          <div className="mt-2 text-xs text-red-300">{item.error}</div>
                        ) : null}
                      </div>

                      <div className="shrink-0">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${
                            item.ok
                              ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
                              : 'border-red-400/20 bg-red-400/10 text-red-200'
                          }`}
                        >
                          {item.ok ? 'ok' : 'failed'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-2">
            <FindingsSection
              title="Website findings"
              findings={websiteFindings}
              people={people}
            />
            <FindingsSection
              title="External findings"
              findings={externalFindings}
              people={people}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <PeopleScoresSection
              title="Website exposed people / roles"
              scores={websitePersonScores}
              people={websitePeople}
              accent="cyan"
            />
            <PeopleScoresSection
              title="External exposed people / roles"
              scores={externalPersonScores}
              people={externalPeople}
              accent="fuchsia"
            />
          </div>

          <SectionCard title="Immediate remediation">
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
                        priority · {normalizeLabel(task.priority)}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                        effort · {normalizeLabel(task.effort)}
                      </span>
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-cyan-100">
                        impact · {normalizeLabel(task.impact)}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                        status · {normalizeLabel(task.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  )
}

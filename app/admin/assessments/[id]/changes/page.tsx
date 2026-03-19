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

function DiffCard({
  label,
  current,
  previous,
}: {
  label: string
  current: number
  previous: number
}) {
  const delta = current - previous
  const deltaText = delta > 0 ? `+${delta}` : `${delta}`

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <div className="text-3xl font-semibold text-white">{current}</div>
          <div className="mt-1 text-sm text-slate-500">Previous: {previous}</div>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            delta > 0
              ? 'bg-fuchsia-400/10 text-fuchsia-200'
              : delta < 0
                ? 'bg-emerald-400/10 text-emerald-200'
                : 'bg-white/5 text-slate-300'
          }`}
        >
          {deltaText}
        </div>
      </div>
    </div>
  )
}

function findingKey(finding: Pick<Finding, 'title' | 'category' | 'severity'>) {
  return `${finding.title}|${finding.category}|${finding.severity}`
}

function personKey(person: Pick<Person, 'full_name' | 'role_title' | 'email'>) {
  return `${person.full_name ?? ''}|${person.role_title}|${person.email ?? ''}`
}

export default async function AssessmentChangesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const [
    { data: currentAssessmentData },
    { data: allAssessmentsData },
    { data: organizationsData },
    { data: findingsData },
    { data: peopleData },
    { data: scoresData },
    { data: remediationData },
  ] = await Promise.all([
    supabase.from('assessments').select('*').eq('id', id).maybeSingle(),
    supabase.from('assessments').select('*').order('created_at', { ascending: false }),
    supabase.from('organizations').select('*'),
    supabase.from('findings').select('*'),
    supabase.from('people').select('*'),
    supabase.from('scores').select('*'),
    supabase.from('remediation_tasks').select('*'),
  ])

  const currentAssessment = currentAssessmentData as Assessment | null
  if (!currentAssessment) notFound()

  const allAssessments = (allAssessmentsData ?? []) as Assessment[]
  const organizations = (organizationsData ?? []) as Organization[]
  const findings = (findingsData ?? []) as Finding[]
  const people = (peopleData ?? []) as Person[]
  const scores = (scoresData ?? []) as Score[]
  const remediationTasks = (remediationData ?? []) as RemediationTask[]

  const organization =
    organizations.find((org) => org.id === currentAssessment.organization_id) ?? null

  const orgAssessments = allAssessments
    .filter((a) => a.organization_id === currentAssessment.organization_id)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  const currentIndex = orgAssessments.findIndex((a) => a.id === currentAssessment.id)
  const previousAssessment =
    currentIndex >= 0 ? orgAssessments[currentIndex + 1] ?? null : null

  const currentFindings = findings.filter((f) => f.assessment_id === currentAssessment.id)
  const previousFindings = previousAssessment
    ? findings.filter((f) => f.assessment_id === previousAssessment.id)
    : []

  const currentScores = scores.filter(
    (s) => s.assessment_id === currentAssessment.id && s.person_id === null
  )
  const previousScores = previousAssessment
    ? scores.filter((s) => s.assessment_id === previousAssessment.id && s.person_id === null)
    : []

  const currentRemediation = remediationTasks.filter(
    (r) => r.assessment_id === currentAssessment.id
  )
  const previousRemediation = previousAssessment
    ? remediationTasks.filter((r) => r.assessment_id === previousAssessment.id)
    : []

  const currentPeople = people.filter(
    (p) => p.organization_id === currentAssessment.organization_id
  )

  const currentFindingMap = new Map(currentFindings.map((f) => [findingKey(f), f]))
  const previousFindingMap = new Map(previousFindings.map((f) => [findingKey(f), f]))

  const newFindings = currentFindings.filter((f) => !previousFindingMap.has(findingKey(f)))
  const removedFindings = previousFindings.filter((f) => !currentFindingMap.has(findingKey(f)))

  const currentRemMap = new Map(currentRemediation.map((r) => [r.title, r]))
  const previousRemMap = new Map(previousRemediation.map((r) => [r.title, r]))

  const newRemediation = currentRemediation.filter((r) => !previousRemMap.has(r.title))
  const removedRemediation = previousRemediation.filter((r) => !currentRemMap.has(r.title))

  const currentPeopleMap = new Map(currentPeople.map((p) => [personKey(p), p]))

  const previousPeopleLinkedToAssessment = previousFindings
    .map((f) => (f.person_id ? people.find((p) => p.id === f.person_id) ?? null : null))
    .filter(Boolean) as Person[]

  const previousPeopleMap = new Map(
    previousPeopleLinkedToAssessment.map((p) => [personKey(p), p])
  )

  const newPeople = Array.from(currentPeopleMap.values()).filter(
    (p) => !previousPeopleMap.has(personKey(p))
  )

  const getScore = (rows: Score[], type: string) =>
    rows.find((s) => s.score_type === type)?.score_value ?? 0

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              What changed
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {organization?.name || 'Unknown organization'}
            </h1>
            <p className="mt-3 text-slate-400">
              Current assessment vs previous assessment
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/assessments/${currentAssessment.id}`}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              Back to assessment
            </Link>

            <Link
              href={`/admin/assessments/${currentAssessment.id}/report`}
              className="rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Open report
            </Link>
          </div>
        </div>

        {!previousAssessment ? (
          <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-6 text-amber-200">
            No previous assessment found for this organization yet. Run at least two scans to compare changes.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Score changes</h2>
                <div className="flex items-center gap-3">
                  <RiskBadge value={currentAssessment.overall_risk_level} />
                  <span className="text-sm text-slate-400">
                    Previous: {previousAssessment.overall_risk_level}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <DiffCard
                  label="Overall"
                  current={getScore(currentScores, 'overall') || currentAssessment.overall_score}
                  previous={getScore(previousScores, 'overall') || previousAssessment.overall_score}
                />
                <DiffCard
                  label="Impersonation"
                  current={getScore(currentScores, 'impersonation_risk')}
                  previous={getScore(previousScores, 'impersonation_risk')}
                />
                <DiffCard
                  label="Finance Fraud"
                  current={getScore(currentScores, 'finance_fraud_risk')}
                  previous={getScore(previousScores, 'finance_fraud_risk')}
                />
                <DiffCard
                  label="HR / Social"
                  current={getScore(currentScores, 'hr_social_engineering_risk')}
                  previous={getScore(previousScores, 'hr_social_engineering_risk')}
                />
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.08] p-6 backdrop-blur-xl">
                <h2 className="mb-5 text-2xl font-semibold">New findings</h2>
                <div className="space-y-3">
                  {newFindings.length === 0 ? (
                    <div className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4 text-cyan-50/80">
                      No new findings detected.
                    </div>
                  ) : (
                    newFindings.map((finding) => (
                      <div key={finding.id} className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-white">{finding.title}</div>
                            {finding.description ? (
                              <div className="mt-2 text-sm leading-7 text-slate-300">
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
                <h2 className="mb-5 text-2xl font-semibold">Removed findings</h2>
                <div className="space-y-3">
                  {removedFindings.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                      No findings were removed.
                    </div>
                  ) : (
                    removedFindings.map((finding) => (
                      <div key={finding.id} className="rounded-2xl border border-white/10 bg-[#030815] p-4">
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
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <h2 className="mb-5 text-2xl font-semibold">New people / roles</h2>
                <div className="space-y-3">
                  {newPeople.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                      No new people or roles detected.
                    </div>
                  ) : (
                    newPeople.map((person) => (
                      <div key={person.id} className="rounded-2xl border border-white/10 bg-[#030815] p-4">
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
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <h2 className="mb-5 text-2xl font-semibold">Remediation changes</h2>
                <div className="space-y-3">
                  {newRemediation.length === 0 && removedRemediation.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                      No remediation changes detected.
                    </div>
                  ) : (
                    <>
                      {newRemediation.map((task) => (
                        <div key={`new-${task.id}`} className="rounded-2xl border border-cyan-200/10 bg-cyan-300/[0.06] p-4">
                          <div className="font-medium text-white">New: {task.title}</div>
                          <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">
                            priority {task.priority} · effort {task.effort} · impact {task.impact}
                          </div>
                        </div>
                      ))}

                      {removedRemediation.map((task) => (
                        <div key={`removed-${task.id}`} className="rounded-2xl border border-white/10 bg-[#030815] p-4">
                          <div className="font-medium text-white">Removed: {task.title}</div>
                          <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                            priority {task.priority} · effort {task.effort} · impact {task.impact}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
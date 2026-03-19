import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import DeleteButton from '@/app/components/admin/delete-button'
import AssessmentEditor from './assessment-editor'

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

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
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

            <Link
              href={`/admin/assessments/${assessment.id}/print`}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              Print / Export
            </Link>

            <Link
              href={`/admin/assessments/${assessment.id}/changes`}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              What changed
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

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Overview</h2>
                <RiskBadge value={assessment.overall_risk_level} />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Status
                  </div>
                  <div className="mt-2">
                    {assessment.status === 'running' ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-medium uppercase text-cyan-100">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                        running
                      </span>
                    ) : (
                      <span className="text-2xl font-semibold text-white">
                        {assessment.status}
                      </span>
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
                    {new Date(assessment.created_at).toLocaleString()}
                  </div>
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
                <Link
                  href="/admin/findings/new"
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  New finding
                </Link>
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
                <Link
                  href="/admin/people/new"
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  New person
                </Link>
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
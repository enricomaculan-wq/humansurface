import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DeleteButton from '@/app/components/admin/delete-button'
import PersonEditor from './person-editor'

type Person = {
  id: string
  organization_id: string
  full_name: string | null
  role_title: string
  department: string | null
  email: string | null
  is_key_person: boolean
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

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [
    { data: personData },
    { data: organizationsData },
    { data: findingsData },
    { data: scoresData },
  ] = await Promise.all([
    supabase.from('people').select('*').eq('id', id).maybeSingle(),
    supabase.from('organizations').select('*'),
    supabase.from('findings').select('*').eq('person_id', id).order('created_at', { ascending: false }),
    supabase.from('scores').select('*').eq('person_id', id).order('created_at', { ascending: false }),
  ])

  const person = personData as Person | null
  if (!person) notFound()

  const organizations = (organizationsData ?? []) as Organization[]
  const findings = (findingsData ?? []) as Finding[]
  const scores = (scoresData ?? []) as Score[]

  const organization =
    organizations.find((org) => org.id === person.organization_id) ?? null

  const latestScore = scores[0] ?? null

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Person detail
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {person.full_name || person.role_title}
            </h1>
            <p className="mt-3 text-slate-400">
              {person.role_title}
              {person.department ? ` · ${person.department}` : ''}
              {organization ? ` · ${organization.name}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/people"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              Back to people
            </Link>

            <DeleteButton
              table="people"
              id={person.id}
              label="Delete person"
              redirectTo="/admin/people"
            />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Overview</h2>
                {person.is_key_person ? (
                  <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-medium text-fuchsia-200">
                    Key person
                  </span>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Full name</div>
                  <div className="mt-2 text-lg font-medium text-white">{person.full_name || '—'}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Role title</div>
                  <div className="mt-2 text-lg font-medium text-white">{person.role_title}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Department</div>
                  <div className="mt-2 text-lg font-medium text-white">{person.department || '—'}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Email</div>
                  <div className="mt-2 text-lg font-medium text-white">{person.email || '—'}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:col-span-2">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Organization</div>
                  <div className="mt-2 text-lg font-medium text-white">
                    {organization?.name || 'Unknown organization'}
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    {organization?.domain || '—'}
                    {organization?.industry ? ` · ${organization.industry}` : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <h2 className="mb-5 text-2xl font-semibold">Edit person / role</h2>
              <PersonEditor
                id={person.id}
                initialFullName={person.full_name || ''}
                initialRoleTitle={person.role_title}
                initialDepartment={person.department || ''}
                initialEmail={person.email || ''}
                initialIsKeyPerson={person.is_key_person}
              />
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Linked findings</h2>
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
                    No findings linked to this person yet.
                  </div>
                ) : (
                  findings.map((finding) => (
                    <div key={finding.id} className="rounded-2xl border border-white/10 bg-[#030815] p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-4xl">
                          <div className="font-medium text-white">{finding.title}</div>
                          {finding.description ? (
                            <div className="mt-2 text-sm leading-7 text-slate-400">
                              {finding.description}
                            </div>
                          ) : null}
                          <div className="mt-3">
                            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                              {finding.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-3 lg:items-end">
                          <RiskBadge value={finding.severity} />
                          <DeleteButton table="findings" id={finding.id} label="Delete finding" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.08] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Risk score</h2>
                {latestScore ? <RiskBadge value={latestScore.risk_level} /> : null}
              </div>

              {!latestScore ? (
                <div className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4 text-cyan-50/80">
                  No person-level score yet. Recalculate assessment scores first.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-cyan-200">
                      {latestScore.score_type}
                    </div>
                    <div className="mt-2 text-4xl font-semibold text-white">
                      {latestScore.score_value}
                    </div>
                    {latestScore.reason_summary ? (
                      <div className="mt-3 text-sm leading-6 text-slate-300">
                        {latestScore.reason_summary}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <h2 className="mb-5 text-2xl font-semibold">All score records</h2>

              <div className="space-y-3">
                {scores.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                    No score records for this person.
                  </div>
                ) : (
                  scores.map((score) => (
                    <div key={score.id} className="rounded-2xl border border-white/10 bg-[#030815] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            {score.score_type}
                          </div>
                          <div className="mt-2 text-3xl font-semibold text-white">
                            {score.score_value}
                          </div>
                          {score.reason_summary ? (
                            <div className="mt-2 text-sm leading-6 text-slate-400">
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
          </div>
        </div>
      </div>
    </main>
  )
}
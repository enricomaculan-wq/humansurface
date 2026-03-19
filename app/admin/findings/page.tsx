import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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

type Assessment = {
  id: string
  organization_id: string
  status: string
}

type Organization = {
  id: string
  name: string
  domain: string
}

type Person = {
  id: string
  full_name: string | null
  role_title: string
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

export default async function FindingsListPage() {
  const [
    { data: findingsData, error: findingsError },
    { data: assessmentsData, error: assessmentsError },
    { data: organizationsData, error: organizationsError },
    { data: peopleData, error: peopleError },
  ] = await Promise.all([
    supabase.from('findings').select('*').order('created_at', { ascending: false }),
    supabase.from('assessments').select('id, organization_id, status'),
    supabase.from('organizations').select('id, name, domain'),
    supabase.from('people').select('id, full_name, role_title'),
  ])

  const error =
    findingsError || assessmentsError || organizationsError || peopleError

  const findings = (findingsData ?? []) as Finding[]
  const assessments = (assessmentsData ?? []) as Assessment[]
  const organizations = (organizationsData ?? []) as Organization[]
  const people = (peopleData ?? []) as Person[]

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Admin
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Findings
            </h1>
            <p className="mt-3 text-slate-400">
              View all findings, linked assessments, categories, and severity levels.
            </p>
          </div>

          <Link
            href="/admin/findings/new"
            className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            New finding
          </Link>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-red-400/20 bg-red-400/10 p-6 text-red-200">
            {error.message}
          </div>
        ) : findings.length === 0 ? (
          <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-6 text-amber-200">
            No findings yet.
          </div>
        ) : (
          <div className="space-y-4">
            {findings.map((finding) => {
              const assessment = assessments.find((a) => a.id === finding.assessment_id)
              const organization = assessment
                ? organizations.find((o) => o.id === assessment.organization_id)
                : null
              const person = finding.person_id
                ? people.find((p) => p.id === finding.person_id)
                : null

              return (
                <div
                  key={finding.id}
                  className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-4xl">
                      <div className="font-semibold text-white">{finding.title}</div>

                      {finding.description ? (
                        <div className="mt-3 leading-7 text-slate-400">
                          {finding.description}
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                          category · {finding.category}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                          assessment · {assessment?.status || '—'}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                          organization · {organization?.name || 'Unknown'}
                        </span>

                        {person ? (
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                            person · {person.full_name || person.role_title}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 lg:items-end">
                      <RiskBadge value={finding.severity} />
                      <div className="text-sm text-slate-500">
                        {new Date(finding.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
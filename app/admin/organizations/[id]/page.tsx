import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import RunScanButton from '@/app/components/admin/run-scan-button'

type Organization = {
  id: string
  name: string
  domain: string
  industry: string | null
  created_at: string
}

type Assessment = {
  id: string
  organization_id: string
  status: string
  overall_score: number
  overall_risk_level: string
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

export const dynamic = 'force-dynamic'

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

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const [
    { data: organizationData, error: organizationError },
    { data: assessmentsData, error: assessmentsError },
    { data: peopleData, error: peopleError },
  ] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('assessments')
      .select('*')
      .eq('organization_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('people')
      .select('*')
      .eq('organization_id', id),
  ])

  if (organizationError) {
    throw new Error(organizationError.message)
  }

  if (assessmentsError) {
    throw new Error(assessmentsError.message)
  }

  if (peopleError) {
    throw new Error(peopleError.message)
  }

  const organization = organizationData as Organization | null
  if (!organization) notFound()

  const assessments = (assessmentsData ?? []) as Assessment[]
  const people = (peopleData ?? []) as Person[]

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Organization detail
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {organization.name}
            </h1>
            <p className="mt-3 text-slate-400">
              {organization.domain}
              {organization.industry ? ` · ${organization.industry}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/organizations"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              Back to organizations
            </Link>

            <RunScanButton organizationId={organization.id} />

            <Link
              href="/admin/organizations/new"
              className="rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              New organization
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <h2 className="mb-5 text-2xl font-semibold">Assessments</h2>

            <div className="space-y-3">
              {assessments.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                  No assessments yet.
                </div>
              ) : (
                assessments.map((assessment) => (
                  <Link
                    key={assessment.id}
                    href={`/admin/assessments/${assessment.id}`}
                    className="block rounded-2xl border border-white/10 bg-[#030815] p-4 transition hover:border-cyan-300/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-white">
                          {new Date(assessment.created_at).toLocaleString()}
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          status · {assessment.status}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-2xl font-semibold text-white">
                          {assessment.overall_score}
                        </div>
                        <RiskBadge value={assessment.overall_risk_level} />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <h2 className="mb-5 text-2xl font-semibold">People / roles</h2>

            <div className="space-y-3">
              {people.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                  No people yet.
                </div>
              ) : (
                people.map((person) => (
                  <div
                    key={person.id}
                    className="rounded-2xl border border-white/10 bg-[#030815] p-4"
                  >
                    <div className="font-medium text-white">
                      {person.full_name || person.role_title}
                    </div>
                    <div className="mt-1 text-sm text-slate-400">
                      {person.role_title}
                      {person.department ? ` · ${person.department}` : ''}
                    </div>
                    {person.email ? (
                      <div className="mt-1 text-sm text-slate-500">{person.email}</div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import DeleteButton from '@/app/components/admin/delete-button'
import OrganizationEditor from './organization-editor'
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
const supabase = await createSupabaseServerClient()
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

  const [
    { data: organizationData },
    { data: assessmentsData },
    { data: peopleData },
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
      .eq('organization_id', id)
      .order('created_at', { ascending: false }),
  ])

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

            <DeleteButton
              table="organizations"
              id={organization.id}
              label="Delete organization"
              redirectTo="/admin/organizations"
            />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <h2 className="mb-5 text-2xl font-semibold">Overview</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Name</div>
                  <div className="mt-2 text-lg font-medium text-white">{organization.name}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Domain</div>
                  <div className="mt-2 text-lg font-medium text-white">{organization.domain}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Industry</div>
                  <div className="mt-2 text-lg font-medium text-white">{organization.industry || '—'}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Created</div>
                  <div className="mt-2 text-sm text-slate-300">
                    {new Date(organization.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <h2 className="mb-5 text-2xl font-semibold">Edit organization</h2>
              <OrganizationEditor
                id={organization.id}
                initialName={organization.name}
                initialDomain={organization.domain}
                initialIndustry={organization.industry || ''}
              />
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">People / Roles</h2>
                <Link
                  href="/admin/people/new"
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  New person
                </Link>
              </div>

              <div className="space-y-3">
                {people.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                    No people or roles yet.
                  </div>
                ) : (
                  people.map((person) => (
                    <div key={person.id} className="rounded-2xl border border-white/10 bg-[#030815] p-4">
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
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {person.is_key_person ? (
                            <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-medium text-fuchsia-200">
                              Key person
                            </span>
                          ) : null}

                          <Link
                            href={`/admin/people/${person.id}`}
                            className="text-sm text-cyan-200 transition hover:text-cyan-100"
                          >
                            Open
                          </Link>
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
                <h2 className="text-2xl font-semibold">Assessments</h2>
                <Link
                  href="/admin/assessments/new"
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  New assessment
                </Link>
              </div>

              <div className="space-y-3">
                {assessments.length === 0 ? (
                  <div className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4 text-cyan-50/80">
                    No assessments yet.
                  </div>
                ) : (
                  assessments.map((assessment) => (
                    <div key={assessment.id} className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.16em] text-cyan-200">
                            {assessment.status}
                          </div>
                          <div className="mt-2 text-3xl font-semibold text-white">
                            {assessment.overall_score}
                          </div>
                          <div className="mt-2 text-sm text-slate-300">
                            {new Date(assessment.created_at).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <RiskBadge value={assessment.overall_risk_level} />
                          <Link
                            href={`/admin/assessments/${assessment.id}`}
                            className="text-sm text-cyan-200 transition hover:text-cyan-100"
                          >
                            Open
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <h2 className="mb-5 text-2xl font-semibold">Quick stats</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Assessments</div>
                  <div className="mt-2 text-3xl font-semibold text-white">{assessments.length}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">People / roles</div>
                  <div className="mt-2 text-3xl font-semibold text-white">{people.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
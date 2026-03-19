import Link from 'next/link'
import AdminTopbar from '@/app/components/admin/admin-topbar'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type Organization = {
  id: string
  name: string
  domain: string
  industry: string | null
  created_at?: string
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
  email: string | null
}

type Finding = {
  id: string
  assessment_id: string
  title: string
  severity: string
  category?: string
  created_at?: string
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string | number
  helper?: string
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-3 text-4xl font-semibold text-white">{value}</div>
      {helper ? <div className="mt-2 text-sm text-slate-400">{helper}</div> : null}
    </div>
  )
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

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient()

  const [
    { data: organizationsData },
    { data: assessmentsData },
    { data: peopleData },
    { data: findingsData },
  ] = await Promise.all([
    supabase.from('organizations').select('*').order('created_at', { ascending: false }),
    supabase.from('assessments').select('*').order('created_at', { ascending: false }),
    supabase.from('people').select('*'),
    supabase.from('findings').select('*').order('created_at', { ascending: false }),
  ])

  const organizations = (organizationsData ?? []) as Organization[]
  const assessments = (assessmentsData ?? []) as Assessment[]
  const people = (peopleData ?? []) as Person[]
  const findings = (findingsData ?? []) as Finding[]

  const runningAssessments = assessments.filter((item) => item.status === 'running').length
  const completedAssessments = assessments.filter((item) => item.status === 'completed').length
  const highRiskAssessments = assessments.filter((item) => item.overall_risk_level === 'high').length

  const latestAssessments = assessments.slice(0, 6)
  const latestOrganizations = organizations.slice(0, 6)
  const latestFindings = findings.slice(0, 6)

  return (
    <>
      <AdminTopbar
        title="Dashboard"
        subtitle="Overview of organizations, assessments, findings, and scanner activity."
        primaryAction={{
          label: 'New organization',
          href: '/admin/organizations/new',
        }}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Organizations"
          value={organizations.length}
          helper="Tracked organizations in the workspace."
        />
        <StatCard
          label="Assessments"
          value={assessments.length}
          helper={`${completedAssessments} completed · ${runningAssessments} running`}
        />
        <StatCard
          label="People / Roles"
          value={people.length}
          helper="Publicly visible people and roles collected so far."
        />
        <StatCard
          label="Findings"
          value={findings.length}
          helper={`${highRiskAssessments} high-risk assessments currently recorded.`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Latest assessments</h2>
            <Link href="/admin/assessments" className="text-sm text-cyan-300 transition hover:text-cyan-200">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {latestAssessments.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                No assessments yet.
              </div>
            ) : (
              latestAssessments.map((assessment) => {
                const organization = organizations.find((org) => org.id === assessment.organization_id)

                return (
                  <Link
                    key={assessment.id}
                    href={`/admin/assessments/${assessment.id}`}
                    className="block rounded-2xl border border-white/10 bg-[#030815] p-4 transition hover:border-cyan-300/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-white">
                          {organization?.name || 'Unknown organization'}
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          {organization?.domain || '—'}
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          {new Date(assessment.created_at).toLocaleString()}
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
                )
              })
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Latest organizations</h2>
            <Link href="/admin/organizations" className="text-sm text-cyan-300 transition hover:text-cyan-200">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {latestOrganizations.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
                No organizations yet.
              </div>
            ) : (
              latestOrganizations.map((organization) => (
                <Link
                  key={organization.id}
                  href={`/admin/organizations/${organization.id}`}
                  className="block rounded-2xl border border-white/10 bg-[#030815] p-4 transition hover:border-cyan-300/20"
                >
                  <div className="font-medium text-white">{organization.name}</div>
                  <div className="mt-1 text-sm text-slate-400">
                    {organization.domain}
                    {organization.industry ? ` · ${organization.industry}` : ''}
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Latest findings</h2>
          <Link href="/admin/findings" className="text-sm text-cyan-300 transition hover:text-cyan-200">
            View all
          </Link>
        </div>

        <div className="space-y-3">
          {latestFindings.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
              No findings yet.
            </div>
          ) : (
            latestFindings.map((finding) => (
              <div
                key={finding.id}
                className="rounded-2xl border border-white/10 bg-[#030815] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-white">{finding.title}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                      {finding.category || 'general'}
                    </div>
                  </div>

                  <RiskBadge value={finding.severity} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  )
}
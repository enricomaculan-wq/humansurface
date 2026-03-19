import Link from 'next/link'
import AdminTopbar from '@/app/components/admin/admin-topbar'
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

export default async function AssessmentsPage() {
  const supabase = await createSupabaseServerClient()

  const [{ data: assessmentsData }, { data: organizationsData }] = await Promise.all([
    supabase.from('assessments').select('*').order('created_at', { ascending: false }),
    supabase.from('organizations').select('id, name, domain'),
  ])

  const assessments = (assessmentsData ?? []) as Assessment[]
  const organizations = (organizationsData ?? []) as Organization[]

  return (
    <>
      <AdminTopbar
        title="Assessments"
        subtitle="Review completed scans, scores, and report status."
      />

      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
        <div className="mb-5 text-sm uppercase tracking-[0.16em] text-slate-500">
          All assessments
        </div>

        <div className="space-y-3">
          {assessments.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
              No assessments yet.
            </div>
          ) : (
            assessments.map((assessment) => {
              const organization = organizations.find((org) => org.id === assessment.organization_id)

              return (
                <Link
                  key={assessment.id}
                  href={`/admin/assessments/${assessment.id}`}
                  className="block rounded-2xl border border-white/10 bg-[#030815] p-5 transition hover:border-cyan-300/20"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {organization?.name || 'Unknown organization'}
                      </div>
                      <div className="mt-1 text-sm text-slate-400">
                        {organization?.domain || '—'}
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        status · {assessment.status}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {new Date(assessment.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-3xl font-semibold text-white">
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
    </>
  )
}
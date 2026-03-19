import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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

type Assessment = {
  id: string
  organization_id: string
  status: string
  overall_score: number
}

type Organization = {
  id: string
  name: string
  domain: string
}

function Pill({
  children,
  tone = 'default',
}: {
  children: React.ReactNode
  tone?: 'default' | 'cyan' | 'fuchsia'
}) {
  const cls =
    tone === 'fuchsia'
      ? 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200'
      : tone === 'cyan'
      ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
      : 'border-white/10 bg-white/[0.03] text-slate-300'

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${cls}`}>
      {children}
    </span>
  )
}

export default async function RemediationListPage() {
  const [
    { data: remediationData, error: remediationError },
    { data: assessmentsData, error: assessmentsError },
    { data: organizationsData, error: organizationsError },
  ] = await Promise.all([
    supabase.from('remediation_tasks').select('*').order('created_at', { ascending: false }),
    supabase.from('assessments').select('id, organization_id, status, overall_score'),
    supabase.from('organizations').select('id, name, domain'),
  ])

  const error = remediationError || assessmentsError || organizationsError

  const remediationTasks = (remediationData ?? []) as RemediationTask[]
  const assessments = (assessmentsData ?? []) as Assessment[]
  const organizations = (organizationsData ?? []) as Organization[]

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Admin
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Remediation Tasks
            </h1>
            <p className="mt-3 text-slate-400">
              View and manage remediation items linked to assessments.
            </p>
          </div>

          <Link
            href="/admin/remediation/new"
            className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            New remediation task
          </Link>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-red-400/20 bg-red-400/10 p-6 text-red-200">
            {error.message}
          </div>
        ) : remediationTasks.length === 0 ? (
          <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-6 text-amber-200">
            No remediation tasks yet.
          </div>
        ) : (
          <div className="space-y-4">
            {remediationTasks.map((task) => {
              const assessment = assessments.find((a) => a.id === task.assessment_id)
              const org = assessment
                ? organizations.find((o) => o.id === assessment.organization_id)
                : null

              return (
                <div
                  key={task.id}
                  className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="font-semibold text-white">{task.title}</div>
                      <div className="mt-3 text-sm text-slate-400">
                        {org?.name || 'Unknown organization'}
                        {org?.domain ? ` · ${org.domain}` : ''}
                        {assessment ? ` · assessment score ${assessment.overall_score}` : ''}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Pill tone="fuchsia">priority · {task.priority}</Pill>
                        <Pill>effort · {task.effort}</Pill>
                        <Pill tone="cyan">impact · {task.impact}</Pill>
                        <Pill>status · {task.status}</Pill>
                      </div>
                    </div>

                    {assessment ? (
                      <Link
                        href={`/admin/assessments/${assessment.id}/report`}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
                      >
                        Open report
                      </Link>
                    ) : null}
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
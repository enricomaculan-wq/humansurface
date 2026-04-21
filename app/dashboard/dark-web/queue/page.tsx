import Link from 'next/link'
import { DarkWebNav } from '../assets/_components/darkweb-nav'
import { getDarkWebAssignedWork } from '@/lib/darkweb/queries'

export default async function DarkWebQueuePage() {
  const queue = await getDarkWebAssignedWork()

  const owner = queue.owner
  const findings = queue.findings
  const tasks = queue.tasks

  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">My Queue</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Review findings and remediation work assigned to your profile within the current organization.
          </p>
        </div>

        <DarkWebNav current="queue" />
      </section>

      {!owner ? (
        <section className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            No person profile is linked to your current account for this organization.
            Assigned work cannot be resolved yet.
          </div>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-white/10 bg-[#071020] p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <InfoCard label="Owner" value={owner.full_name ?? owner.email ?? 'Unknown'} />
              <InfoCard label="Role" value={owner.role_title ?? '—'} />
              <InfoCard label="Assigned findings" value={String(findings.length)} />
              <InfoCard label="Assigned tasks" value={String(tasks.length)} />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Assigned findings</h2>
                <div className="text-sm text-slate-400">
                  {findings.length} item{findings.length === 1 ? '' : 's'}
                </div>
              </div>

              <div className="space-y-4">
                {findings.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                    No findings are currently assigned to you.
                  </div>
                ) : (
                  findings.map((finding) => (
                    <div
                      key={finding.id}
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/dashboard/dark-web/findings/${finding.id}`}
                            className="text-base font-medium text-white underline-offset-4 hover:underline"
                          >
                            {finding.title}
                          </Link>
                          <div className="mt-1 text-xs text-slate-400">
                            {humanizeValue(finding.category)} · {humanizeValue(finding.source_type)}
                          </div>
                        </div>

                        <SeverityBadge severity={finding.severity} />
                      </div>

                      {finding.description ? (
                        <p className="mb-3 text-sm leading-6 text-slate-300">
                          {finding.description}
                        </p>
                      ) : null}

                      <div className="grid gap-2 text-xs text-slate-400 md:grid-cols-3">
                        <div>Status: {humanizeValue(finding.finding_status)}</div>
                        <div>
                          Confidence:{' '}
                          {typeof finding.confidence === 'number'
                            ? `${Math.round(finding.confidence * 100)}%`
                            : '—'}
                        </div>
                        <div>
                          Last seen:{' '}
                          {finding.last_seen_at
                            ? new Date(finding.last_seen_at).toLocaleString()
                            : '—'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Assigned tasks</h2>
                <div className="text-sm text-slate-400">
                  {tasks.length} item{tasks.length === 1 ? '' : 's'}
                </div>
              </div>

              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                    No remediation tasks are currently assigned to you.
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="text-base font-medium text-white">{task.title}</div>
                        <TaskStatusBadge status={task.status} />
                      </div>

                      <div className="grid gap-2 text-xs text-slate-400 md:grid-cols-4">
                        <div>Priority: {humanizeValue(task.priority)}</div>
                        <div>Effort: {humanizeValue(task.effort)}</div>
                        <div>Impact: {humanizeValue(task.impact)}</div>
                        <div>
                          Created:{' '}
                          {task.created_at
                            ? new Date(task.created_at).toLocaleString()
                            : '—'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  )
}

function InfoCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  )
}

function SeverityBadge({ severity }: { severity: string | null }) {
  const classes =
    severity === 'critical'
      ? 'border-red-500/30 bg-red-500/10 text-red-200'
      : severity === 'high'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
        : severity === 'medium'
          ? 'border-sky-500/30 bg-sky-500/10 text-sky-200'
          : 'border-white/10 bg-white/5 text-slate-200'

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs ${classes}`}>
      {severity ?? 'unknown'}
    </span>
  )
}

function TaskStatusBadge({ status }: { status: string | null }) {
  const classes =
    status === 'completed'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
      : status === 'in_progress'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
        : 'border-white/10 bg-white/5 text-slate-200'

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs ${classes}`}>
      {status ? humanizeValue(status) : 'Unknown'}
    </span>
  )
}

function humanizeValue(value: string | null) {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}
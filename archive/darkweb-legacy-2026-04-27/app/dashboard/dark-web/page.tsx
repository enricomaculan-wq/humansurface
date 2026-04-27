import Link from 'next/link'
import { DarkWebNav } from './assets/_components/darkweb-nav'
import {
  getDarkWebFindings,
  getDarkWebOverview,
  getDarkWebRemediationTasks,
  getDarkWebTopExposedAssets,
} from '@/lib/darkweb/queries'

export default async function DarkWebPage() {
  const [overview, findings, tasks, topAssets] = await Promise.all([
    getDarkWebOverview(),
    getDarkWebFindings(),
    getDarkWebRemediationTasks(),
    getDarkWebTopExposedAssets(3),
  ])

  const overallScore =
    overview?.snapshot?.overall_exposure_score ??
    overview?.assessment?.overall_score ??
    0

  const executiveSummary =
    overview?.assessment?.executive_summary ?? 'No executive summary available.'

  const whatChanged = overview?.assessment?.what_changed ?? null

  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dark Web</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Hidden exposure tied to your people, emails, and brand.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/dark-web/report"
            className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20"
          >
            Export report
          </Link>

          <Link
            href="/dashboard/dark-web/metrics"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            View metrics
          </Link>
        </div>

        <DarkWebNav current="overview" />
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard
          label="Overall Score"
          value={String(overallScore ?? 0)}
          helper="Current dark web risk snapshot"
        />
        <MetricCard
          label="Total Findings"
          value={String(findings.length)}
          helper="Active exposure records"
        />
        <MetricCard
          label="Critical Findings"
          value={String(findings.filter((f) => f.severity === 'critical').length)}
          helper="Immediate action required"
        />
        <MetricCard
          label="Open Tasks"
          value={String(tasks.filter((t) => t.status !== 'done' && t.status !== 'completed').length)}
          helper="Recommended response actions"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-[#071020] p-5">
          <h2 className="mb-3 text-lg font-semibold text-white">Executive summary</h2>
          <p className="text-sm leading-7 text-slate-300">{executiveSummary}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#071020] p-5">
          <h2 className="mb-3 text-lg font-semibold text-white">What changed</h2>
          <WhatChangedBlock value={whatChanged} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-[#071020] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Immediate actions</h2>
            <Link
              href="/dashboard/dark-web/findings"
              className="text-sm text-sky-300 underline-offset-4 hover:underline"
            >
              View findings
            </Link>
          </div>

          <div className="grid gap-3">
            {tasks.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                No remediation tasks available.
              </div>
            ) : (
              tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium text-white">{task.title}</h3>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <div className="text-xs text-slate-400">
                    Effort: {humanizeValue(task.effort)} · Impact: {humanizeValue(task.impact)} ·
                    {' '}Status: {humanizeValue(task.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#071020] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Top exposed assets</h2>
            <Link
              href="/dashboard/dark-web/assets"
              className="text-sm text-sky-300 underline-offset-4 hover:underline"
            >
              View assets
            </Link>
          </div>

          <div className="space-y-3">
            {topAssets.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                No monitored assets available.
              </div>
            ) : (
              topAssets.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/dashboard/dark-web/assets/${asset.id}`}
                  className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {asset.display_name ?? asset.value}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {humanizeValue(asset.asset_type)} · {asset.value}
                      </div>
                    </div>

                    <CriticalityBadge criticality={asset.criticality} />
                  </div>

                  <div className="text-xs text-slate-400">
                    Findings linked: {asset.findings_count}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#071020] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Recent findings</h2>
          <Link
            href="/dashboard/dark-web/findings"
            className="text-sm text-sky-300 underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-3">
          {findings.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
              No findings available for the current organization.
            </div>
          ) : (
            findings.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/dark-web/findings/${item.id}`}
                className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium text-white">{item.title}</h3>
                  <SeverityBadge severity={item.severity} />
                </div>

                <p className="text-sm text-slate-300">{item.description}</p>

                <div className="mt-3 text-xs text-slate-400">
                  {humanizeValue(item.category)} · {humanizeValue(item.source_type)} ·{' '}
                  {item.last_seen_at ? new Date(item.last_seen_at).toLocaleString() : '—'}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  )
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071020] p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-xs text-slate-500">{helper}</div>
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

function PriorityBadge({ priority }: { priority: string | null }) {
  const classes =
    priority === 'critical'
      ? 'border-red-500/30 bg-red-500/10 text-red-200'
      : priority === 'high'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
        : priority === 'medium'
          ? 'border-sky-500/30 bg-sky-500/10 text-sky-200'
          : 'border-white/10 bg-white/5 text-slate-200'

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs ${classes}`}>
      {priority ?? 'unknown'}
    </span>
  )
}

function CriticalityBadge({ criticality }: { criticality: string | null }) {
  const classes =
    criticality === 'critical'
      ? 'border-red-500/30 bg-red-500/10 text-red-200'
      : criticality === 'high'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
        : criticality === 'medium'
          ? 'border-sky-500/30 bg-sky-500/10 text-sky-200'
          : 'border-white/10 bg-white/5 text-slate-200'

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs ${classes}`}>
      {criticality ?? 'unknown'}
    </span>
  )
}

function WhatChangedBlock({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="text-sm text-slate-300">
            • {String(item)}
          </div>
        ))}
      </div>
    )
  }

  if (typeof value === 'string' && value.trim()) {
    return <p className="text-sm text-slate-300">{value}</p>
  }

  return <p className="text-sm text-slate-400">No recent changes recorded.</p>
}

function humanizeValue(value: string | null) {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}
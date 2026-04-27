import Link from 'next/link'
import {
  getDarkWebFindings,
  getDarkWebOverview,
  getDarkWebMonitoredAssets,
  getDarkWebRemediationTasks,
  getDarkWebTopExposedAssets,
} from '@/lib/darkweb/queries'
import { PrintButton } from './_components/print-button'

export default async function DarkWebReportPage() {
  const [overview, findings, tasks, topAssets, assets] = await Promise.all([
    getDarkWebOverview(),
    getDarkWebFindings(),
    getDarkWebRemediationTasks(),
    getDarkWebTopExposedAssets(5),
    getDarkWebMonitoredAssets(),
  ])

  const criticalFindings = findings.filter((f) => f.severity === 'critical')
  const highFindings = findings.filter((f) => f.severity === 'high')
  const mediumFindings = findings.filter((f) => f.severity === 'medium')
  const lowFindings = findings.filter((f) => f.severity === 'low')

  const overallScore =
    overview?.snapshot?.overall_exposure_score ??
    overview?.assessment?.overall_score ??
    0

  const executiveSummary =
    overview?.assessment?.executive_summary ?? 'No executive summary available.'

  const whatChanged = overview?.assessment?.what_changed ?? null

  return (
    <main className="min-h-screen bg-[#020817] p-6 text-white print:bg-white print:text-slate-900">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="flex items-center justify-between gap-4 print:hidden">
          <Link
            href="/dashboard/dark-web"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Back to dark web
          </Link>

          <PrintButton />
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#071020] p-8 print:border-slate-200 print:bg-white">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400 print:text-slate-500">
                HumanSurface
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight print:text-slate-900">
                Dark Web Exposure Report
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 print:text-slate-700">
                Executive summary of hidden exposure tied to monitored people, emails,
                domains, and brand signals.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-right print:border-slate-200 print:bg-slate-50">
              <div className="text-xs uppercase tracking-wide text-slate-500">Report score</div>
              <div className="mt-2 text-4xl font-semibold">{overallScore}</div>
              <div className="mt-2 text-xs text-slate-400 print:text-slate-600">
                Generated from current organization assessment
              </div>
              <div className="mt-3 text-xs text-slate-400 print:text-slate-600">
                Generated on {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <ReportMetric label="Overall Score" value={String(overallScore)} />
          <ReportMetric label="Total Findings" value={String(findings.length)} />
          <ReportMetric
            label="Critical Findings"
            value={String(criticalFindings.length)}
          />
          <ReportMetric
            label="Open Tasks"
            value={String(tasks.filter((t) => t.status !== 'done' && t.status !== 'completed').length)}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <Panel title="Executive summary">
            <p className="text-sm leading-7 text-slate-300 print:text-slate-700">
              {executiveSummary}
            </p>
          </Panel>

          <Panel title="What changed">
            <WhatChangedBlock value={whatChanged} />
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Panel title="Risk distribution">
            <div className="space-y-3">
              <RiskRow label="Critical" count={criticalFindings.length} tone="critical" />
              <RiskRow label="High" count={highFindings.length} tone="high" />
              <RiskRow label="Medium" count={mediumFindings.length} tone="medium" />
              <RiskRow label="Low" count={lowFindings.length} tone="low" />
            </div>
          </Panel>

          <Panel title="Monitored coverage">
            <div className="space-y-3 text-sm text-slate-300 print:text-slate-700">
              <div className="flex items-center justify-between">
                <span>Total monitored assets</span>
                <span className="font-medium text-white print:text-slate-900">
                  {assets.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Top exposed assets shown</span>
                <span className="font-medium text-white print:text-slate-900">
                  {topAssets.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Response tasks generated</span>
                <span className="font-medium text-white print:text-slate-900">
                  {tasks.length}
                </span>
              </div>
            </div>
          </Panel>
        </section>

        <Panel title="Top exposed assets">
          <div className="grid gap-3">
            {topAssets.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400 print:border-slate-200 print:bg-slate-50 print:text-slate-600">
                No monitored assets available.
              </div>
            ) : (
              topAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 print:border-slate-200 print:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white print:text-slate-900">
                        {asset.display_name ?? asset.value}
                      </div>
                      <div className="mt-1 text-xs text-slate-400 print:text-slate-600">
                        {humanizeValue(asset.asset_type)} · {asset.value}
                      </div>
                    </div>
                    <CriticalityBadge criticality={asset.criticality} />
                  </div>
                  <div className="mt-3 text-xs text-slate-400 print:text-slate-600">
                    Findings linked: {asset.findings_count}
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Priority findings">
          <div className="space-y-3">
            {findings.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400 print:border-slate-200 print:bg-slate-50 print:text-slate-600">
                No findings available for the current organization.
              </div>
            ) : (
              findings.slice(0, 6).map((finding) => (
                <div
                  key={finding.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 print:border-slate-200 print:bg-slate-50"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white print:text-slate-900">
                      {finding.title}
                    </div>
                    <SeverityBadge severity={finding.severity} />
                  </div>

                  <div className="mb-2 text-xs text-slate-400 print:text-slate-600">
                    {humanizeValue(finding.category)} · {humanizeValue(finding.source_type)} ·{' '}
                    {humanizeValue(finding.finding_status)}
                  </div>

                  <p className="text-sm leading-6 text-slate-300 print:text-slate-700">
                    {finding.description}
                  </p>

                  {finding.evidence_redacted ? (
                    <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300 print:border-slate-200 print:bg-white print:text-slate-700">
                      {finding.evidence_redacted}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Recommended response actions">
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400 print:border-slate-200 print:bg-slate-50 print:text-slate-600">
                No remediation tasks available.
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 print:border-slate-200 print:bg-slate-50"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white print:text-slate-900">
                      {task.title}
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <div className="text-xs text-slate-400 print:text-slate-600">
                    Effort: {humanizeValue(task.effort)} · Impact: {humanizeValue(task.impact)} ·
                    {' '}Status: {humanizeValue(task.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Recommended next steps">
          <div className="space-y-2 text-sm text-slate-300 print:text-slate-700">
            <div>• Reset credentials for exposed critical mailboxes.</div>
            <div>• Review MFA and active sessions for privileged accounts.</div>
            <div>• Increase monitoring for brand impersonation and phishing attempts.</div>
            <div>• Triage stealer-related exposure as a priority incident.</div>
          </div>
        </Panel>
      </div>
    </main>
  )
}

function Panel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#071020] p-6 print:border-slate-200 print:bg-white">
      <h2 className="mb-4 text-lg font-semibold text-white print:text-slate-900">
        {title}
      </h2>
      {children}
    </section>
  )
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071020] p-5 print:border-slate-200 print:bg-white">
      <div className="text-sm text-slate-400 print:text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white print:text-slate-900">
        {value}
      </div>
    </div>
  )
}

function WhatChangedBlock({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div
            key={index}
            className="text-sm text-slate-300 print:text-slate-700"
          >
            • {String(item)}
          </div>
        ))}
      </div>
    )
  }

  if (typeof value === 'string' && value.trim()) {
    return <p className="text-sm text-slate-300 print:text-slate-700">{value}</p>
  }

  return (
    <p className="text-sm text-slate-400 print:text-slate-600">
      No recent changes recorded.
    </p>
  )
}

function RiskRow({
  label,
  count,
  tone,
}: {
  label: string
  count: number
  tone: 'critical' | 'high' | 'medium' | 'low'
}) {
  const toneClass =
    tone === 'critical'
      ? 'bg-red-500/15 text-red-200 print:text-red-700'
      : tone === 'high'
        ? 'bg-amber-500/15 text-amber-200 print:text-amber-700'
        : tone === 'medium'
          ? 'bg-sky-500/15 text-sky-200 print:text-sky-700'
          : 'bg-white/5 text-slate-200 print:text-slate-700'

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3 print:border-slate-200 print:bg-slate-50">
      <span className="text-sm text-slate-300 print:text-slate-700">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs ${toneClass}`}>{count}</span>
    </div>
  )
}

function SeverityBadge({ severity }: { severity: string | null }) {
  const classes =
    severity === 'critical'
      ? 'border-red-500/30 bg-red-500/10 text-red-200 print:text-red-700'
      : severity === 'high'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200 print:text-amber-700'
        : severity === 'medium'
          ? 'border-sky-500/30 bg-sky-500/10 text-sky-200 print:text-sky-700'
          : 'border-white/10 bg-white/5 text-slate-200 print:text-slate-700'

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs ${classes}`}>
      {severity ?? 'unknown'}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string | null }) {
  const classes =
    priority === 'critical'
      ? 'border-red-500/30 bg-red-500/10 text-red-200 print:text-red-700'
      : priority === 'high'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200 print:text-amber-700'
        : priority === 'medium'
          ? 'border-sky-500/30 bg-sky-500/10 text-sky-200 print:text-sky-700'
          : 'border-white/10 bg-white/5 text-slate-200 print:text-slate-700'

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs ${classes}`}>
      {priority ?? 'unknown'}
    </span>
  )
}

function CriticalityBadge({ criticality }: { criticality: string | null }) {
  const classes =
    criticality === 'critical'
      ? 'border-red-500/30 bg-red-500/10 text-red-200 print:text-red-700'
      : criticality === 'high'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200 print:text-amber-700'
        : criticality === 'medium'
          ? 'border-sky-500/30 bg-sky-500/10 text-sky-200 print:text-sky-700'
          : 'border-white/10 bg-white/5 text-slate-200 print:text-slate-700'

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs ${classes}`}>
      {criticality ?? 'unknown'}
    </span>
  )
}

function humanizeValue(value: string | null) {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}
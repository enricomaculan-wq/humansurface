import Link from 'next/link'
import { DarkWebNav } from '../assets/_components/darkweb-nav'
import {
  getDarkWebMetrics,
  getDarkWebOverview,
  getDarkWebTopExposedAssets,
} from '@/lib/darkweb/queries'

type PageProps = {
  params: Promise<{
    assessmentId: string
  }>
}

export default async function DarkWebAssessmentPage({ params }: PageProps) {
  const { assessmentId } = await params

  const [overview, metrics, topAssets] = await Promise.all([
    getDarkWebOverview(),
    getDarkWebMetrics(),
    getDarkWebTopExposedAssets(5),
  ])

  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Assessment
            </div>
            <h1 className="text-2xl font-semibold text-white">
              Dark Web Assessment
            </h1>
            <p className="max-w-3xl text-sm text-slate-400">
              Review dark web exposure, matched findings, asset monitoring,
              and ingestion performance for the current assessment.
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div>Assessment id</div>
            <div className="mt-1 font-mono text-slate-400">{assessmentId}</div>
          </div>
        </div>

        <DarkWebNav current="overview" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Dark web exposure score"
          value={formatScore(overview?.snapshot?.darkweb_exposure_score)}
        />
        <MetricCard
          label="Overall exposure score"
          value={formatScore(overview?.snapshot?.overall_exposure_score)}
        />
        <MetricCard
          label="Total findings"
          value={String(metrics.totals.totalFindings)}
        />
        <MetricCard
          label="Critical findings"
          value={String(metrics.totals.criticalFindings)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Exposure summary</h2>
            <Link
              href="/dashboard/dark-web/findings"
              className="text-sm text-sky-300 underline-offset-4 hover:underline"
            >
              View findings
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard
              label="Open findings"
              value={String(metrics.totals.openFindings)}
            />
            <InfoCard
              label="Matched events"
              value={String(metrics.totals.matchedEvents)}
            />
            <InfoCard
              label="Processed events"
              value={`${metrics.rates.processedRate}%`}
            />
            <InfoCard
              label="Match rate"
              value={`${metrics.rates.matchRate}%`}
            />
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 text-xs uppercase tracking-[0.16em] text-slate-500">
              Findings by severity
            </div>

            <div className="space-y-3">
              {metrics.findingsBySeverity.length === 0 ? (
                <EmptyState text="No dark web findings available yet." />
              ) : (
                metrics.findingsBySeverity.map((item) => (
                  <ProgressRow
                    key={item.label}
                    label={humanizeValue(item.label)}
                    value={item.value}
                    total={metrics.totals.totalFindings || 1}
                  />
                ))
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 text-xs uppercase tracking-[0.16em] text-slate-500">
              Findings by category
            </div>

            <div className="space-y-3">
              {metrics.findingsByCategory.length === 0 ? (
                <EmptyState text="No categorized findings available yet." />
              ) : (
                metrics.findingsByCategory.map((item) => (
                  <ProgressRow
                    key={item.label}
                    label={humanizeValue(item.label)}
                    value={item.value}
                    total={metrics.totals.totalFindings || 1}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-[#071020] p-6">
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
                <EmptyState text="No monitored assets available yet." />
              ) : (
                topAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {asset.display_name ?? asset.value}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {humanizeValue(asset.asset_type)} ·{' '}
                          {humanizeValue(asset.criticality)}
                        </div>
                      </div>

                      <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs text-sky-200">
                        {asset.findings_count ?? 0} finding
                        {(asset.findings_count ?? 0) === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#071020] p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Ingestion status</h2>
              <Link
                href="/dashboard/dark-web/inbox"
                className="text-sm text-sky-300 underline-offset-4 hover:underline"
              >
                Open inbox
              </Link>
            </div>

            <div className="grid gap-3">
              <DetailRow
                label="Total raw events"
                value={String(metrics.totals.totalRawEvents)}
              />
              <DetailRow
                label="Pending events"
                value={String(metrics.totals.pendingEvents)}
              />
              <DetailRow
                label="Failed events"
                value={String(metrics.totals.failedEvents)}
              />
              <DetailRow
                label="No-match events"
                value={String(metrics.totals.noMatchEvents)}
              />
              <DetailRow
                label="Failed rate"
                value={`${metrics.rates.failedRate}%`}
              />
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 text-xs uppercase tracking-[0.16em] text-slate-500">
                Raw events by status
              </div>

              <div className="space-y-3">
                {metrics.rawEventsByStatus.length === 0 ? (
                  <EmptyState text="No raw event status data available yet." />
                ) : (
                  metrics.rawEventsByStatus.map((item) => (
                    <ProgressRow
                      key={item.label}
                      label={humanizeValue(item.label)}
                      value={item.value}
                      total={metrics.totals.totalRawEvents || 1}
                    />
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

function MetricCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071020] p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
    </div>
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
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="max-w-[60%] text-right text-sm text-white">{value}</div>
    </div>
  )
}

function ProgressRow({
  label,
  value,
  total,
}: {
  label: string
  value: number
  total: number
}) {
  const percentage =
    total > 0 ? Math.max(0, Math.min(100, Math.round((value / total) * 100))) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="text-slate-300">{label}</div>
        <div className="text-slate-400">
          {value} · {percentage}%
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-sky-500/70"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
      {text}
    </div>
  )
}

function humanizeValue(value: string | null) {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function formatScore(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return String(Math.round(value))
}
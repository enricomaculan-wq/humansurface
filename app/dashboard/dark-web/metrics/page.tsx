import Link from 'next/link'
import { DarkWebNav } from '../assets/_components/darkweb-nav'
import { getDarkWebMetrics } from '@/lib/darkweb/queries'

export default async function DarkWebMetricsPage() {
  const metrics = await getDarkWebMetrics()

  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dark Web Metrics</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Pipeline performance, matching efficiency, and exposure breakdown for the dark web module.
          </p>
        </div>

        <DarkWebNav current="metrics" />
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          label="Raw Events"
          value={String(metrics.totals.totalRawEvents)}
          helper="Total ingested events"
        />
        <MetricCard
          label="Processed"
          value={String(metrics.totals.processedEvents)}
          helper={`${metrics.rates.processedRate}% processed`}
        />
        <MetricCard
          label="Matched"
          value={String(metrics.totals.matchedEvents)}
          helper={`${metrics.rates.matchRate}% match rate`}
        />
        <MetricCard
          label="Failed"
          value={String(metrics.totals.failedEvents)}
          helper={`${metrics.rates.failedRate}% failure rate`}
        />
        <MetricCard
          label="Findings"
          value={String(metrics.totals.totalFindings)}
          helper="Generated findings"
        />
        <MetricCard
          label="Critical"
          value={String(metrics.totals.criticalFindings)}
          helper="Critical findings"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel
          title="Pipeline status"
          action={
            <Link
              href="/dashboard/dark-web/inbox"
              className="text-sm text-sky-300 underline-offset-4 hover:underline"
            >
              Open inbox
            </Link>
          }
        >
          <div className="space-y-3">
            <BarRow
              label="Processed"
              value={metrics.totals.processedEvents}
              total={metrics.totals.totalRawEvents}
            />
            <BarRow
              label="Pending"
              value={metrics.totals.pendingEvents}
              total={metrics.totals.totalRawEvents}
            />
            <BarRow
              label="No match"
              value={metrics.totals.noMatchEvents}
              total={metrics.totals.totalRawEvents}
            />
            <BarRow
              label="Failed"
              value={metrics.totals.failedEvents}
              total={metrics.totals.totalRawEvents}
            />
          </div>
        </Panel>

        <Panel
          title="Exposure snapshot"
          action={
            <Link
              href="/dashboard/dark-web/findings"
              className="text-sm text-sky-300 underline-offset-4 hover:underline"
            >
              View findings
            </Link>
          }
        >
          <div className="grid gap-3 md:grid-cols-2">
            <MiniStat
              label="Open findings"
              value={String(metrics.totals.openFindings)}
            />
            <MiniStat
              label="Critical findings"
              value={String(metrics.totals.criticalFindings)}
            />
            <MiniStat
              label="Pending raw events"
              value={String(metrics.totals.pendingEvents)}
            />
            <MiniStat
              label="Failed raw events"
              value={String(metrics.totals.failedEvents)}
            />
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
        <Panel title="Findings by category">
          <div className="space-y-3">
            {metrics.findingsByCategory.length === 0 ? (
              <EmptyState text="No category data available." />
            ) : (
              metrics.findingsByCategory.map((row) => (
                <MetricRow
                  key={row.label}
                  label={humanizeValue(row.label)}
                  value={row.value}
                />
              ))
            )}
          </div>
        </Panel>

        <Panel title="Findings by severity">
          <div className="space-y-3">
            {metrics.findingsBySeverity.length === 0 ? (
              <EmptyState text="No severity data available." />
            ) : (
              metrics.findingsBySeverity.map((row) => (
                <MetricRow
                  key={row.label}
                  label={humanizeValue(row.label)}
                  value={row.value}
                  badgeTone={row.label}
                />
              ))
            )}
          </div>
        </Panel>

        <Panel title="Raw events by status">
          <div className="space-y-3">
            {metrics.rawEventsByStatus.length === 0 ? (
              <EmptyState text="No status data available." />
            ) : (
              metrics.rawEventsByStatus.map((row) => (
                <MetricRow
                  key={row.label}
                  label={humanizeValue(row.label)}
                  value={row.value}
                />
              ))
            )}
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel title="Operational recommendations">
          <div className="space-y-3 text-sm text-slate-300">
            <Recommendation
              title="Keep pending events low"
              text="Use the inbox regularly and process pending raw events before they accumulate."
            />
            <Recommendation
              title="Watch failure rate"
              text="If failed events rise, inspect ingestion schemas and missing fields first."
            />
            <Recommendation
              title="Improve matching quality"
              text="Expand monitored assets and brand variants to increase useful detection coverage."
            />
          </div>
        </Panel>

        <Panel title="Next actions">
          <div className="space-y-3">
            <ActionLink href="/dashboard/dark-web/inbox" label="Review raw events inbox" />
            <ActionLink href="/dashboard/dark-web/findings" label="Triage open findings" />
            <ActionLink href="/dashboard/dark-web/assets" label="Expand monitored assets" />
            <ActionLink href="/dashboard/dark-web/connectors" label="Review connectors" />
          </div>
        </Panel>
      </section>
    </main>
  )
}

function Panel({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#071020] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  )
}

function BarRow({
  label,
  value,
  total,
}: {
  label: string
  value: number
  total: number
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">
          {value} · {percent}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5">
        <div
          className="h-2 rounded-full bg-white/20"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function MetricRow({
  label,
  value,
  badgeTone,
}: {
  label: string
  value: number
  badgeTone?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
      <span className="text-sm text-slate-300">{label}</span>
      <span className={badgeClass(badgeTone)}>
        {value}
      </span>
    </div>
  )
}

function badgeClass(tone?: string) {
  if (tone === 'critical') {
    return 'rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-200'
  }
  if (tone === 'high') {
    return 'rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-200'
  }
  if (tone === 'medium') {
    return 'rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-200'
  }
  return 'rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200'
}

function Recommendation({
  title,
  text,
}: {
  title: string
  text: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="font-medium text-white">{title}</div>
      <div className="mt-1 leading-6 text-slate-300">{text}</div>
    </div>
  )
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 transition hover:bg-white/10"
    >
      {label}
    </Link>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
      {text}
    </div>
  )
}

function humanizeValue(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}
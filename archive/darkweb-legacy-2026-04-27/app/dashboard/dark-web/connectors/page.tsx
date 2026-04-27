import Link from 'next/link'
import { DarkWebNav } from '../assets/_components/darkweb-nav'
import {
  getDarkWebConnectors,
  getDarkWebConnectorStats,
} from '@/lib/darkweb/queries'
import { ConnectorActions } from './_components/connector-actions'

type PageProps = {
  searchParams: Promise<{
    created?: string
    updated?: string
  }>
}

export default async function DarkWebConnectorsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const created = params.created === '1'
  const updated = params.updated === '1'

  const [connectors, stats] = await Promise.all([
    getDarkWebConnectors(),
    getDarkWebConnectorStats(),
  ])

  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dark Web Connectors</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Manage ingestion sources, run connectors manually, and inspect sync health.
          </p>
        </div>

        <DarkWebNav current="connectors" />
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total connectors" value={String(stats.total)} />
        <MetricCard label="Active" value={String(stats.active)} />
        <MetricCard label="Paused" value={String(stats.paused)} />
        <MetricCard label="With errors" value={String(stats.failing)} />
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/dark-web/connectors/runs"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
        >
          Run history
        </Link>

        <Link
          href="/dashboard/dark-web/connectors/new"
          className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20"
        >
          New connector
        </Link>

        <Link
          href="/dashboard/dark-web/connectors/csv-upload"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
        >
          CSV upload
        </Link>
      </div>

      {created ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          Connector created successfully.
        </div>
      ) : null}

      {updated ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          Connector updated successfully.
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-[#071020] p-5">
        <div className="space-y-3">
          {connectors.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
              No connectors configured for the current organization.
            </div>
          ) : (
            connectors.map((connector) => (
              <div
                key={connector.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-medium text-white">
                      {connector.display_name}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {humanizeValue(connector.connector_type)} ·{' '}
                      {humanizeValue(connector.status)}
                    </div>
                  </div>

                  <StatusBadge
                    status={connector.last_error ? 'error' : connector.status}
                  />
                </div>

                <div className="mb-3 grid gap-2 text-xs text-slate-400 md:grid-cols-3">
                  <div>
                    Last run:{' '}
                    {connector.last_run_at
                      ? new Date(connector.last_run_at).toLocaleString()
                      : '—'}
                  </div>
                  <div>
                    Last success:{' '}
                    {connector.last_success_at
                      ? new Date(connector.last_success_at).toLocaleString()
                      : '—'}
                  </div>
                  <div>
                    Created:{' '}
                    {connector.created_at
                      ? new Date(connector.created_at).toLocaleString()
                      : '—'}
                  </div>
                </div>

                {connector.last_error ? (
                  <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                    {connector.last_error}
                  </div>
                ) : null}

                <div className="mb-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
                  <pre className="overflow-auto whitespace-pre-wrap break-words text-xs text-slate-300">
                    {JSON.stringify(connector.config, null, 2)}
                  </pre>
                </div>

                <div className="mb-3 flex flex-wrap gap-3">
                  <Link
                    href={`/dashboard/dark-web/connectors/${connector.id}/edit`}
                    className="text-xs text-sky-300 underline-offset-4 hover:underline"
                  >
                    Edit connector
                  </Link>

                  <Link
                    href={`/dashboard/dark-web/connectors/runs?connectorId=${connector.id}`}
                    className="text-xs text-sky-300 underline-offset-4 hover:underline"
                  >
                    View runs
                  </Link>
                </div>

                <ConnectorActions
                  connectorId={connector.id}
                  status={connector.status}
                />
              </div>
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

function StatusBadge({ status }: { status: string }) {
  const classes =
    status === 'active'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
      : status === 'paused'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
        : 'border-red-500/30 bg-red-500/10 text-red-200'

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs ${classes}`}>
      {humanizeValue(status)}
    </span>
  )
}

function humanizeValue(value: string | null) {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}
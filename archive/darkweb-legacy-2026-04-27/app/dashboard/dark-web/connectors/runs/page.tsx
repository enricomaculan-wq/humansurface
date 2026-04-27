import Link from 'next/link'
import { DarkWebNav } from '../../assets/_components/darkweb-nav'
import { getDarkWebConnectorRuns } from '@/lib/darkweb/queries'

type PageProps = {
  searchParams: Promise<{
    connectorId?: string
  }>
}

export default async function DarkWebConnectorRunsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const connectorId = params.connectorId?.trim() || undefined
  const runs = await getDarkWebConnectorRuns(connectorId)

  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Connector Run History</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Inspect recent connector executions, outcomes, inserted events, and failures.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/dark-web/connectors"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Back to connectors
          </Link>

          {connectorId ? (
            <Link
              href="/dashboard/dark-web/connectors/runs"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              Clear connector filter
            </Link>
          ) : null}
        </div>

        <DarkWebNav current="connectors" />
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#071020] p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="text-sm text-slate-400">
            {runs.length} run{runs.length === 1 ? '' : 's'}
          </div>

          {connectorId ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              Connector filter active
            </span>
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-500">
              All connectors
            </span>
          )}
        </div>

        <div className="space-y-3">
          {runs.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
              No connector runs available for the current filter.
            </div>
          ) : (
            runs.map((run) => (
              <div
                key={run.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-medium text-white">
                      {run.connector?.display_name ?? `Connector ${run.connector_id}`}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {run.connector?.connector_type
                        ? `${humanizeValue(run.connector.connector_type)} · `
                        : ''}
                      {humanizeValue(run.trigger_type)} · {humanizeValue(run.status)}
                    </div>
                  </div>

                  <StatusBadge status={run.status} />
                </div>

                <div className="mb-3 grid gap-2 text-xs text-slate-400 md:grid-cols-4">
                  <div>
                    Started:{' '}
                    {run.started_at ? new Date(run.started_at).toLocaleString() : '—'}
                  </div>
                  <div>
                    Finished:{' '}
                    {run.finished_at ? new Date(run.finished_at).toLocaleString() : '—'}
                  </div>
                  <div>Emitted: {run.emitted_count ?? 0}</div>
                  <div>Inserted: {run.inserted_count ?? 0}</div>
                </div>

                <div className="mb-3 text-xs text-slate-500">
                  Connector id: {run.connector_id}
                </div>

                {run.error_message ? (
                  <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                    {run.error_message}
                  </div>
                ) : null}

                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                    Metadata
                  </div>
                  <pre className="overflow-auto whitespace-pre-wrap break-words text-xs text-slate-300">
                    {JSON.stringify(run.metadata ?? {}, null, 2)}
                  </pre>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  const classes =
    status === 'success'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
      : status === 'failed'
        ? 'border-red-500/30 bg-red-500/10 text-red-200'
        : 'border-amber-500/30 bg-amber-500/10 text-amber-200'

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
import Link from 'next/link'
import { DarkWebNav } from '../assets/_components/darkweb-nav'
import { getDarkWebAlerts } from '@/lib/darkweb/queries'

type PageProps = {
  searchParams: Promise<{
    status?: string
    channel?: string
    type?: string
  }>
}

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
]

const channelOptions = [
  { value: 'all', label: 'All channels' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'email', label: 'Email' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'slack', label: 'Slack' },
]

const typeOptions = [
  { value: 'all', label: 'All alert types' },
  { value: 'new_critical_finding', label: 'New critical finding' },
  { value: 'new_high_finding', label: 'New high finding' },
]

export default async function DarkWebAlertsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const status = params.status ?? 'all'
  const channel = params.channel ?? 'all'
  const type = params.type ?? 'all'

  const alerts = await getDarkWebAlerts()

  const filteredAlerts = alerts.filter((alert) => {
    if (status !== 'all' && alert.status !== status) return false
    if (channel !== 'all' && alert.channel !== channel) return false
    if (type !== 'all' && alert.alert_type !== type) return false
    return true
  })

  const activeFilters = buildActiveAlertFilters({
    status,
    channel,
    type,
  })

  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dark Web Alerts</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Review generated dark web alerts and monitor delivery status across channels.
          </p>
        </div>

        <DarkWebNav current="alerts" />
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#071020] p-5">
        <form className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-3">
          <select
            name="status"
            defaultValue={status}
            className="rounded-xl border border-white/10 bg-[#071020] px-3 py-2 text-sm text-white outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            name="channel"
            defaultValue={channel}
            className="rounded-xl border border-white/10 bg-[#071020] px-3 py-2 text-sm text-white outline-none"
          >
            {channelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            name="type"
            defaultValue={type}
            className="rounded-xl border border-white/10 bg-[#071020] px-3 py-2 text-sm text-white outline-none"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="md:col-span-3 flex gap-3">
            <button
              type="submit"
              className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20"
            >
              Apply filters
            </button>

            <Link
              href="/dashboard/dark-web/alerts"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              Reset
            </Link>
          </div>
        </form>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="text-sm text-slate-400">
            {filteredAlerts.length} alert{filteredAlerts.length === 1 ? '' : 's'} found
          </div>

          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <span
                  key={filter}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                >
                  {filter}
                </span>
              ))}
            </div>
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-500">
              No filters active
            </span>
          )}
        </div>

        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
              No alerts match the current filters.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-medium text-white">
                      {humanizeValue(alert.alert_type)}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {humanizeValue(alert.channel)}
                      {alert.finding_id ? (
                        <>
                          {' '}
                          ·{' '}
                          <Link
                            href={`/dashboard/dark-web/findings/${alert.finding_id}`}
                            className="text-sky-300 underline-offset-4 hover:underline"
                          >
                            Open finding
                          </Link>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <StatusBadge status={alert.status} />
                </div>

                <div className="mb-3 grid gap-2 text-xs text-slate-400 md:grid-cols-3">
                  <div>
                    Created:{' '}
                    {alert.created_at
                      ? new Date(alert.created_at).toLocaleString()
                      : '—'}
                  </div>
                  <div>
                    Sent:{' '}
                    {alert.sent_at ? new Date(alert.sent_at).toLocaleString() : '—'}
                  </div>
                  <div>Channel: {humanizeValue(alert.channel)}</div>
                </div>

                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                    Payload
                  </div>
                  <pre className="overflow-auto whitespace-pre-wrap break-words text-xs text-slate-300">
                    {JSON.stringify(alert.payload ?? {}, null, 2)}
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
    status === 'sent'
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

function buildActiveAlertFilters({
  status,
  channel,
  type,
}: {
  status: string
  channel: string
  type: string
}) {
  const filters: string[] = []

  if (status !== 'all') {
    filters.push(`Status: ${humanizeValue(status)}`)
  }

  if (channel !== 'all') {
    filters.push(`Channel: ${humanizeValue(channel)}`)
  }

  if (type !== 'all') {
    filters.push(`Type: ${humanizeValue(type)}`)
  }

  return filters
}
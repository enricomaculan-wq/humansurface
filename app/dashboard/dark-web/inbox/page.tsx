import Link from 'next/link'
import { DarkWebNav } from '../assets/_components/darkweb-nav'
import { getDarkWebRawEventsInbox } from '@/lib/darkweb/queries'
import {
  ProcessAllPendingButton,
  ProcessSingleButton,
  RetryRawEventButton,
  ReprocessRawEventButton,
} from './_components/inbox-actions'

type PageProps = {
  searchParams: Promise<{
    created?: string
    imported?: string
    status?: string
    sourceType?: string
    eventType?: string
  }>
}

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processed', label: 'Processed' },
  { value: 'failed', label: 'Failed' },
  { value: 'no_match', label: 'No match' },
]

const sourceTypeOptions = [
  { value: 'all', label: 'All source types' },
  { value: 'manual', label: 'Manual' },
  { value: 'http_feed', label: 'HTTP feed' },
  { value: 'csv_upload', label: 'CSV upload' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'forum', label: 'Forum' },
  { value: 'marketplace', label: 'Marketplace' },
]

const eventTypeOptions = [
  { value: 'all', label: 'All event types' },
  { value: 'credential_exposure', label: 'Credential exposure' },
  { value: 'stealer_detected', label: 'Stealer detected' },
  { value: 'brand_mention', label: 'Brand mention' },
  { value: 'pii_exposure', label: 'PII exposure' },
  { value: 'access_mention', label: 'Access mention' },
]

export default async function DarkWebInboxPage({ searchParams }: PageProps) {
  const params = await searchParams
  const created = params.created === '1'
  const imported = params.imported ?? null
  const status = params.status ?? 'all'
  const sourceType = params.sourceType ?? 'all'
  const eventType = params.eventType ?? 'all'

  const events = await getDarkWebRawEventsInbox()

  const filteredEvents = events.filter((event) => {
    if (status !== 'all' && event.processing_status !== status) return false
    if (sourceType !== 'all' && event.source_type !== sourceType) return false
    if (eventType !== 'all' && event.event_type !== eventType) return false
    return true
  })

  const activeFilters = buildActiveInboxFilters({
    status,
    sourceType,
    eventType,
  })

  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Raw Events Inbox</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Review incoming raw dark web events, process pending items, inspect failures,
            and reprocess historical signals.
          </p>
        </div>

        <DarkWebNav current="inbox" />
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#071020] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/dark-web/inbox/new"
              className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20"
            >
              Create test raw event
            </Link>

            <ProcessAllPendingButton />
          </div>

          <div className="text-sm text-slate-400">
            {filteredEvents.length} raw event{filteredEvents.length === 1 ? '' : 's'}
          </div>
        </div>

        {created ? (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Raw event created successfully{imported ? ` (${imported} imported)` : ''}.
          </div>
        ) : null}

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
            name="sourceType"
            defaultValue={sourceType}
            className="rounded-xl border border-white/10 bg-[#071020] px-3 py-2 text-sm text-white outline-none"
          >
            {sourceTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            name="eventType"
            defaultValue={eventType}
            className="rounded-xl border border-white/10 bg-[#071020] px-3 py-2 text-sm text-white outline-none"
          >
            {eventTypeOptions.map((option) => (
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
              href="/dashboard/dark-web/inbox"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              Reset
            </Link>
          </div>
        </form>

        <div className="mb-4 flex flex-wrap items-center gap-3">
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
          {filteredEvents.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
              No raw events match the current filters.
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/dashboard/dark-web/inbox/${event.id}`}
                      className="text-base font-medium text-white underline-offset-4 hover:underline"
                    >
                      {event.title}
                    </Link>
                    <div className="mt-1 text-xs text-slate-400">
                      {humanizeValue(event.source_type)} · {humanizeValue(event.event_type)} ·{' '}
                      {humanizeValue(event.processing_status)}
                    </div>
                  </div>

                  <StatusBadge status={event.processing_status} />
                </div>

                <div className="mb-3 grid gap-2 text-xs text-slate-400 md:grid-cols-3">
                  <div>
                    Observed:{' '}
                    {event.observed_at ? new Date(event.observed_at).toLocaleString() : '—'}
                  </div>
                  <div>
                    Collected:{' '}
                    {event.collected_at ? new Date(event.collected_at).toLocaleString() : '—'}
                  </div>
                  <div>Matched assets: {event.matched_asset_count ?? 0}</div>
                </div>

                {event.processing_error ? (
                  <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                    {event.processing_error}
                  </div>
                ) : null}

                <div className="mb-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
                  <pre className="overflow-auto whitespace-pre-wrap break-words text-xs text-slate-300">
                    {JSON.stringify(event.raw_payload, null, 2)}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-2">
                  {event.processing_status === 'failed' ? (
                    <RetryRawEventButton rawEventId={event.id} />
                  ) : null}

                  {event.processing_status === 'processed' ||
                  event.processing_status === 'no_match' ? (
                    <ReprocessRawEventButton rawEventId={event.id} />
                  ) : null}

                  {event.processing_status === 'pending' ? (
                    <ProcessSingleButton rawEventId={event.id} />
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}

function humanizeValue(value: string | null) {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function StatusBadge({ status }: { status: string | null }) {
  const classes =
    status === 'processed'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
      : status === 'failed'
        ? 'border-red-500/30 bg-red-500/10 text-red-200'
        : status === 'no_match'
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
          : 'border-white/10 bg-white/5 text-slate-200'

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs ${classes}`}>
      {status ? humanizeValue(status) : 'Unknown'}
    </span>
  )
}

function buildActiveInboxFilters({
  status,
  sourceType,
  eventType,
}: {
  status: string
  sourceType: string
  eventType: string
}) {
  const filters: string[] = []

  if (status !== 'all') {
    filters.push(`Status: ${humanizeValue(status)}`)
  }

  if (sourceType !== 'all') {
    filters.push(`Source type: ${humanizeValue(sourceType)}`)
  }

  if (eventType !== 'all') {
    filters.push(`Event type: ${humanizeValue(eventType)}`)
  }

  return filters
}
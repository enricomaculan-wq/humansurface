import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DarkWebNav } from '../../assets/_components/darkweb-nav'
import { requireOwnedRawEvent } from '@/lib/darkweb/ownership'
import {
  ProcessSingleButton,
  RetryRawEventButton,
  ReprocessRawEventButton,
} from '../_components/inbox-actions'
import { getDarkWebFindingByRawEventId } from '@/lib/darkweb/queries'

type PageProps = {
  params: Promise<{
    rawEventId: string
  }>
}

export default async function DarkWebRawEventDetailPage({ params }: PageProps) {
  const { rawEventId } = await params

  let rawEvent: Awaited<ReturnType<typeof requireOwnedRawEvent>>['rawEvent']
  let linkedFinding: Awaited<ReturnType<typeof getDarkWebFindingByRawEventId>> = null

  try {
    const result = await requireOwnedRawEvent(rawEventId)
    rawEvent = result.rawEvent
    linkedFinding = await getDarkWebFindingByRawEventId(rawEventId)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load raw event.'
    if (
      message.includes('not found') ||
      message.includes('current organization')
    ) {
      notFound()
    }
    throw error
  }

  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/dark-web/inbox"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Back to inbox
          </Link>
        </div>

        <DarkWebNav current="inbox" />
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#071020] p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={rawEvent.processing_status} />
              <TypeBadge label={humanizeValue(rawEvent.source_type)} />
              <TypeBadge label={humanizeValue(rawEvent.event_type)} />
            </div>

            <h1 className="text-2xl font-semibold text-white">{rawEvent.title}</h1>

            <div className="mt-2 text-sm text-slate-400">
              {rawEvent.source_name ?? 'Unknown source'}
              {rawEvent.external_id ? ` · external id: ${rawEvent.external_id}` : ''}
            </div>
          </div>

          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">
              Actions
            </div>

            <div className="flex flex-wrap gap-2">
              {rawEvent.processing_status === 'pending' ? (
                <ProcessSingleButton rawEventId={rawEvent.id} />
              ) : null}

              {rawEvent.processing_status === 'failed' ? (
                <RetryRawEventButton rawEventId={rawEvent.id} />
              ) : null}

              {rawEvent.processing_status === 'processed' ||
              rawEvent.processing_status === 'no_match' ? (
                <ReprocessRawEventButton rawEventId={rawEvent.id} />
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            label="Observed"
            value={rawEvent.observed_at ? new Date(rawEvent.observed_at).toLocaleString() : '—'}
          />
          <InfoCard
            label="Collected"
            value={rawEvent.collected_at ? new Date(rawEvent.collected_at).toLocaleString() : '—'}
          />
          <InfoCard
            label="Matched assets"
            value={String(rawEvent.matched_asset_count ?? 0)}
          />
          <InfoCard
            label="Processed at"
            value={rawEvent.processed_at ? new Date(rawEvent.processed_at).toLocaleString() : '—'}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#071020] p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Linked finding</h2>
        </div>

        {linkedFinding ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <Link
                  href={`/dashboard/dark-web/findings/${linkedFinding.id}`}
                  className="text-base font-medium text-white underline-offset-4 hover:underline"
                >
                  {linkedFinding.title}
                </Link>
                <div className="mt-1 text-xs text-slate-400">
                  {humanizeValue(linkedFinding.category)} · {humanizeValue(linkedFinding.source_type)}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <TypeBadge label={humanizeValue(linkedFinding.severity)} />
                <StatusBadge status={linkedFinding.finding_status} />
              </div>
            </div>

            <div className="text-xs text-slate-400">Finding id: {linkedFinding.id}</div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
            No linked finding has been generated for this raw event yet.
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Processing state</h2>

          <div className="grid gap-3">
            <DetailRow label="Organization id" value={rawEvent.organization_id ?? '—'} />
            <DetailRow label="Processing status" value={humanizeValue(rawEvent.processing_status)} />
            <DetailRow label="Source type" value={humanizeValue(rawEvent.source_type)} />
            <DetailRow label="Event type" value={humanizeValue(rawEvent.event_type)} />
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-slate-400">
              Processing error
            </h3>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-slate-300">
              {rawEvent.processing_error ?? 'No processing error recorded.'}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Normalized text</h2>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-slate-300">
            {rawEvent.normalized_text ?? 'No normalized text available.'}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#071020] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Raw payload</h2>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <pre className="overflow-auto whitespace-pre-wrap break-words text-xs text-slate-300">
            {JSON.stringify(rawEvent.raw_payload ?? {}, null, 2)}
          </pre>
        </div>
      </section>
    </main>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="max-w-[60%] text-right text-sm text-white">{value}</div>
    </div>
  )
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

function TypeBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs text-sky-200">
      {label}
    </span>
  )
}

function humanizeValue(value: string | null) {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}
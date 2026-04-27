import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DarkWebNav } from '../../assets/_components/darkweb-nav'
import {
  getDarkWebFindingById,
  getDarkWebFindingEvidence,
} from '@/lib/darkweb/queries'
import { FindingWorkflow } from '../_components/finding-workflow'

type PageProps = {
  params: Promise<{
    findingId: string
  }>
}

export default async function DarkWebFindingDetailPage({ params }: PageProps) {
  const { findingId } = await params

  const [finding, evidence] = await Promise.all([
    getDarkWebFindingById(findingId),
    getDarkWebFindingEvidence(findingId),
  ])

  if (!finding) {
    notFound()
  }

  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/dark-web/findings"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Back to findings
          </Link>
        </div>

        <DarkWebNav current="findings" />
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#071020] p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <SeverityBadge severity={finding.severity} />
              <StatusBadge status={finding.finding_status} />
            </div>

            <h1 className="text-2xl font-semibold text-white">{finding.title}</h1>

            <div className="mt-2 text-sm text-slate-400">
              {humanizeValue(finding.category)} · {humanizeValue(finding.source_type)}
              {finding.source_domain ? ` · ${finding.source_domain}` : ''}
            </div>

            {finding.description ? (
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                {finding.description}
              </p>
            ) : null}
          </div>

          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Workflow
            </div>
            <div className="mt-3">
              <FindingWorkflow
                findingId={finding.id}
                status={finding.finding_status}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            label="Confidence"
            value={
              typeof finding.confidence === 'number'
                ? `${Math.round(finding.confidence * 100)}%`
                : '—'
            }
          />
          <InfoCard
            label="First seen"
            value={
              finding.first_seen_at
                ? new Date(finding.first_seen_at).toLocaleString()
                : '—'
            }
          />
          <InfoCard
            label="Last seen"
            value={
              finding.last_seen_at
                ? new Date(finding.last_seen_at).toLocaleString()
                : '—'
            }
          />
          <InfoCard
            label="Assigned to"
            value={
              finding.assigned_person?.full_name ??
              finding.assigned_person?.email ??
              'Unassigned'
            }
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Source summary</h2>

          <div className="grid gap-3">
            <DetailRow label="Source type" value={humanizeValue(finding.source_type)} />
            <DetailRow label="Source title" value={finding.source_title ?? '—'} />
            <DetailRow label="Source domain" value={finding.source_domain ?? '—'} />
            <DetailRow
              label="Category"
              value={humanizeValue(finding.category)}
            />
            <DetailRow
              label="Status"
              value={humanizeValue(finding.finding_status)}
            />
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-slate-400">
              Redacted evidence preview
            </h3>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-slate-300">
              {finding.evidence_redacted ?? 'No redacted evidence available.'}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Metadata</h2>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <pre className="overflow-auto whitespace-pre-wrap break-words text-xs text-slate-300">
              {JSON.stringify(finding.metadata ?? {}, null, 2)}
            </pre>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#071020] p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Evidence</h2>
          <div className="text-sm text-slate-400">
            {evidence.length} item{evidence.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="space-y-4">
          {evidence.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
              No evidence available for this finding.
            </div>
          ) : (
            evidence.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-white">
                      {item.source_name ?? item.source_type ?? 'Evidence'}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {humanizeValue(item.source_type)} ·{' '}
                      {item.source_reference ?? 'No reference'}
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-400">
                    <div>
                      Observed:{' '}
                      {item.observed_at
                        ? new Date(item.observed_at).toLocaleString()
                        : '—'}
                    </div>
                    <div>
                      Collected:{' '}
                      {item.collected_at
                        ? new Date(item.collected_at).toLocaleString()
                        : '—'}
                    </div>
                  </div>
                </div>

                <div className="mb-3 grid gap-2 text-xs text-slate-400 md:grid-cols-3">
                  <div>
                    Confidence:{' '}
                    {typeof item.confidence === 'number'
                      ? `${Math.round(item.confidence * 100)}%`
                      : '—'}
                  </div>
                  <div>
                    Sensitivity:{' '}
                    {item.sensitivity_level
                      ? humanizeValue(item.sensitivity_level)
                      : '—'}
                  </div>
                  <div>Raw event id: {item.raw_event_id ?? '—'}</div>
                </div>

                <div className="mb-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
                  {item.snippet_redacted ?? 'No snippet available.'}
                </div>

                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                    Matched fields
                  </div>
                  <pre className="overflow-auto whitespace-pre-wrap break-words text-xs text-slate-300">
                    {JSON.stringify(item.matched_fields ?? [], null, 2)}
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

function StatusBadge({ status }: { status: string | null }) {
  const classes =
    status === 'resolved'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
      : status === 'suppressed'
        ? 'border-slate-500/30 bg-slate-500/10 text-slate-300'
        : status === 'in_progress'
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
          : status === 'reviewed'
            ? 'border-sky-500/30 bg-sky-500/10 text-sky-200'
            : 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200'

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
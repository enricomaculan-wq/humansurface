import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DarkWebNav } from '../../assets/_components/darkweb-nav'
import {
  getDarkWebMonitoredAssetById,
  getDarkWebFindingsForAsset,
} from '@/lib/darkweb/queries'
import { AssetActions } from '../_components/asset-actions'

type PageProps = {
  params: Promise<{
    assetId: string
  }>
}

export default async function DarkWebAssetDetailPage({ params }: PageProps) {
  const { assetId } = await params

  const [asset, findings] = await Promise.all([
    getDarkWebMonitoredAssetById(assetId),
    getDarkWebFindingsForAsset(assetId),
  ])

  if (!asset) {
    notFound()
  }

  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/dark-web/assets"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Back to assets
          </Link>
        </div>

        <DarkWebNav current="assets" />
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#071020] p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <AssetTypeBadge assetType={asset.asset_type} />
              <StatusBadge isActive={asset.is_active ?? true} />
            </div>

            <h1 className="text-2xl font-semibold text-white">
              {asset.display_name ?? asset.value}
            </h1>

            <div className="mt-2 text-sm text-slate-400">
              {humanizeValue(asset.asset_type)} · {asset.value}
            </div>
          </div>

          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Asset actions
            </div>
            <div className="mt-3">
              <AssetActions
                assetId={asset.id}
                isActive={asset.is_active ?? true}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="Criticality" value={humanizeValue(asset.criticality)} />
          <InfoCard
            label="Verification"
            value={humanizeValue(asset.verification_status)}
          />
          <InfoCard
            label="Created"
            value={
              asset.created_at ? new Date(asset.created_at).toLocaleString() : '—'
            }
          />
          <InfoCard
            label="Last checked"
            value={
              asset.last_checked_at
                ? new Date(asset.last_checked_at).toLocaleString()
                : '—'
            }
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#071020] p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Linked findings</h2>
          <div className="text-sm text-slate-400">
            {findings.length} item{findings.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="space-y-4">
          {findings.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
              No findings linked to this asset.
            </div>
          ) : (
            findings.map((finding) => (
              <div
                key={finding.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/dashboard/dark-web/findings/${finding.id}`}
                      className="text-base font-medium text-white underline-offset-4 hover:underline"
                    >
                      {finding.title}
                    </Link>
                    <div className="mt-1 text-xs text-slate-400">
                      {humanizeValue(finding.category)} · {humanizeValue(finding.source_type)}
                    </div>
                  </div>

                  <SeverityBadge severity={finding.severity} />
                </div>

                {finding.description ? (
                  <p className="mb-3 text-sm leading-6 text-slate-300">
                    {finding.description}
                  </p>
                ) : null}

                <div className="grid gap-2 text-xs text-slate-400 md:grid-cols-3">
                  <div>Status: {humanizeValue(finding.finding_status)}</div>
                  <div>
                    Confidence:{' '}
                    {typeof finding.confidence === 'number'
                      ? `${Math.round(finding.confidence * 100)}%`
                      : '—'}
                  </div>
                  <div>
                    Last seen:{' '}
                    {finding.last_seen_at
                      ? new Date(finding.last_seen_at).toLocaleString()
                      : '—'}
                  </div>
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

function AssetTypeBadge({ assetType }: { assetType: string | null }) {
  return (
    <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs text-sky-200">
      {assetType ? humanizeValue(assetType) : 'Unknown'}
    </span>
  )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs ${
        isActive
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
          : 'border-slate-500/30 bg-slate-500/10 text-slate-300'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
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

function humanizeValue(value: string | null) {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}
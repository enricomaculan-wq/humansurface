import Link from 'next/link'
import { DarkWebNav } from '../assets/_components/darkweb-nav'
import { getDarkWebMonitoredAssetsFiltered } from '@/lib/darkweb/queries'
import { AssetActions } from './_components/asset-actions'

type PageProps = {
  searchParams: Promise<{
    q?: string
    assetType?: string
    criticality?: string
    sort?: string
    created?: string
  }>
}

const assetTypeOptions = [
  { value: 'all', label: 'All asset types' },
  { value: 'domain', label: 'Domain' },
  { value: 'email', label: 'Email' },
  { value: 'brand', label: 'Brand' },
  { value: 'person', label: 'Person' },
  { value: 'username', label: 'Username' },
  { value: 'phone', label: 'Phone' },
]

const criticalityOptions = [
  { value: 'all', label: 'All criticalities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const sortOptions = [
  { value: 'most_exposed', label: 'Most exposed' },
  { value: 'criticality', label: 'Highest criticality' },
  { value: 'name_asc', label: 'Name A–Z' },
]

export default async function DarkWebAssetsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const q = params.q ?? ''
  const assetType = params.assetType ?? 'all'
  const criticality = params.criticality ?? 'all'
  const sort = params.sort ?? 'most_exposed'
  const created = params.created === '1'

  const assets = await getDarkWebMonitoredAssetsFiltered({
    q,
    assetType,
    criticality,
    sort,
  })

  const activeFilters = buildActiveAssetFilters({
    q,
    assetType,
    criticality,
    sort,
  })

  return (
    <main className="p-6">
      <div className="rounded-2xl border border-white/10 bg-[#071020] p-5">
        <h1 className="mb-4 text-2xl font-semibold text-white">Monitored Assets</h1>

        <div className="mb-4">
          <DarkWebNav current="assets" />
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href="/dashboard/dark-web/assets/new"
            className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20"
          >
            Add monitored asset
          </Link>

          <Link
            href="/dashboard/dark-web/setup"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            Setup guide
          </Link>
        </div>

        {created ? (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Monitored asset created successfully.
          </div>
        ) : null}

        <form className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-4">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search asset name or value"
            className="rounded-xl border border-white/10 bg-[#071020] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
          />

          <select
            name="assetType"
            defaultValue={assetType}
            className="rounded-xl border border-white/10 bg-[#071020] px-3 py-2 text-sm text-white outline-none"
          >
            {assetTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            name="criticality"
            defaultValue={criticality}
            className="rounded-xl border border-white/10 bg-[#071020] px-3 py-2 text-sm text-white outline-none"
          >
            {criticalityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            name="sort"
            defaultValue={sort}
            className="rounded-xl border border-white/10 bg-[#071020] px-3 py-2 text-sm text-white outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="md:col-span-4 flex gap-3">
            <button
              type="submit"
              className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20"
            >
              Apply filters
            </button>

            <Link
              href="/dashboard/dark-web/assets"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              Reset
            </Link>
          </div>
        </form>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="text-sm text-slate-400">
            {assets.length} asset{assets.length === 1 ? '' : 's'} found
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

        <div className="grid gap-3">
          {assets.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
              No assets match the current filters.
            </div>
          ) : (
            assets.map((asset) => (
              <div key={asset.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/dashboard/dark-web/assets/${asset.id}`}
                      className="text-base font-medium text-white underline-offset-4 hover:underline"
                    >
                      {asset.display_name ?? asset.value}
                    </Link>
                    <div className="mt-1 text-xs text-slate-400">
                      {humanizeValue(asset.asset_type)} · {asset.value}
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-300">
                    <div>{humanizeValue(asset.criticality)}</div>
                    <div className="text-slate-500">
                      {humanizeValue(asset.verification_status)}
                    </div>
                  </div>
                </div>

                <div className="mb-3 grid gap-2 text-xs text-slate-400 md:grid-cols-2">
                  <div>Findings linked: {asset.findings_count}</div>
                  <div>
                    Last checked:{' '}
                    {asset.last_checked_at
                      ? new Date(asset.last_checked_at).toLocaleString()
                      : '—'}
                  </div>
                </div>

                <AssetActions
                  assetId={asset.id}
                  isActive={asset.is_active ?? true}
                  compact
                />
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

function humanizeValue(value: string | null) {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function buildActiveAssetFilters({
  q,
  assetType,
  criticality,
  sort,
}: {
  q: string
  assetType: string
  criticality: string
  sort: string
}) {
  const filters: string[] = []

  if (q.trim()) {
    filters.push(`Search: ${q.trim()}`)
  }

  if (assetType !== 'all') {
    filters.push(`Asset type: ${humanizeValue(assetType)}`)
  }

  if (criticality !== 'all') {
    filters.push(`Criticality: ${humanizeValue(criticality)}`)
  }

  if (sort !== 'most_exposed') {
    filters.push(`Sort: ${humanizeValue(sort)}`)
  }

  return filters
}
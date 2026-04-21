import Link from 'next/link'
import { getDarkWebFindingsFiltered } from '@/lib/darkweb/queries'
import { DarkWebNav } from '../assets/_components/darkweb-nav'
import { FindingWorkflow } from './_components/finding-workflow'

type PageProps = {
  searchParams: Promise<{
    severity?: string
    category?: string
    status?: string
    q?: string
    sort?: string
    updated?: string
  }>
}

const severityOptions = [
  { value: 'all', label: 'All severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const categoryOptions = [
  { value: 'all', label: 'All categories' },
  { value: 'credential_exposure', label: 'Credential exposure' },
  { value: 'stealer_log', label: 'Stealer log' },
  { value: 'brand_mention', label: 'Brand mention' },
  { value: 'pii_exposure', label: 'PII exposure' },
  { value: 'access_mention', label: 'Access mention' },
]

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'suppressed', label: 'Suppressed' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest_confidence', label: 'Highest confidence' },
  { value: 'highest_severity', label: 'Highest severity' },
]

export default async function DarkWebFindingsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const severity = params.severity ?? 'all'
  const category = params.category ?? 'all'
  const status = params.status ?? 'all'
  const q = params.q ?? ''
  const sort = params.sort ?? 'newest'
  const updated = params.updated === '1'

  const findings = await getDarkWebFindingsFiltered({
    severity,
    category,
    status,
    q,
    sort,
  })

  const activeFilters = buildActiveFilters({
    severity,
    category,
    status,
    q,
    sort,
  })

  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dark Web Findings</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Review matched exposure findings, update workflow status, and investigate evidence.
          </p>
        </div>

        <DarkWebNav current="findings" />
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#071020] p-5">
        {updated ? (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Finding updated successfully.
          </div>
        ) : null}

        <form className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-5">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search title or description"
            className="rounded-xl border border-white/10 bg-[#071020] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
          />

          <select
            name="severity"
            defaultValue={severity}
            className="rounded-xl border border-white/10 bg-[#071020] px-3 py-2 text-sm text-white outline-none"
          >
            {severityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            name="category"
            defaultValue={category}
            className="rounded-xl border border-white/10 bg-[#071020] px-3 py-2 text-sm text-white outline-none"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

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

          <div className="md:col-span-5 flex gap-3">
            <button
              type="submit"
              className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20"
            >
              Apply filters
            </button>

            <Link
              href="/dashboard/dark-web/findings"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              Reset
            </Link>
          </div>
        </form>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="text-sm text-slate-400">
            {findings.length} finding{findings.length === 1 ? '' : 's'} found
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
          {findings.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
              No findings match the current filters.
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

                <div className="mb-3 grid gap-2 text-xs text-slate-400 md:grid-cols-3">
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

                <FindingWorkflow findingId={finding.id} status={finding.finding_status} />
              </div>
            ))
          )}
        </div>
      </section>
    </main>
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

function buildActiveFilters({
  severity,
  category,
  status,
  q,
  sort,
}: {
  severity: string
  category: string
  status: string
  q: string
  sort: string
}) {
  const filters: string[] = []

  if (q.trim()) {
    filters.push(`Search: ${q.trim()}`)
  }

  if (severity !== 'all') {
    filters.push(`Severity: ${humanizeValue(severity)}`)
  }

  if (category !== 'all') {
    filters.push(`Category: ${humanizeValue(category)}`)
  }

  if (status !== 'all') {
    filters.push(`Status: ${humanizeValue(status)}`)
  }

  if (sort !== 'newest') {
    filters.push(`Sort: ${humanizeValue(sort)}`)
  }

  return filters
}
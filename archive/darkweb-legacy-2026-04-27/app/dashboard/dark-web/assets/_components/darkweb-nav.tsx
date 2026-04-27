import Link from 'next/link'

type DarkWebNavProps = {
  current:
    | 'overview'
    | 'findings'
    | 'assets'
    | 'alerts'
    | 'queue'
    | 'inbox'
    | 'metrics'
    | 'connectors'
}

const items = [
  { key: 'overview', label: 'Overview', href: '/dashboard/dark-web' },
  { key: 'findings', label: 'Findings', href: '/dashboard/dark-web/findings' },
  { key: 'assets', label: 'Assets', href: '/dashboard/dark-web/assets' },
  { key: 'alerts', label: 'Alerts', href: '/dashboard/dark-web/alerts' },
  { key: 'queue', label: 'My Queue', href: '/dashboard/dark-web/queue' },
  { key: 'inbox', label: 'Inbox', href: '/dashboard/dark-web/inbox' },
  { key: 'metrics', label: 'Metrics', href: '/dashboard/dark-web/metrics' },
  { key: 'connectors', label: 'Connectors', href: '/dashboard/dark-web/connectors' },
] as const

export function DarkWebNav({ current }: DarkWebNavProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = item.key === current

        return (
          <Link
            key={item.key}
            href={item.href}
            className={
              active
                ? 'rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200'
                : 'rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10'
            }
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
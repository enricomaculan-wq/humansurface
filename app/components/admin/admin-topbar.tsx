import Link from 'next/link'
import LogoutButton from '@/app/components/admin/logout-button'

type AdminTopbarProps = {
  title: string
  subtitle?: string
  primaryAction?: {
    label: string
    href: string
  }
}

export default function AdminTopbar({
  title,
  subtitle,
  primaryAction,
}: AdminTopbarProps) {
  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            HumanSurface admin
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          {subtitle ? <p className="mt-3 text-slate-400">{subtitle}</p> : null}
        </div>

        <div className="flex flex-wrap gap-3">
          {primaryAction ? (
            <Link
              href={primaryAction.href}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              {primaryAction.label}
            </Link>
          ) : null}

          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/organizations"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
          >
            Organizations
          </Link>

          <Link
            href="/admin/assessments"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
          >
            Assessments
          </Link>

          <Link
            href="/admin/people"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
          >
            People
          </Link>

          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
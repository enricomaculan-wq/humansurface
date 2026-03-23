// app/login/page.tsx
import Link from 'next/link'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
          >
            Back
          </Link>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Client access
          </div>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Login
          </h1>

          <p className="mt-4 text-slate-400">
            Client login is being finalized. If you already purchased a
            HumanSurface Assessment and need access to your report, contact us
            and we will assist you directly.
          </p>

          <div className="mt-8 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
            <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">
              Support
            </div>
            <div className="mt-2 text-sm leading-7 text-slate-300">
              For report access, billing support, or assessment status updates,
              contact us at{' '}
              <a
                href="mailto:info@humansurface.com"
                className="text-cyan-200 underline underline-offset-4"
              >
                info@humansurface.com
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/buy"
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Get assessment
            </Link>

            <a
              href="mailto:info@humansurface.com?subject=HumanSurface%20Login%20Request"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              Contact support
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
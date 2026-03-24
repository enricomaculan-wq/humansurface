import Link from 'next/link'

export default async function AssessmentPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ assessment_id?: string; email?: string }>
}) {
  const params = await searchParams
  const assessmentId = params.assessment_id ?? ''
  const email = params.email ?? ''

  const signupHref = email
    ? `/signup?email=${encodeURIComponent(email)}`
    : '/signup'

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Assessment in preparation
          </div>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Your HumanSurface Assessment is being prepared
          </h1>

          <p className="mt-4 text-lg leading-8 text-slate-300">
            We are now processing your company’s public exposure and preparing your
            assessment output.
          </p>

          <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
            <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">
              Delivery timing
            </div>
            <div className="mt-2 text-sm leading-7 text-slate-200">
              Your report will be available within 2 business days. In many cases,
              delivery happens earlier.
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-5">
            <div className="text-sm uppercase tracking-[0.16em] text-fuchsia-200">
              What happens next
            </div>
            <div className="mt-2 space-y-2 text-sm leading-7 text-slate-200">
              <div>• We finalize the assessment processing.</div>
              <div>• We generate your HumanSurface report.</div>
              <div>• Your results will be made available once ready.</div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-sm uppercase tracking-[0.16em] text-slate-400">
              Client access
            </div>
            <div className="mt-2 text-sm leading-7 text-slate-300">
              To track your assessment later from the client area, create an account
              using the same email address used for your purchase.
            </div>
            {email ? (
              <div className="mt-3 text-sm text-cyan-200">{email}</div>
            ) : null}
          </div>

          {assessmentId ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
              Assessment reference: {assessmentId}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Link
              href={signupHref}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Create account
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              Login
            </Link>

            <a
              href="mailto:support@humansurface.com?subject=HumanSurface%20Assessment%20Status"
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
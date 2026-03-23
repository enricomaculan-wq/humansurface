import Link from 'next/link'
import BillingCompleteForm from './billing-complete-form'

export default async function BillingCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id ?? ''

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
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
            Billing details
          </div>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Complete your billing profile
          </h1>

          <p className="mt-4 text-slate-400">
            Payment received. Please complete your billing details before invoice
            issuance.
          </p>

          <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
            <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">
              Next step
            </div>
            <div className="mt-2 text-sm leading-7 text-slate-300">
              Fill in your legal and invoicing details. Once completed, your
              billing profile will be marked as ready.
            </div>
          </div>

          <div className="mt-8">
            <BillingCompleteForm sessionId={sessionId} />
          </div>
        </div>
      </div>
    </main>
  )
}
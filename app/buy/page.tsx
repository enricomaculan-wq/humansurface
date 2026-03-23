import Link from 'next/link'
import BuyForm from './buy-form'

export default function BuyPage() {
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
            HumanSurface
          </div>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Create your account and continue to payment
          </h1>

          <p className="mt-4 text-slate-400">
            Register your company account, enter your main domain, and continue to
            secure payment for your first HumanSurface Assessment.
          </p>

          <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
            <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">
              Launch offer
            </div>
            <div className="mt-2 text-4xl font-semibold text-white">€190 + VAT</div>
            <div className="mt-2 text-sm text-slate-300">
              Includes website scan, external exposure analysis, people/roles
              exposure, combined score, and executive-ready report.
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-5">
            <div className="text-sm uppercase tracking-[0.16em] text-fuchsia-200">
              Billing details
            </div>
            <div className="mt-2 text-sm leading-7 text-slate-200">
              Billing details will be requested after payment, before invoice
              issuance.
            </div>
          </div>

          <div className="mt-8">
            <BuyForm />
          </div>
        </div>
      </div>
    </main>
  )
}
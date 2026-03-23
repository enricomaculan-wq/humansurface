import Link from 'next/link'
import { CheckCircle2, ArrowLeft, ShieldCheck, Mail } from 'lucide-react'

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
                Payment received
              </div>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                Thank you for your purchase
              </h1>
            </div>
          </div>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            Your HumanSurface Assessment has been successfully submitted. We have
            received your order and company details.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-3 text-cyan-200">
                <ShieldCheck className="h-5 w-5" />
                <div className="text-sm font-medium uppercase tracking-[0.16em]">
                  What happens next
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                <div>We review your submitted company details.</div>
                <div>We run the initial HumanSurface assessment.</div>
                <div>You receive your assessment output and next steps.</div>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
              <div className="flex items-center gap-3 text-cyan-100">
                <Mail className="h-5 w-5" />
                <div className="text-sm font-medium uppercase tracking-[0.16em]">
                  Delivery timing
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
                <div>Initial response target: 1–2 business days.</div>
                <div>Assessment delivery timing may vary by company profile.</div>
                <div>
                  For questions, contact us at{' '}
                  <a
                    href="mailto:humansurface@soreya.app"
                    className="text-cyan-200 underline underline-offset-4"
                  >
                    humansurface@soreya.app
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-5">
            <div className="text-sm font-medium uppercase tracking-[0.16em] text-fuchsia-200">
              Important
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              Keep your payment confirmation email for reference. If you need to
              update the submitted domain or company details, contact us as soon as
              possible.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to homepage
            </Link>

            <a
              href="mailto:humansurface@soreya.app?subject=HumanSurface%20Assessment%20Support"
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
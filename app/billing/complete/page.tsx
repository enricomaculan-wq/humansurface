import { redirect } from 'next/navigation'
import BillingCompleteForm from './billing-complete-form'

export default async function BillingCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; sessionId?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const sessionId =
    resolvedSearchParams.session_id ?? resolvedSearchParams.sessionId ?? ''

  if (!sessionId) {
    redirect('/buy')
  }

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-14 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Billing complete
            </div>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Payment received
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Your HumanSurface Assessment has been created successfully.
            </p>

            <div className="mt-8 rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.08] p-6">
              <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">
                What happens next
              </div>
              <p className="mt-3 leading-7 text-slate-200">
                We review each assessment before publication to ensure a cleaner
                and more reliable output. Delivery is typically within 2
                business days, and often earlier.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#071022] p-5">
                <div className="text-sm font-semibold text-white">
                  Client access
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  You can sign up or log in now to track the assessment status
                  and access the report as soon as it is published.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#071022] p-5">
                <div className="text-sm font-semibold text-white">
                  Publication model
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Reports are not presented as instant automated outputs. They
                  are published after a review step designed to improve clarity,
                  consistency, and actionability.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
            <div className="mb-6">
              <div className="text-sm uppercase tracking-[0.18em] text-cyan-300">
                Continue
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Access your client area
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Complete the next step to connect your order to your account and
                follow the publication status of your assessment.
              </p>
            </div>

            <BillingCompleteForm sessionId={sessionId} />
          </section>
        </div>
      </div>
    </main>
  )
}
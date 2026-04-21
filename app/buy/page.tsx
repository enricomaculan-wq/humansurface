import BuyForm from './buy-form'

export default function BuyPage() {
  return (
    <main className="min-h-screen bg-[#040816] px-6 py-14 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              HumanSurface
            </div>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Request a HumanSurface intro call
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Tell us a bit about your company and exposure priorities. We will
              review your request and get back to you to schedule a short intro call.
            </p>

            <div className="mt-8 rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.08] p-6">
              <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">
                What to expect
              </div>
              <p className="mt-3 leading-7 text-slate-200">
                HumanSurface is designed as a reviewed exposure assessment, not
                an instant low-value scan. We usually reply within 1 business day
                to understand fit, priorities, and next steps.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#071022] p-5">
                <div className="text-sm font-semibold text-white">
                  What HumanSurface focuses on
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                  <li>Public exposure supporting impersonation attempts</li>
                  <li>Finance and invoice-fraud enabling signals</li>
                  <li>HR and executive-targeted social engineering exposure</li>
                  <li>Visible roles, contact paths, and public business context</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#071022] p-5">
                <div className="text-sm font-semibold text-white">
                  Why companies book a call first
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                  <li>To understand whether the service fits their exposure profile</li>
                  <li>To align on priorities and decision context</li>
                  <li>To review expected output and delivery approach</li>
                  <li>To keep the process consultative and high-signal</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm font-semibold text-white">
                Delivery model
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Each assessment is reviewed before publication to preserve
                clarity, consistency, and decision value. A short intro call helps
                define scope and confirm the right next step before activation.
              </p>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
            <div className="mb-6">
              <div className="text-sm uppercase tracking-[0.18em] text-cyan-300">
                Request a call
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Book an intro conversation
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Share your company details and a brief description of what you want
                to assess. We will review the request and contact you to arrange
                a short call.
              </p>
            </div>

            <BuyForm />
          </section>
        </div>
      </div>
    </main>
  )
}
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
              HumanSurface Assessment
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              A reviewed exposure assessment focused on phishing, impersonation,
              and human-targeted fraud.
            </p>

            <div className="mt-8 rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.08] p-6">
              <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">
                Delivery model
              </div>
              <p className="mt-3 leading-7 text-slate-200">
                Each assessment is reviewed before publication to ensure a
                clearer and more reliable output. Delivery is typically within
                2 business days, often sooner.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#071022] p-5">
                <div className="text-sm font-semibold text-white">
                  What the assessment focuses on
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
                  Why this is different
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                  <li>Not positioned as an instant low-value scan</li>
                  <li>Reviewed before publication</li>
                  <li>Structured for clearer client-facing output</li>
                  <li>Built to support action, not just raw detection</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm font-semibold text-white">
                Output expectation
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                The final report is published after review, not immediately at
                checkout. This helps preserve clarity, consistency, and decision
                value.
              </p>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
            <div className="mb-6">
              <div className="text-sm uppercase tracking-[0.18em] text-cyan-300">
                Request assessment
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Start a new assessment request
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Submit your company and billing details to start the assessment
                workflow. You will be able to track the status from your client
                area after checkout.
              </p>
            </div>

            <BuyForm />
          </section>
        </div>
      </div>
    </main>
  )
}
import Link from 'next/link'
import { DarkWebNav } from '../assets/_components/darkweb-nav'

const suggestedAssets = [
  {
    title: 'Primary domain',
    description: 'Monitor your main company domain and any secondary domains tied to business email.',
    examples: 'acme.com, acmegroup.com',
  },
  {
    title: 'Critical mailboxes',
    description: 'Add high-value mailboxes that could enable takeover, fraud, or phishing escalation.',
    examples: 'admin@, finance@, support@, ceo@',
  },
  {
    title: 'Executive identities',
    description: 'Track executives and high-profile people whose identities are more likely to be abused.',
    examples: 'CEO, CFO, founder, head of IT',
  },
  {
    title: 'Brand keywords',
    description: 'Monitor the company name and brand variants that may appear in risky contexts.',
    examples: 'HumanSurface, Human Surface',
  },
]

export default function DarkWebSetupPage() {
  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dark Web Setup</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Choose the identities, mailboxes, domains, and brand signals you want HumanSurface to monitor.
          </p>
        </div>

        <DarkWebNav current="assets" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">What to monitor first</h2>

          <div className="grid gap-4">
            {suggestedAssets.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="text-sm font-medium text-white">{item.title}</div>
                <div className="mt-2 text-sm leading-6 text-slate-300">
                  {item.description}
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Examples: {item.examples}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Recommended rollout</h2>

          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="font-medium text-white">Step 1</div>
              <div className="mt-1">Add your main domain and business-critical mailboxes.</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="font-medium text-white">Step 2</div>
              <div className="mt-1">Mark the most sensitive assets as critical.</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="font-medium text-white">Step 3</div>
              <div className="mt-1">Add executives, brand keywords, and any sensitive aliases.</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/dark-web/assets/new"
              className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20"
            >
              Add monitored asset
            </Link>

            <Link
              href="/dashboard/dark-web/assets"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              Review monitored assets
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
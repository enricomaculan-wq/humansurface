import Link from 'next/link'
import { DarkWebNav } from '../../assets/_components/darkweb-nav'
import { NewRawEventForm } from './_components/new-raw-event-form'

export default function NewRawEventPage() {
  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/dark-web/inbox"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Back to inbox
          </Link>
        </div>

        <DarkWebNav current="inbox" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h1 className="mb-4 text-2xl font-semibold text-white">Create test raw event</h1>
          <NewRawEventForm />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">What this is for</h2>

          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              Create realistic raw events without touching SQL manually.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              Use templates to test credential exposure, brand mentions, and access-related signals.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              After creation, go back to the inbox and process the event individually or in bulk.
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
import Link from 'next/link'
import { DarkWebNav } from '../_components/darkweb-nav'
import { NewAssetForm } from './_components/new-asset-form'

export default function NewMonitoredAssetPage() {
  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/dark-web/assets"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Back to assets
          </Link>
        </div>

        <DarkWebNav current="assets" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h1 className="mb-4 text-2xl font-semibold text-white">Add monitored asset</h1>
          <NewAssetForm />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Good candidates</h2>

          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="font-medium text-white">Critical email accounts</div>
              <div className="mt-1">admin@, finance@, ceo@, support@</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="font-medium text-white">Domains</div>
              <div className="mt-1">Primary domain, support domain, legacy email domain</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="font-medium text-white">Brand terms</div>
              <div className="mt-1">Company name, app name, product name, key variants</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
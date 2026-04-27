import Link from 'next/link'
import { DarkWebNav } from '../../assets/_components/darkweb-nav'
import { ConnectorForm } from '../_components/connector-form'
import { createConnectorAction } from './actions'

export default function NewConnectorPage() {
  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/dark-web/connectors"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Back to connectors
          </Link>
        </div>

        <DarkWebNav current="connectors" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h1 className="mb-4 text-2xl font-semibold text-white">Create connector</h1>
          <ConnectorForm
            mode="create"
            action={createConnectorAction}
            cancelHref="/dashboard/dark-web/connectors"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Connector notes</h2>

          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              Manual Seed is useful for repeatable testing and demos.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              HTTP Feed is the right next step for real provider integrations.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              CSV Upload is useful for one-off imports and dataset validation.
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
import Link from 'next/link'
import { DarkWebNav } from '../../../assets/_components/darkweb-nav'
import { ConnectorForm } from '../../_components/connector-form'
import { getDarkWebConnectorById } from '@/lib/darkweb/queries'
import { updateConnectorAction } from './actions'

type PageProps = {
  params: Promise<{
    connectorId: string
  }>
}

export default async function EditConnectorPage({ params }: PageProps) {
  const { connectorId } = await params
  const connector = await getDarkWebConnectorById(connectorId)

  if (!connector) {
    return (
      <main className="p-6">
        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6 text-sm text-slate-300">
          Connector not found for the current organization.
        </div>
      </main>
    )
  }

  const boundAction = updateConnectorAction.bind(null, connectorId)

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
          <h1 className="mb-4 text-2xl font-semibold text-white">Edit connector</h1>
          <ConnectorForm
            mode="edit"
            connector={connector}
            action={boundAction}
            cancelHref="/dashboard/dark-web/connectors"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Current status</h2>

          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              Last run: {connector.last_run_at ? new Date(connector.last_run_at).toLocaleString() : '—'}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              Last success: {connector.last_success_at ? new Date(connector.last_success_at).toLocaleString() : '—'}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              Last error: {connector.last_error ?? 'None'}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
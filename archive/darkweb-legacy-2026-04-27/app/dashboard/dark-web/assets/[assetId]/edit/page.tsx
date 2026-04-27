import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DarkWebNav } from '../../_components/darkweb-nav'
import { getDarkWebMonitoredAssetById } from '@/lib/darkweb/queries'
import { EditAssetForm } from './_components/edit-asset-form'

type PageProps = {
  params: Promise<{
    assetId: string
  }>
}

export default async function EditAssetPage({ params }: PageProps) {
  const { assetId } = await params
  const asset = await getDarkWebMonitoredAssetById(assetId)

  if (!asset) {
    notFound()
  }

  return (
    <main className="space-y-8 p-6">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/dashboard/dark-web/assets/${assetId}`}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            ← Back to asset
          </Link>
        </div>

        <DarkWebNav current="assets" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h1 className="mb-4 text-2xl font-semibold text-white">Edit monitored asset</h1>
          <EditAssetForm asset={asset} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Editing tips</h2>

          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              Update criticality when the asset becomes more sensitive for the business.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              Disable monitoring instead of deleting if you may need the asset again later.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              Keep display names clear so findings remain readable in reports.
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
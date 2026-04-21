import Link from 'next/link'
import { DarkWebNav } from '../../assets/_components/darkweb-nav'
import { CsvUploadForm } from './_components/csv-upload-form'

export default function CsvUploadConnectorPage() {
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
          <h1 className="mb-4 text-2xl font-semibold text-white">CSV Upload Connector</h1>
          <CsvUploadForm />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#071020] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">How to use it</h2>

          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              Export a CSV from a feed, parser, or internal dataset.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              Upload it here to create pending raw events in the inbox.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              Then process them individually or in bulk using the existing pipeline.
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
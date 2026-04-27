'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import {
  uploadCsvRawEventsAction,
  type CsvUploadState,
} from '../actions'

const initialState: CsvUploadState = {
  error: null,
}

export function CsvUploadForm() {
  const [state, formAction, isPending] = useActionState(
    uploadCsvRawEventsAction,
    initialState
  )

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <div className="mb-2 font-medium text-white">Expected CSV columns</div>
        <div className="leading-6 text-slate-300">
          source_type, source_name, event_type, external_id, title, email,
          domain, brand, username, snippet, url, observed_at
        </div>
      </div>

      <form action={formAction} className="grid gap-4">
        {state.error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {state.error}
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm text-slate-300">CSV file</label>
          <input
            name="file"
            type="file"
            accept=".csv,text/csv"
            className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none file:mr-4 file:rounded-full file:border-0 file:bg-sky-500/10 file:px-3 file:py-1.5 file:text-sky-200"
            required
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Importing...' : 'Import CSV'}
          </button>

          <Link
            href="/dashboard/dark-web/connectors"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
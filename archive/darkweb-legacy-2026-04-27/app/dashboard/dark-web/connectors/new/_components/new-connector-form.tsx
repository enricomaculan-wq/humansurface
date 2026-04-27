'use client'

import Link from 'next/link'
import { useActionState, useMemo, useState } from 'react'
import { createConnectorAction, type ConnectorFormState } from '../actions'

const initialState: ConnectorFormState = {
  error: null,
}

const connectorTypes = [
  { value: 'manual_seed', label: 'Manual seed' },
  { value: 'http_feed', label: 'HTTP feed' },
  { value: 'csv_upload', label: 'CSV upload' },
] as const

const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
] as const

export function NewConnectorForm() {
  const [state, formAction, isPending] = useActionState(
    createConnectorAction,
    initialState
  )

  const [connectorType, setConnectorType] = useState<'manual_seed' | 'http_feed' | 'csv_upload'>(
    'http_feed'
  )

  const httpFeedPreset = useMemo(
    () => ({
      endpoint_url: 'http://localhost:3000/api/darkweb/mock-feed',
      source_name: 'Mock Dark Web Feed',
      source_type: 'http_feed',
      method: 'GET',
      cursor_param: 'cursor',
      since_param: 'since',
      items_path: 'items',
      next_cursor_path: 'next_cursor',
      timeout_ms: '10000',
    }),
    []
  )

  return (
    <form action={formAction} className="grid gap-4">
      {state.error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Display name</label>
          <input
            name="display_name"
            type="text"
            defaultValue="Mock Dark Web Feed"
            className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Connector type</label>
          <select
            name="connector_type"
            value={connectorType}
            onChange={(event) =>
              setConnectorType(event.target.value as 'manual_seed' | 'http_feed' | 'csv_upload')
            }
            className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
            required
          >
            {connectorTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Status</label>
        <select
          name="status"
          defaultValue="active"
          className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
        >
          {statuses.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {connectorType === 'manual_seed' ? (
        <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-medium text-white">Manual seed settings</div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Domain</label>
              <input
                name="domain"
                type="text"
                placeholder="humansurface.demo"
                className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Email</label>
              <input
                name="email"
                type="text"
                placeholder="admin@humansurface.demo"
                className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>
        </section>
      ) : null}

      {connectorType === 'http_feed' ? (
        <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium text-white">HTTP feed settings</div>

            <button
              type="button"
              onClick={() => {
                const form = document.querySelector('form') as HTMLFormElement | null
                if (!form) return

                ;(form.elements.namedItem('endpoint_url') as HTMLInputElement).value =
                  httpFeedPreset.endpoint_url
                ;(form.elements.namedItem('source_name') as HTMLInputElement).value =
                  httpFeedPreset.source_name
                ;(form.elements.namedItem('source_type') as HTMLInputElement).value =
                  httpFeedPreset.source_type
                ;(form.elements.namedItem('method') as HTMLSelectElement).value =
                  httpFeedPreset.method
                ;(form.elements.namedItem('cursor_param') as HTMLInputElement).value =
                  httpFeedPreset.cursor_param
                ;(form.elements.namedItem('since_param') as HTMLInputElement).value =
                  httpFeedPreset.since_param
                ;(form.elements.namedItem('items_path') as HTMLInputElement).value =
                  httpFeedPreset.items_path
                ;(form.elements.namedItem('next_cursor_path') as HTMLInputElement).value =
                  httpFeedPreset.next_cursor_path
                ;(form.elements.namedItem('timeout_ms') as HTMLInputElement).value =
                  httpFeedPreset.timeout_ms
              }}
              className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-200 transition hover:bg-sky-500/20"
            >
              Use mock feed preset
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Endpoint URL</label>
            <input
              name="endpoint_url"
              type="text"
              defaultValue="http://localhost:3000/api/darkweb/mock-feed"
              placeholder="https://provider.example/api/feed"
              className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              required={connectorType === 'http_feed'}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Source name</label>
              <input
                name="source_name"
                type="text"
                defaultValue="Mock Dark Web Feed"
                placeholder="Provider X"
                className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Source type</label>
              <input
                name="source_type"
                type="text"
                defaultValue="http_feed"
                placeholder="http_feed"
                className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Authorization header</label>
            <input
              name="auth_header"
              type="text"
              placeholder="Bearer YOUR_TOKEN"
              className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Method</label>
              <select
                name="method"
                defaultValue="GET"
                className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Timeout (ms)</label>
              <input
                name="timeout_ms"
                type="number"
                defaultValue="10000"
                min={1000}
                max={30000}
                className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Cursor param</label>
              <input
                name="cursor_param"
                type="text"
                defaultValue="cursor"
                placeholder="cursor"
                className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Since param</label>
              <input
                name="since_param"
                type="text"
                defaultValue="since"
                placeholder="since"
                className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Items path</label>
              <input
                name="items_path"
                type="text"
                defaultValue="items"
                placeholder="items or data.results"
                className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Next cursor path</label>
              <input
                name="next_cursor_path"
                type="text"
                defaultValue="next_cursor"
                placeholder="next_cursor or data.next_cursor"
                className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>
        </section>
      ) : null}

      {connectorType === 'csv_upload' ? (
        <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-medium text-white">CSV upload settings</div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Source label</label>
            <input
              name="csv_source_label"
              type="text"
              defaultValue="CSV Upload"
              className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
            />
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Creating...' : 'Create connector'}
        </button>

        <Link
          href="/dashboard/dark-web/connectors"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
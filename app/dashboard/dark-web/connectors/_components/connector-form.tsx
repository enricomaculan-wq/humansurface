'use client'

import Link from 'next/link'
import { useActionState, useMemo, useState } from 'react'
import type { ConnectorFormState } from '../new/actions'

type ConnectorRecord = {
  id?: string
  display_name: string
  connector_type: string
  status: string
  config?: Record<string, unknown> | null
}

type Props = {
  mode: 'create' | 'edit'
  connector?: ConnectorRecord
  action: (
    state: ConnectorFormState,
    formData: FormData
  ) => Promise<ConnectorFormState>
  cancelHref: string
}

const initialState: ConnectorFormState = {
  error: null,
}

const connectorTypes = [
  { value: 'manual_seed', label: 'Manual Seed' },
  { value: 'http_feed', label: 'HTTP Feed' },
  { value: 'csv_upload', label: 'CSV Upload' },
]

const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
]

export function ConnectorForm({
  mode,
  connector,
  action,
  cancelHref,
}: Props) {
  const [state, formAction, isPending] = useActionState(action, initialState)

  const initialType = connector?.connector_type ?? 'manual_seed'
  const [connectorType, setConnectorType] = useState(initialType)

  const config = useMemo(
    () => (connector?.config && typeof connector.config === 'object' ? connector.config : {}),
    [connector]
  )

  const domain = typeof config.domain === 'string' ? config.domain : ''
  const email = typeof config.email === 'string' ? config.email : ''
  const endpointUrl =
    typeof config.endpoint_url === 'string' ? config.endpoint_url : ''
  const authHeader =
    typeof config.auth_header === 'string' ? config.auth_header : ''
  const csvSourceLabel =
    typeof config.source_label === 'string' ? config.source_label : ''

  return (
    <form action={formAction} className="grid gap-4">
      {state.error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm text-slate-300">Display name</label>
        <input
          name="display_name"
          type="text"
          defaultValue={connector?.display_name ?? ''}
          className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Connector type</label>
          <select
            name="connector_type"
            value={connectorType}
            onChange={(e) => setConnectorType(e.target.value)}
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

        <div>
          <label className="mb-2 block text-sm text-slate-300">Status</label>
          <select
            name="status"
            defaultValue={connector?.status ?? 'active'}
            className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
            required
          >
            {statuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {connectorType === 'manual_seed' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Domain</label>
            <input
              name="domain"
              type="text"
              defaultValue={domain}
              placeholder="humansurface.demo"
              className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input
              name="email"
              type="text"
              defaultValue={email}
              placeholder="admin@humansurface.demo"
              className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>
      ) : null}

  {connectorType === 'http_feed' ? (
  <div className="grid gap-4">
    <div>
      <label className="mb-2 block text-sm text-slate-300">Endpoint URL</label>
      <input
        name="endpoint_url"
        type="text"
        defaultValue={endpointUrl}
        placeholder="https://feed.example.com/events"
        className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm text-slate-300">Authorization header</label>
      <input
        name="auth_header"
        type="text"
        defaultValue={authHeader}
        placeholder="Bearer xyz"
        className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
      />
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm text-slate-300">Source name</label>
        <input
          name="source_name"
          type="text"
          defaultValue={typeof config.source_name === 'string' ? config.source_name : ''}
          placeholder="Provider Feed"
          className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Source type</label>
        <input
          name="source_type"
          type="text"
          defaultValue={typeof config.source_type === 'string' ? config.source_type : 'http_feed'}
          placeholder="http_feed"
          className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>
    </div>
  </div>
) : null}

      {connectorType === 'csv_upload' ? (
        <div>
          <label className="mb-2 block text-sm text-slate-300">Source label</label>
          <input
            name="csv_source_label"
            type="text"
            defaultValue={csvSourceLabel}
            placeholder="CSV Upload"
            className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? mode === 'create'
              ? 'Creating...'
              : 'Saving...'
            : mode === 'create'
              ? 'Create connector'
              : 'Save changes'}
        </button>

        <Link
          href={cancelHref}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
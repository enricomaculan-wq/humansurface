'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import {
  updateMonitoredAssetAction,
  type UpdateAssetFormState,
} from '../action'

type Asset = {
  id: string
  asset_type: string
  value: string
  display_name: string | null
  criticality: string
  is_primary: boolean
  is_active: boolean
}

type Props = {
  asset: Asset
}

const initialState: UpdateAssetFormState = {
  error: null,
}

const assetTypes = [
  { value: 'domain', label: 'Domain' },
  { value: 'email', label: 'Email' },
  { value: 'brand', label: 'Brand keyword' },
  { value: 'person', label: 'Person' },
  { value: 'username', label: 'Username' },
  { value: 'phone', label: 'Phone' },
]

const criticalityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export function EditAssetForm({ asset }: Props) {
  const boundAction = updateMonitoredAssetAction.bind(null, asset.id)
  const [state, formAction, isPending] = useActionState(boundAction, initialState)

  return (
    <form action={formAction} className="grid gap-4">
      {state.error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm text-slate-300">Asset type</label>
        <select
          name="asset_type"
          defaultValue={asset.asset_type}
          className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
          required
        >
          {assetTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Asset value</label>
        <input
          name="value"
          type="text"
          defaultValue={asset.value}
          className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Display name</label>
        <input
          name="display_name"
          type="text"
          defaultValue={asset.display_name ?? ''}
          className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Criticality</label>
        <select
          name="criticality"
          defaultValue={asset.criticality}
          className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
        >
          {criticalityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <input
          name="is_primary"
          type="checkbox"
          defaultChecked={asset.is_primary}
          className="h-4 w-4"
        />
        <span className="text-sm text-slate-300">Mark as primary asset</span>
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <input
          name="is_active"
          type="checkbox"
          defaultChecked={asset.is_active}
          className="h-4 w-4"
        />
        <span className="text-sm text-slate-300">Enable monitoring</span>
      </label>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Saving...' : 'Save changes'}
        </button>

        <Link
          href={`/dashboard/dark-web/assets/${asset.id}`}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
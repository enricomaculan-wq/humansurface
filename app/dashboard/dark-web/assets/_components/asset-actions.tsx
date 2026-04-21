'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  deleteMonitoredAssetAction,
  setMonitoredAssetActiveStateAction,
} from '../actions'

type Props = {
  assetId: string
  isActive: boolean
  compact?: boolean
}

export function AssetActions({ assetId, isActive, compact = false }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const baseClass = compact
    ? 'rounded-full border px-3 py-1.5 text-xs transition disabled:cursor-not-allowed disabled:opacity-60'
    : 'rounded-full border px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await setMonitoredAssetActiveStateAction(assetId, !isActive)
            router.refresh()
          })
        }
        className={`${baseClass} border-white/10 bg-white/5 text-slate-300 hover:bg-white/10`}
      >
        {isPending ? 'Saving...' : isActive ? 'Disable monitoring' : 'Enable monitoring'}
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const confirmed = window.confirm(
              'Delete this monitored asset? This will remove the asset and unlink it from findings.'
            )
            if (!confirmed) return

            await deleteMonitoredAssetAction(assetId)
            router.push('/dashboard/dark-web/assets')
            router.refresh()
          })
        }
        className={`${baseClass} border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20`}
      >
        {isPending ? 'Deleting...' : 'Delete asset'}
      </button>
    </div>
  )
}
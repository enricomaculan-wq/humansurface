'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  runConnectorNowAction,
  setConnectorStatusAction,
} from '../actions'

type Props = {
  connectorId: string
  status: 'active' | 'paused' | string
}

export function ConnectorActions({ connectorId, status }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const isActive = status === 'active'

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={isPending || !isActive}
        onClick={() =>
          startTransition(async () => {
            await runConnectorNowAction(connectorId)
            router.refresh()
          })
        }
        className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Working...' : 'Run now'}
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await setConnectorStatusAction(
              connectorId,
              isActive ? 'paused' : 'active'
            )
            router.refresh()
          })
        }
        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Working...' : isActive ? 'Pause' : 'Resume'}
      </button>
    </div>
  )
}
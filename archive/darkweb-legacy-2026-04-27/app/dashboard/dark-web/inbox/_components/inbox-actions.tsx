'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  processAllPendingRawEventsAction,
  processSingleRawEventAction,
  retryRawEventAction,
  reprocessRawEventAction,
} from '../actions'

export function ProcessAllPendingButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await processAllPendingRawEventsAction()
          router.refresh()
        })
      }
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? 'Processing...' : 'Process all pending'}
    </button>
  )
}

export function ProcessSingleButton({ rawEventId }: { rawEventId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await processSingleRawEventAction(rawEventId)
          router.refresh()
        })
      }
      className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? 'Processing...' : 'Process'}
    </button>
  )
}

export function RetryRawEventButton({ rawEventId }: { rawEventId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await retryRawEventAction(rawEventId)
          router.refresh()
        })
      }
      className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? 'Retrying...' : 'Retry failed'}
    </button>
  )
}

export function ReprocessRawEventButton({ rawEventId }: { rawEventId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await reprocessRawEventAction(rawEventId)
          router.refresh()
        })
      }
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? 'Reprocessing...' : 'Reprocess'}
    </button>
  )
}
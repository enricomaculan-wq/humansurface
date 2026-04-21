'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveFindingNoteAction, updateFindingStatusAction } from '../actions'

type Props = {
  findingId: string
  status: 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'suppressed' | null
  note?: string | null
  compact?: boolean
}

const statuses = [
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'suppressed', label: 'Suppressed' },
] as const

export function FindingWorkflow({
  findingId,
  status,
  note,
  compact = false,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const currentStatus = status ?? 'new'

  const buttonClass = compact
    ? 'rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60'
    : 'rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {statuses.map((item) => (
          <button
            key={item.value}
            type="button"
            disabled={isPending || currentStatus === item.value}
            onClick={() =>
              startTransition(async () => {
                await updateFindingStatusAction(findingId, item.value)
                router.refresh()
              })
            }
            className={
              currentStatus === item.value
                ? 'rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 disabled:opacity-100'
                : buttonClass
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {!compact ? (
        <form
          action={(formData) =>
            startTransition(async () => {
              await saveFindingNoteAction(findingId, formData)
              router.refresh()
            })
          }
          className="space-y-3"
        >
          <div>
            <label className="mb-2 block text-sm text-slate-300">Internal note</label>
            <textarea
              name="note"
              defaultValue={note ?? ''}
              rows={4}
              placeholder="Add analyst notes, decision context, or follow-up actions"
              className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Saving...' : 'Save note'}
          </button>
        </form>
      ) : null}
    </div>
  )
}
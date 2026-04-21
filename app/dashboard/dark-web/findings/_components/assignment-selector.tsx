'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  assignFindingPersonAction,
  assignTaskPersonAction,
} from '../assignment-actions'

type Person = {
  id: string
  full_name: string | null
  email: string | null
  role_title: string | null
}

type Props =
  | {
      kind: 'finding'
      targetId: string
      value: string | null
      people: Person[]
    }
  | {
      kind: 'task'
      targetId: string
      value: string | null
      people: Person[]
    }

export function AssignmentSelector(props: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <select
      defaultValue={props.value ?? ''}
      disabled={isPending}
      onChange={(e) => {
        const nextValue = e.target.value || null

        startTransition(async () => {
          if (props.kind === 'finding') {
            await assignFindingPersonAction(props.targetId, nextValue)
          } else {
            await assignTaskPersonAction(props.targetId, nextValue)
          }
          router.refresh()
        })
      }}
      className="rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none disabled:opacity-60"
    >
      <option value="">Unassigned</option>
      {props.people.map((person) => (
        <option key={person.id} value={person.id}>
          {person.full_name ?? person.email ?? 'Unnamed person'}
        </option>
      ))}
    </select>
  )
}
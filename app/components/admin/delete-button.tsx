'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type DeleteButtonProps = {
  table: 'organizations' | 'assessments' | 'people' | 'findings' | 'scores' | 'remediation_tasks'
  id: string
  label?: string
  redirectTo?: string
}

export default function DeleteButton({
  table,
  id,
  label = 'Delete',
  redirectTo,
}: DeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    const confirmed = window.confirm('Are you sure you want to delete this item?')
    if (!confirmed) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table,
          id,
        }),
      })

      const result = await response.json()

      setLoading(false)

      if (!response.ok) {
        setError(result?.error || 'Failed to delete item.')
        return
      }

      if (redirectTo) {
        router.push(redirectTo)
        router.refresh()
        return
      }

      router.refresh()
    } catch {
      setLoading(false)
      setError('Network error while deleting item.')
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-400/20 disabled:opacity-60"
      >
        {loading ? 'Deleting...' : label}
      </button>

      {error ? <div className="text-sm text-red-300">{error}</div> : null}
    </div>
  )
}
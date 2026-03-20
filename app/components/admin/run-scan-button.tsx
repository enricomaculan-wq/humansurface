'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RunScanButton({
  organizationId,
}: {
  organizationId: string
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleRunScan() {
    if (loading) return

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result?.error || 'Failed to launch assessment.')
        setLoading(false)
        return
      }

      setMessage('Assessment started successfully. Refreshing status...')
      setLoading(false)

      setTimeout(() => {
        router.refresh()
      }, 1200)
    } catch {
      setLoading(false)
      setError('Network error while launching assessment.')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleRunScan}
        disabled={loading}
        className="rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Launching scan...' : 'Run assessment'}
      </button>

      {message ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}
    </div>
  )
}
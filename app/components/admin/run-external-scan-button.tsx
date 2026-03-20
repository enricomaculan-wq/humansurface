'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RunExternalScanButton({
  assessmentId,
  organizationId,
}: {
  assessmentId: string
  organizationId: string
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleRunExternalScan() {
    if (loading) return

    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/external-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentId,
          organizationId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result?.error || 'Failed to launch external exposure scan.')
        setLoading(false)
        return
      }

      setMessage('External exposure scan completed. Refreshing report...')
      setLoading(false)

      setTimeout(() => {
        router.refresh()
      }, 1200)
    } catch {
      setLoading(false)
      setError('Network error while launching external exposure scan.')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleRunExternalScan}
        disabled={loading}
        className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-fuchsia-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Running external scan...' : 'Run external exposure scan'}
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
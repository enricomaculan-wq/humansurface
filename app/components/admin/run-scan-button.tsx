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
    setLoading(true)
    setError(null)
    setMessage('Scanning public pages, contacts, and documents...')

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ organizationId }),
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json?.error || 'Scan failed.')
      }

      setMessage('Scan completed. Opening assessment...')

      const assessmentId = json?.result?.assessmentId as string | undefined
      if (assessmentId) {
        router.push(`/admin/assessments/${assessmentId}`)
        router.refresh()
        return
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed.')
      setMessage(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={handleRunScan}
        disabled={loading}
        className="inline-flex items-center justify-center gap-3 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-950/40" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-slate-950/80" />
            </span>
            Running scan...
          </>
        ) : (
          'Run public scan'
        )}
      </button>

      {loading ? (
        <div className="w-full max-w-md rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.08] p-4">
          <div className="mb-3 text-sm font-medium text-cyan-100">
            HumanSurface scanner is working
          </div>

          <div className="space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-300" />
            </div>

            <div className="flex items-center gap-2 text-sm text-cyan-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
              {message || 'Processing...'}
            </div>
          </div>
        </div>
      ) : null}

      {error ? <div className="text-sm text-red-300">{error}</div> : null}
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RunDarkwebPipelineButton({
  assessmentId,
}: {
  assessmentId: string
}) {
  const router = useRouter()
  const [rawResultsJson, setRawResultsJson] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleRunDarkwebPipeline() {
    if (loading) return

    setLoading(true)
    setMessage(null)
    setError(null)

    let rawResults: unknown = []
    const trimmedRawResults = rawResultsJson.trim()

    if (trimmedRawResults) {
      try {
        rawResults = JSON.parse(trimmedRawResults)
      } catch {
        setLoading(false)
        setError('Raw result JSON is invalid.')
        return
      }
    }

    try {
      const response = await fetch('/api/admin/darkweb/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentId,
          rawResults,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result?.error || 'Failed to run dark web pipeline.')
        setLoading(false)
        return
      }

      setMessage(
        `Run completed: ${result?.findingCount ?? 0} finding(s), score ${result?.score ?? 0}.`,
      )
      setRawResultsJson('')
      setLoading(false)
      router.refresh()
    } catch {
      setLoading(false)
      setError('Network error while running dark web pipeline.')
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        value={rawResultsJson}
        onChange={(event) => setRawResultsJson(event.target.value)}
        rows={5}
        placeholder='Optional raw result JSON, for example {"source_type":"manual_admin","email":"name@example.com","snippet":"..."}'
        className="w-full rounded-2xl border border-white/10 bg-[#030815] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-fuchsia-300/30"
      />

      <button
        type="button"
        onClick={handleRunDarkwebPipeline}
        disabled={loading}
        className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-fuchsia-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Running dark web pipeline...' : 'Run dark web pipeline'}
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

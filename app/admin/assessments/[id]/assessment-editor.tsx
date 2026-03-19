'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type AssessmentEditorProps = {
  id: string
  initialStatus: string
  initialScore: number
  initialRiskLevel: string
}

export default function AssessmentEditor({
  id,
  initialStatus,
  initialScore,
  initialRiskLevel,
}: AssessmentEditorProps) {
  const router = useRouter()

  const [status, setStatus] = useState(initialStatus)
  const [overallScore, setOverallScore] = useState(String(initialScore))
  const [overallRiskLevel, setOverallRiskLevel] = useState(initialRiskLevel)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/admin/assessments/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status,
          overallScore,
          overallRiskLevel,
        }),
      })

      const result = await response.json()

      setLoading(false)

      if (!response.ok) {
        setError(result?.error || 'Failed to update assessment.')
        return
      }

      setMessage('Assessment updated successfully.')
      router.refresh()
    } catch {
      setLoading(false)
      setError('Network error while updating assessment.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
          >
            <option value="draft" className="bg-slate-900">draft</option>
            <option value="running" className="bg-slate-900">running</option>
            <option value="completed" className="bg-slate-900">completed</option>
            <option value="failed" className="bg-slate-900">failed</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Overall score</label>
          <input
            value={overallScore}
            onChange={(e) => setOverallScore(e.target.value)}
            type="number"
            min="0"
            max="100"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Risk level</label>
          <select
            value={overallRiskLevel}
            onChange={(e) => setOverallRiskLevel(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
          >
            <option value="low" className="bg-slate-900">low</option>
            <option value="medium" className="bg-slate-900">medium</option>
            <option value="high" className="bg-slate-900">high</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl border border-cyan-300/30 bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </div>

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
    </form>
  )
}
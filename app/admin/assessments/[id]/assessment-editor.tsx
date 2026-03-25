'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type AssessmentStatus = 'draft' | 'in_review' | 'published' | 'archived'
type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

type ValidationPayload = {
  canPublish?: boolean
  errors?: string[]
  warnings?: string[]
}

type AssessmentEditorProps = {
  id: string
  initialStatus: string
  initialScore: number
  initialRiskLevel: string
  initialExecutiveSummary?: string | null
}

const STATUS_OPTIONS: Array<{
  value: AssessmentStatus
  label: string
  description: string
}> = [
  {
    value: 'draft',
    label: 'Draft',
    description: 'Editable working version, never visible to the client.',
  },
  {
    value: 'in_review',
    label: 'In review',
    description: 'Ready for internal review, not yet visible to the client.',
  },
  {
    value: 'published',
    label: 'Published',
    description: 'Visible to the client and considered the active published version.',
  },
  {
    value: 'archived',
    label: 'Archived',
    description: 'Historical version, no longer active.',
  },
]

const RISK_OPTIONS: Array<{ value: RiskLevel; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

function normalizeIncomingStatus(value: string): AssessmentStatus {
  switch (value) {
    case 'draft':
      return 'draft'
    case 'in_review':
      return 'in_review'
    case 'published':
      return 'published'
    case 'archived':
      return 'archived'
    case 'completed':
      return 'in_review'
    case 'running':
      return 'draft'
    case 'failed':
      return 'draft'
    default:
      return 'draft'
  }
}

function normalizeIncomingRisk(value: string): RiskLevel {
  switch (value) {
    case 'low':
      return 'low'
    case 'medium':
      return 'medium'
    case 'high':
      return 'high'
    case 'critical':
      return 'critical'
    default:
      return 'low'
  }
}

function getAllowedNextStatuses(current: AssessmentStatus): AssessmentStatus[] {
  switch (current) {
    case 'draft':
      return ['draft', 'in_review']
    case 'in_review':
      return ['draft', 'in_review', 'published']
    case 'published':
      return ['published', 'archived']
    case 'archived':
      return ['archived']
    default:
      return ['draft']
  }
}

export default function AssessmentEditor({
  id,
  initialStatus,
  initialScore,
  initialRiskLevel,
  initialExecutiveSummary,
}: AssessmentEditorProps) {
  const router = useRouter()

  const normalizedInitialStatus = normalizeIncomingStatus(initialStatus)
  const normalizedInitialRisk = normalizeIncomingRisk(initialRiskLevel)

  const [status, setStatus] = useState<AssessmentStatus>(normalizedInitialStatus)
  const [overallScore, setOverallScore] = useState(String(initialScore))
  const [overallRiskLevel, setOverallRiskLevel] =
    useState<RiskLevel>(normalizedInitialRisk)
  const [executiveSummary, setExecutiveSummary] = useState(
    initialExecutiveSummary ?? '',
  )

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [validation, setValidation] = useState<ValidationPayload | null>(null)

  const allowedStatuses = useMemo(
    () => getAllowedNextStatuses(normalizedInitialStatus),
    [normalizedInitialStatus],
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    setValidation(null)

    const parsedScore = Number(overallScore)

    if (!Number.isFinite(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      setLoading(false)
      setError('Overall score must be a number between 0 and 100.')
      return
    }

    try {
      const response = await fetch('/api/admin/assessments/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status,
          overallScore: parsedScore,
          overallRiskLevel,
          executiveSummary,
        }),
      })

      const result = await response.json()

      setLoading(false)

      if (!response.ok) {
        setError(result?.error || 'Failed to update assessment.')
        if (result?.validation) {
          setValidation(result.validation)
        }
        return
      }

      if (result?.validation) {
        setValidation(result.validation)
      }

      setMessage(
        status === 'published'
          ? 'Assessment published successfully.'
          : 'Assessment updated successfully.',
      )
      router.refresh()
    } catch {
      setLoading(false)
      setError('Network error while updating assessment.')
    }
  }

  const selectedStatusMeta =
    STATUS_OPTIONS.find((option) => option.value === status) ?? STATUS_OPTIONS[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AssessmentStatus)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
          >
            {STATUS_OPTIONS.filter((option) =>
              allowedStatuses.includes(option.value),
            ).map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {selectedStatusMeta.description}
          </p>
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
            onChange={(e) => setOverallRiskLevel(e.target.value as RiskLevel)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
          >
            {RISK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">
          Executive summary
        </label>
        <textarea
          value={executiveSummary}
          onChange={(e) => setExecutiveSummary(e.target.value)}
          rows={6}
          placeholder="Summarize the current exposure, overall risk profile, and the main priorities for the client."
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
        />
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Used as the top-level summary for publication readiness and final report quality.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
        <div className="font-medium text-white">Publishing rule</div>
        <p className="mt-2 leading-6 text-slate-400">
          Moving an assessment to <span className="text-white">Published</span> should
          only succeed if server-side validation passes. The UI should not be the only
          protection.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl border border-cyan-300/30 bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
        >
          {loading
            ? 'Saving...'
            : status === 'published'
              ? 'Save / publish'
              : 'Save changes'}
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

      {validation?.errors && validation.errors.length > 0 ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
          <div className="text-sm font-medium text-red-200">
            Publication blocking issues
          </div>
          <ul className="mt-3 space-y-2 text-sm text-red-100">
            {validation.errors.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {validation?.warnings && validation.warnings.length > 0 ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
          <div className="text-sm font-medium text-amber-200">
            Validation warnings
          </div>
          <ul className="mt-3 space-y-2 text-sm text-amber-100">
            {validation.warnings.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  )
}
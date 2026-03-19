'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

type Assessment = {
  id: string
  organization_id: string
  status: string
  overall_score: number
  overall_risk_level: string
}

type Organization = {
  id: string
  name: string
  domain: string
}

export default function NewRemediationTaskPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])

  const [assessmentId, setAssessmentId] = useState('')
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [effort, setEffort] = useState('medium')
  const [impact, setImpact] = useState('medium')
  const [status, setStatus] = useState('open')

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoadingData(true)
      setError(null)

      const supabase = createSupabaseBrowserClient()

      const [{ data: assData, error: assError }, { data: orgData, error: orgError }] =
        await Promise.all([
          supabase
            .from('assessments')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('organizations')
            .select('id, name, domain')
            .order('created_at', { ascending: false }),
        ])

      setLoadingData(false)

      if (assError) {
        setError(assError.message)
        return
      }

      if (orgError) {
        setError(orgError.message)
        return
      }

      const assessmentRows = (assData ?? []) as Assessment[]
      const organizationRows = (orgData ?? []) as Organization[]

      setAssessments(assessmentRows)
      setOrganizations(organizationRows)

      if (assessmentRows.length > 0) {
        setAssessmentId(assessmentRows[0].id)
      }
    }

    loadData()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/admin/remediation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentId,
          title,
          priority,
          effort,
          impact,
          status,
        }),
      })

      const result = await response.json()

      setLoading(false)

      if (!response.ok) {
        setError(result?.error || 'Failed to create remediation task.')
        return
      }

      setMessage('Remediation task created successfully.')
      setTitle('')
      setPriority('medium')
      setEffort('medium')
      setImpact('medium')
      setStatus('open')
    } catch {
      setLoading(false)
      setError('Network error while creating remediation task.')
    }
  }

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Admin
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            New Remediation Task
          </h1>
          <p className="mt-3 text-slate-400">
            Add an actionable remediation item to an assessment.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Assessment</label>

              {loadingData ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-slate-400">
                  Loading assessments...
                </div>
              ) : assessments.length === 0 ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-amber-200">
                  No assessments found. Create one first.
                </div>
              ) : (
                <select
                  value={assessmentId}
                  onChange={(e) => setAssessmentId(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
                >
                  {assessments.map((assessment) => {
                    const org = organizations.find((o) => o.id === assessment.organization_id)
                    return (
                      <option key={assessment.id} value={assessment.id} className="bg-slate-900">
                        {org?.name ?? 'Unknown org'} — {assessment.status} — score {assessment.overall_score}
                      </option>
                    )
                  })}
                </select>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Task title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Introduce verification for payment and bank-detail changes"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
                >
                  <option value="low" className="bg-slate-900">low</option>
                  <option value="medium" className="bg-slate-900">medium</option>
                  <option value="high" className="bg-slate-900">high</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Effort</label>
                <select
                  value={effort}
                  onChange={(e) => setEffort(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
                >
                  <option value="low" className="bg-slate-900">low</option>
                  <option value="medium" className="bg-slate-900">medium</option>
                  <option value="high" className="bg-slate-900">high</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Impact</label>
                <select
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
                >
                  <option value="low" className="bg-slate-900">low</option>
                  <option value="medium" className="bg-slate-900">medium</option>
                  <option value="high" className="bg-slate-900">high</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
                >
                  <option value="open" className="bg-slate-900">open</option>
                  <option value="in_progress" className="bg-slate-900">in_progress</option>
                  <option value="done" className="bg-slate-900">done</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || assessments.length === 0}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Create remediation task'}
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
          </form>
        </div>
      </div>
    </main>
  )
}
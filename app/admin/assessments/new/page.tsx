'use client'

import { useEffect, useState } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase'
const supabase = createSupabaseBrowserClient()
type Organization = {
  id: string
  name: string
  domain: string
}

export default function NewAssessmentPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [organizationId, setOrganizationId] = useState('')
  const [status, setStatus] = useState('draft')
  const [overallScore, setOverallScore] = useState('0')
  const [overallRiskLevel, setOverallRiskLevel] = useState('low')

  const [loading, setLoading] = useState(false)
  const [loadingOrganizations, setLoadingOrganizations] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrganizations() {
      setLoadingOrganizations(true)

      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, domain')
        .order('created_at', { ascending: false })

      setLoadingOrganizations(false)

      if (error) {
        setError(error.message)
        return
      }

      const rows = (data ?? []) as Organization[]
      setOrganizations(rows)

      if (rows.length > 0) {
        setOrganizationId(rows[0].id)
      }
    }

    loadOrganizations()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    const parsedScore = Number(overallScore)

    const { error } = await supabase.from('assessments').insert({
      organization_id: organizationId,
      status,
      overall_score: Number.isNaN(parsedScore) ? 0 : parsedScore,
      overall_risk_level: overallRiskLevel,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Assessment created successfully.')
    setStatus('draft')
    setOverallScore('0')
    setOverallRiskLevel('low')
  }

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Admin
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            New Assessment
          </h1>
          <p className="mt-3 text-slate-400">
            Create a new HumanSurface assessment linked to an existing organization.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Organization
              </label>

              {loadingOrganizations ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-slate-400">
                  Loading organizations...
                </div>
              ) : organizations.length === 0 ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-amber-200">
                  No organizations found. Create one first.
                </div>
              ) : (
                <select
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id} className="bg-slate-900">
                      {org.name} — {org.domain}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Status
              </label>
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
              <label className="mb-2 block text-sm text-slate-300">
                Overall score
              </label>
              <input
                value={overallScore}
                onChange={(e) => setOverallScore(e.target.value)}
                type="number"
                min="0"
                max="100"
                placeholder="72"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Overall risk level
              </label>
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

            <button
              type="submit"
              disabled={loading || organizations.length === 0}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Create assessment'}
            </button>

            {message && (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}
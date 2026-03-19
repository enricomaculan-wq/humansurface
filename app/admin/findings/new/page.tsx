'use client'

import { useEffect, useState } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase'
const supabase = createSupabaseBrowserClient()
type AssessmentRow = {
  id: string
  organization_id: string
  status: string
  overall_score: number
  overall_risk_level: string
  organizations: {
    name: string
    domain: string
  } | null
}

type PersonRow = {
  id: string
  organization_id: string
  full_name: string | null
  role_title: string
  department: string | null
}

export default function NewFindingPage() {
  const [assessments, setAssessments] = useState<AssessmentRow[]>([])
  const [people, setPeople] = useState<PersonRow[]>([])

  const [assessmentId, setAssessmentId] = useState('')
  const [personId, setPersonId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('medium')
  const [category, setCategory] = useState('general')

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoadingData(true)
      setError(null)

      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select(`
          id,
          organization_id,
          status,
          overall_score,
          overall_risk_level,
          organizations (
            name,
            domain
          )
        `)
        .order('created_at', { ascending: false })

      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select('id, organization_id, full_name, role_title, department')
        .order('created_at', { ascending: false })

      setLoadingData(false)

      if (assessmentsError) {
        setError(assessmentsError.message)
        return
      }

      if (peopleError) {
        setError(peopleError.message)
        return
      }

    const assessmentRows: AssessmentRow[] = (assessmentsData ?? []).map((item: any) => ({
        id: item.id,
        organization_id: item.organization_id,
        status: item.status,
        overall_score: item.overall_score,
        overall_risk_level: item.overall_risk_level,
        organizations: Array.isArray(item.organizations)
            ? item.organizations[0] ?? null
            : item.organizations ?? null,
    }))

    const peopleRows: PersonRow[] = (peopleData ?? []).map((item: any) => ({
        id: item.id,
        organization_id: item.organization_id,
        full_name: item.full_name,
        role_title: item.role_title,
        department: item.department,
    }))

      setAssessments(assessmentRows)
      setPeople(peopleRows)

      if (assessmentRows.length > 0) {
        setAssessmentId(assessmentRows[0].id)
      }
    }

    loadData()
  }, [])

  const selectedAssessment = assessments.find((item) => item.id === assessmentId)

  const filteredPeople = selectedAssessment
    ? people.filter((person) => person.organization_id === selectedAssessment.organization_id)
    : []

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    const { error } = await supabase.from('findings').insert({
      assessment_id: assessmentId,
      person_id: personId || null,
      title,
      description: description || null,
      severity,
      category,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Finding created successfully.')
    setPersonId('')
    setTitle('')
    setDescription('')
    setSeverity('medium')
    setCategory('general')
  }

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Admin
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            New Finding
          </h1>
          <p className="mt-3 text-slate-400">
            Add a real exposure signal to an existing assessment.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Assessment
              </label>

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
                  onChange={(e) => {
                    setAssessmentId(e.target.value)
                    setPersonId('')
                  }}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
                >
                  {assessments.map((assessment) => (
                    <option key={assessment.id} value={assessment.id} className="bg-slate-900">
                      {assessment.organizations?.name ?? 'Unknown org'} — {assessment.organizations?.domain ?? 'no-domain'} — {assessment.status} — score {assessment.overall_score}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Person / role (optional)
              </label>
              <select
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
              >
                <option value="" className="bg-slate-900">
                  No linked person
                </option>
                {filteredPeople.map((person) => (
                  <option key={person.id} value={person.id} className="bg-slate-900">
                    {person.full_name ?? person.role_title} — {person.role_title}
                    {person.department ? ` — ${person.department}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Public email addresses found on company pages"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Direct contact visibility increases phishing reach and spoofing credibility."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
                >
                  <option value="low" className="bg-slate-900">low</option>
                  <option value="medium" className="bg-slate-900">medium</option>
                  <option value="high" className="bg-slate-900">high</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
                >
                  <option value="general" className="bg-slate-900">general</option>
                  <option value="email_exposure" className="bg-slate-900">email_exposure</option>
                  <option value="org_visibility" className="bg-slate-900">org_visibility</option>
                  <option value="role_visibility" className="bg-slate-900">role_visibility</option>
                  <option value="social_engineering_context" className="bg-slate-900">social_engineering_context</option>
                  <option value="impersonation" className="bg-slate-900">impersonation</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || assessments.length === 0}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Create finding'}
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
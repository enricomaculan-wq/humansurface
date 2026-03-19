'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { calculateAssessmentScores, calculatePersonScores } from '@/lib/scoring'

type AssessmentRow = {
  id: string
  organization_id: string
  status: string
  overall_score: number
  overall_risk_level: string
}

type OrganizationRow = {
  id: string
  name: string
  domain: string
}

type FindingRow = {
  id: string
  assessment_id: string
  person_id: string | null
  title: string
  description: string | null
  severity: string
  category: string
}

export default function RecalculateScoresPage() {
  const [assessments, setAssessments] = useState<AssessmentRow[]>([])
  const [organizations, setOrganizations] = useState<OrganizationRow[]>([])
  const [assessmentId, setAssessmentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoadingData(true)
      setError(null)

      const [{ data: assData, error: assError }, { data: orgData, error: orgError }] =
        await Promise.all([
          supabase.from('assessments').select('*').order('created_at', { ascending: false }),
          supabase.from('organizations').select('*').order('created_at', { ascending: false }),
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

      const assessmentRows = (assData ?? []) as AssessmentRow[]
      const organizationRows = (orgData ?? []) as OrganizationRow[]

      setAssessments(assessmentRows)
      setOrganizations(organizationRows)

      if (assessmentRows.length > 0) {
        setAssessmentId(assessmentRows[0].id)
      }
    }

    loadData()
  }, [])

  const selectedAssessment = assessments.find((a) => a.id === assessmentId)
  const selectedOrganization = selectedAssessment
    ? organizations.find((o) => o.id === selectedAssessment.organization_id)
    : null

  async function handleRecalculate() {
    if (!assessmentId) return

    setLoading(true)
    setMessage(null)
    setError(null)

    const { data: findings, error: findingsError } = await supabase
      .from('findings')
      .select('id, assessment_id, person_id, title, description, severity, category')
      .eq('assessment_id', assessmentId)

    if (findingsError) {
      setLoading(false)
      setError(findingsError.message)
      return
    }

    const findingRows = (findings ?? []) as FindingRow[]
    const assessmentScores = calculateAssessmentScores(findingRows)
    const personScores = calculatePersonScores(findingRows)

    const { error: deleteError } = await supabase
      .from('scores')
      .delete()
      .eq('assessment_id', assessmentId)

    if (deleteError) {
      setLoading(false)
      setError(deleteError.message)
      return
    }

    const rowsToInsert = [
      {
        assessment_id: assessmentId,
        person_id: null,
        score_type: 'impersonation_risk',
        score_value: assessmentScores.impersonationScore,
        risk_level: assessmentScores.impersonationRiskLevel,
        reason_summary: 'Calculated from finding severity and category weights.',
      },
      {
        assessment_id: assessmentId,
        person_id: null,
        score_type: 'finance_fraud_risk',
        score_value: assessmentScores.financeScore,
        risk_level: assessmentScores.financeRiskLevel,
        reason_summary: 'Calculated from finding severity and category weights.',
      },
      {
        assessment_id: assessmentId,
        person_id: null,
        score_type: 'hr_social_engineering_risk',
        score_value: assessmentScores.hrScore,
        risk_level: assessmentScores.hrRiskLevel,
        reason_summary: 'Calculated from finding severity and category weights.',
      },
      {
        assessment_id: assessmentId,
        person_id: null,
        score_type: 'overall',
        score_value: assessmentScores.overallScore,
        risk_level: assessmentScores.overallRiskLevel,
        reason_summary: 'Average of the three primary score dimensions.',
      },
      ...personScores.map((item) => ({
        assessment_id: assessmentId,
        person_id: item.personId,
        score_type: 'person_overall_risk',
        score_value: item.overallScore,
        risk_level: item.overallRiskLevel,
        reason_summary: item.reasonSummary,
      })),
    ]

    const { error: insertError } = await supabase.from('scores').insert(rowsToInsert)

    if (insertError) {
      setLoading(false)
      setError(insertError.message)
      return
    }

    const { error: updateAssessmentError } = await supabase
      .from('assessments')
      .update({
        overall_score: assessmentScores.overallScore,
        overall_risk_level: assessmentScores.overallRiskLevel,
      })
      .eq('id', assessmentId)

    setLoading(false)

    if (updateAssessmentError) {
      setError(updateAssessmentError.message)
      return
    }

    setMessage('Scores recalculated successfully.')
  }

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Admin</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Recalculate Scores</h1>
          <p className="mt-3 text-slate-400">
            Calculate assessment and person-level scores from real findings.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Assessment</label>

              {loadingData ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-slate-400">
                  Loading assessments...
                </div>
              ) : assessments.length === 0 ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-amber-200">
                  No assessments found.
                </div>
              ) : (
                <select
                  value={assessmentId}
                  onChange={(e) => setAssessmentId(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
                >
                  {assessments.map((assessment) => {
                    const org = organizations.find((o) => o.id === assessment.organization_id)
                    return (
                      <option key={assessment.id} value={assessment.id} className="bg-slate-900">
                        {org?.name ?? 'Unknown org'} — {assessment.status} — current score {assessment.overall_score}
                      </option>
                    )
                  })}
                </select>
              )}
            </div>

            {selectedAssessment && selectedOrganization ? (
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-cyan-100">
                {selectedOrganization.name} — {selectedOrganization.domain}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleRecalculate}
              disabled={loading || !assessmentId}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
            >
              {loading ? 'Calculating...' : 'Recalculate scores'}
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
          </div>
        </div>
      </div>
    </main>
  )
}
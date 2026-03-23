import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { formatDateTime } from '@/lib/date'

type AssessmentRow = {
  id: string
  organization_id: string
  status: string
  overall_score: number
  overall_risk_level: string
  created_at: string
}

type OrganizationRow = {
  id: string
  name: string
  domain: string
  industry: string | null
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase()

  const cls =
    normalized === 'completed'
      ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
      : normalized === 'processing' || normalized === 'queued' || normalized === 'running'
        ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
        : normalized === 'failed'
          ? 'border-red-400/20 bg-red-400/10 text-red-200'
          : 'border-white/10 bg-white/[0.03] text-slate-300'

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${cls}`}>
      {value}
    </span>
  )
}

export default async function AssessmentStatusPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: assessmentData, error: assessmentError } = await supabaseAdmin
    .from('assessments')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (assessmentError) {
    throw new Error(`Assessment read failed: ${assessmentError.message}`)
  }

  if (!assessmentData) {
    notFound()
  }

  const assessment = assessmentData as AssessmentRow

  const { data: organizationData, error: organizationError } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .eq('id', assessment.organization_id)
    .maybeSingle()

  if (organizationError) {
    throw new Error(`Organization read failed: ${organizationError.message}`)
  }

  const organization = organizationData as OrganizationRow | null

  const isReady = assessment.status === 'completed'
  const isFailed = assessment.status === 'failed'

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <div className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
                Assessment status
              </div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                {organization?.name || 'HumanSurface Assessment'}
              </h1>
              <p className="mt-3 text-slate-400">
                {organization?.domain || '—'}
                {organization?.industry ? ` · ${organization.industry}` : ''}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Created: {formatDateTime(assessment.created_at)}
              </p>
            </div>

            <div className="self-start">
              <StatusBadge value={assessment.status} />
            </div>
          </div>

          {!isReady && !isFailed ? (
            <>
              <div className="mt-8 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-6">
                <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">
                  In preparation
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Your HumanSurface Assessment is being prepared
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-200">
                  We are processing your company’s public exposure and preparing
                  your assessment output.
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-6">
                <div className="text-sm uppercase tracking-[0.16em] text-fuchsia-200">
                  Delivery timing
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Your report will be available within 2 business days. In many
                  cases, delivery happens earlier.
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="text-sm uppercase tracking-[0.16em] text-slate-400">
                  Assessment reference
                </div>
                <div className="mt-2 break-all text-sm text-slate-300">{assessment.id}</div>
              </div>
            </>
          ) : null}

          {isReady ? (
            <>
              <div className="mt-8 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-6">
                <div className="text-sm uppercase tracking-[0.16em] text-emerald-100">
                  Ready
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Your assessment is ready
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-200">
                  Your HumanSurface Assessment is now available. You can open the
                  report and review findings, scores, and remediation priorities.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={`/admin/assessments/${assessment.id}/report`}
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  Open report
                </Link>

                <Link
                  href={`/admin/assessments/${assessment.id}/print`}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
                >
                  Export / Print
                </Link>
              </div>
            </>
          ) : null}

          {isFailed ? (
            <>
              <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/10 p-6">
                <div className="text-sm uppercase tracking-[0.16em] text-red-200">
                  Processing issue
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Your assessment needs review
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-200">
                  We encountered an issue while processing your assessment. Please
                  contact support and include your assessment reference.
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="text-sm uppercase tracking-[0.16em] text-slate-400">
                  Assessment reference
                </div>
                <div className="mt-2 break-all text-sm text-slate-300">{assessment.id}</div>
              </div>

              <div className="mt-8">
                <a
                  href={`mailto:humansurface@soreya.app?subject=HumanSurface%20Assessment%20Support%20${assessment.id}`}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
                >
                  Contact support
                </a>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  )
}
import { redirect } from 'next/navigation'
import { createSupabaseAuthServerClient } from '@/lib/supabase-auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { formatDateTime } from '@/lib/date'
import LogoutButton from './logout-button'

type CompanyUserRow = {
  id: string
  company_id: string
  auth_user_id: string | null
  email: string
}

type ClientOrderRow = {
  id: string
  company_name: string
  domain: string
  status: string
  billing_status: string | null
  assessment_id: string | null
  created_at: string
}

type AssessmentRow = {
  id: string
  status: string
  overall_score: number
  overall_risk_level: string
}

function StatusBadge({ value }: { value: string | null }) {
  const normalized = (value ?? 'unknown').toLowerCase()

  const cls =
    normalized === 'completed' || normalized === 'paid'
      ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
      : normalized === 'processing' ||
          normalized === 'queued' ||
          normalized === 'pending' ||
          normalized === 'pending_payment'
        ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
        : normalized === 'failed' || normalized === 'expired'
          ? 'border-red-400/20 bg-red-400/10 text-red-200'
          : 'border-white/10 bg-white/[0.03] text-slate-300'

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${cls}`}>
      {value ?? 'unknown'}
    </span>
  )
}

export default async function ClientPage() {
  const supabase = await createSupabaseAuthServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id || !user.email) {
    redirect('/login')
  }

  const { data: companyUserData, error: companyUserError } = await supabaseAdmin
    .from('company_users')
    .select('id, company_id, auth_user_id, email')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (companyUserError) {
    throw new Error(`Company user lookup failed: ${companyUserError.message}`)
  }

  const companyUser = companyUserData as CompanyUserRow | null

  if (!companyUser) {
    return (
      <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
                Client area
              </div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                Your assessments
              </h1>
              <p className="mt-3 text-slate-400">{user.email}</p>
            </div>
            <LogoutButton />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-slate-400">
            No company profile is linked to this account yet.
          </div>
        </div>
      </main>
    )
  }

  const { data: orders, error } = await supabaseAdmin
    .from('assessment_orders')
    .select('id, company_name, domain, status, billing_status, assessment_id, created_at')
    .eq('company_user_id', companyUser.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Orders read failed: ${error.message}`)
  }

  const safeOrders = (orders ?? []) as ClientOrderRow[]
  const assessmentIds = safeOrders
    .map((order) => order.assessment_id)
    .filter((value): value is string => !!value)

  let assessmentsById = new Map<string, AssessmentRow>()

  if (assessmentIds.length > 0) {
    const { data: assessmentsData, error: assessmentsError } = await supabaseAdmin
      .from('assessments')
      .select('id, status, overall_score, overall_risk_level')
      .in('id', assessmentIds)

    if (assessmentsError) {
      throw new Error(`Assessments read failed: ${assessmentsError.message}`)
    }

    const assessments = (assessmentsData ?? []) as AssessmentRow[]
    assessmentsById = new Map(assessments.map((item) => [item.id, item]))
  }

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Client area
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Your assessments
            </h1>
            <p className="mt-3 text-slate-400">{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="space-y-4">
          {safeOrders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-slate-400">
              No assessments found for this account.
            </div>
          ) : (
            safeOrders.map((order) => {
              const assessment = order.assessment_id
                ? assessmentsById.get(order.assessment_id) ?? null
                : null

              const assessmentStatus = assessment?.status ?? null
              const isReady = assessmentStatus === 'completed'

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-xl font-semibold text-white">
                        {order.company_name}
                      </div>
                      <div className="mt-1 text-slate-400">{order.domain}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusBadge value={order.status} />
                        <StatusBadge value={order.billing_status} />
                        {assessmentStatus ? (
                          <StatusBadge value={assessmentStatus} />
                        ) : null}
                      </div>
                      <div className="mt-3 text-sm text-slate-500">
                        Created: {formatDateTime(order.created_at)}
                      </div>

                      {assessment ? (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-[#071022] px-4 py-3">
                          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            Assessment summary
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-4">
                            <div>
                              <div className="text-xs text-slate-500">Score</div>
                              <div className="text-lg font-semibold text-white">
                                {assessment.overall_score}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Risk</div>
                              <div className="text-lg font-semibold text-white">
                                {assessment.overall_risk_level}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                      {order.assessment_id ? (
                        <a
                          href={`/assessment/status/${order.assessment_id}`}
                          className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950"
                        >
                          View status
                        </a>
                      ) : null}

                      {order.assessment_id && isReady ? (
                        <a
                          href={`/assessment/report/${order.assessment_id}`}
                          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
                        >
                          Open report
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}
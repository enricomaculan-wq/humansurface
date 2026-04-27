import { redirect } from 'next/navigation'
import { createSupabaseAuthServerClient } from '@/lib/supabase-auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { formatDateTime } from '@/lib/date'
import LanguageToggle from '@/app/components/language-toggle'
import { getDictionary, getRequestLocale } from '@/lib/i18n/server'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'
import LogoutButton from './logout-button'

type AssessmentStatus = 'draft' | 'in_review' | 'published' | 'archived'

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
  created_at?: string | null
  published_at?: string | null
}

type ScoreRow = {
  id: string
  assessment_id: string
  person_id: string | null
  score_type: string
  score_value: number
  risk_level: string
  created_at: string
  score_scope?: string | null
}

function normalizeAssessmentStatus(value: string | null | undefined): AssessmentStatus | null {
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
      return 'published'
    case 'running':
      return 'draft'
    case 'failed':
      return 'draft'
    default:
      return null
  }
}

function formatStatusLabel(
  value: string | null | undefined,
  dictionary: Dictionary,
) {
  const normalized = (value ?? 'unknown').toLowerCase()

  switch (normalized) {
    case 'archived':
      return dictionary.common.status.archived
    case 'completed':
      return dictionary.common.status.completed
    case 'draft':
      return dictionary.common.status.draft
    case 'expired':
      return dictionary.common.status.expired
    case 'failed':
      return dictionary.common.status.failed
    case 'in_review':
      return dictionary.common.status.inReview
    case 'paid':
      return dictionary.common.status.paid
    case 'pending':
      return dictionary.common.status.pending
    case 'pending_payment':
      return dictionary.common.status.pendingPayment
    case 'processing':
      return dictionary.common.status.processing
    case 'published':
      return dictionary.common.status.published
    case 'queued':
      return dictionary.common.status.queued
    case 'running':
      return dictionary.common.status.running
    case 'unknown':
      return dictionary.common.status.unknown
    default:
      return value ? value.replace(/_/g, ' ') : dictionary.common.status.unknown
  }
}

function getBadgeClasses(value: string | null) {
  const normalized = (value ?? 'unknown').toLowerCase()

  if (normalized === 'published' || normalized === 'paid' || normalized === 'completed') {
    return 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
  }

  if (
    normalized === 'processing' ||
    normalized === 'queued' ||
    normalized === 'pending' ||
    normalized === 'pending_payment' ||
    normalized === 'draft' ||
    normalized === 'in_review'
  ) {
    return 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
  }

  if (normalized === 'failed' || normalized === 'expired' || normalized === 'archived') {
    return 'border-red-400/20 bg-red-400/10 text-red-200'
  }

  return 'border-white/10 bg-white/[0.03] text-slate-300'
}

function LabeledStatusBadge({
  label,
  value,
  dictionary,
}: {
  label: string
  value: string | null
  dictionary: Dictionary
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${getBadgeClasses(
        value,
      )}`}
    >
      <span className="uppercase tracking-[0.14em] opacity-70">{label}</span>
      <span className="font-medium uppercase">
        {formatStatusLabel(value, dictionary)}
      </span>
    </div>
  )
}

function getRiskLabel(value: string | null | undefined, dictionary: Dictionary) {
  const normalized = (value ?? 'unknown').toLowerCase()

  switch (normalized) {
    case 'critical':
      return dictionary.common.risk.critical
    case 'high':
      return dictionary.common.risk.high
    case 'medium':
      return dictionary.common.risk.medium
    case 'moderate':
      return dictionary.common.risk.moderate
    case 'low':
      return dictionary.common.risk.low
    default:
      return dictionary.common.risk.unknown
  }
}

function RiskBadge({
  value,
  dictionary,
}: {
  value: string | null
  dictionary: Dictionary
}) {
  const normalized = (value ?? 'unknown').toLowerCase()

  const cls =
    normalized === 'critical'
      ? 'border-red-400/20 bg-red-400/10 text-red-200'
      : normalized === 'high'
        ? 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200'
        : normalized === 'medium'
          ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
          : normalized === 'low'
            ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
            : 'border-white/10 bg-white/[0.03] text-slate-300'

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${cls}`}>
      {getRiskLabel(value, dictionary)}
    </span>
  )
}

function getAssessmentAvailabilityMessage(
  status: AssessmentStatus | null,
  copy: Dictionary['clientArea'],
) {
  switch (status) {
    case 'draft':
      return copy.availability.draft
    case 'in_review':
      return copy.availability.inReview
    case 'published':
      return copy.availability.published
    case 'archived':
      return copy.availability.archived
    default:
      return copy.availability.unknown
  }
}

function pickAssessmentScore(
  scores: ScoreRow[],
  scoreType: string,
  preferredScopes: Array<string | null> = ['combined', 'website', 'external', null],
) {
  const candidates = scores.filter((score) => score.score_type === scoreType)

  for (const scope of preferredScopes) {
    const found =
      scope === null
        ? candidates.find((score) => !score.score_scope)
        : candidates.find((score) => score.score_scope === scope)

    if (found) return found
  }

  return candidates[0] ?? null
}

export default async function ClientPage() {
  const locale = await getRequestLocale()
  const dictionary = await getDictionary(locale)
  const t = dictionary.clientArea

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

  let orders: ClientOrderRow[] = []

  if (companyUser?.id) {
    const { data: ordersByCompanyUser, error: ordersByCompanyUserError } =
      await supabaseAdmin
        .from('assessment_orders')
        .select('id, company_name, domain, status, billing_status, assessment_id, created_at')
        .eq('company_user_id', companyUser.id)
        .order('created_at', { ascending: false })

    if (!ordersByCompanyUserError) {
      orders = (ordersByCompanyUser ?? []) as ClientOrderRow[]
    }
  }

  if (orders.length === 0) {
    const { data: fallbackOrders, error: fallbackOrdersError } = await supabaseAdmin
      .from('assessment_orders')
      .select('id, company_name, domain, status, billing_status, assessment_id, created_at')
      .eq('email', user.email.toLowerCase())
      .order('created_at', { ascending: false })

    if (fallbackOrdersError) {
      throw new Error(`Orders read failed: ${fallbackOrdersError.message}`)
    }

    orders = (fallbackOrders ?? []) as ClientOrderRow[]
  }

  const assessmentIds = orders
    .map((order) => order.assessment_id)
    .filter((value): value is string => !!value)

  let assessmentsById = new Map<string, AssessmentRow>()

  if (assessmentIds.length > 0) {
    const { data: assessmentsData, error: assessmentsError } = await supabaseAdmin
      .from('assessments')
      .select('id, status, overall_score, overall_risk_level, created_at, published_at')
      .in('id', assessmentIds)

    if (assessmentsError) {
      throw new Error(`Assessments read failed: ${assessmentsError.message}`)
    }

    const assessments = (assessmentsData ?? []) as AssessmentRow[]
    assessmentsById = new Map(assessments.map((item) => [item.id, item]))
  }

  const overallScoresByAssessmentId = new Map<
    string,
    { score_value: number; risk_level: string }
  >()

  if (assessmentIds.length > 0) {
    const { data: scoresData, error: scoresError } = await supabaseAdmin
      .from('scores')
      .select(
        'id, assessment_id, person_id, score_type, score_value, risk_level, created_at, score_scope',
      )
      .in('assessment_id', assessmentIds)
      .is('person_id', null)
      .order('created_at', { ascending: false })

    if (scoresError) {
      throw new Error(`Scores read failed: ${scoresError.message}`)
    }

    const scores = (scoresData ?? []) as ScoreRow[]

    for (const assessmentId of assessmentIds) {
      const assessmentScores = scores.filter(
        (score) => score.assessment_id === assessmentId && score.person_id === null,
      )

      const overallScore = pickAssessmentScore(assessmentScores, 'overall')

      if (overallScore) {
        overallScoresByAssessmentId.set(assessmentId, {
          score_value: overallScore.score_value,
          risk_level: overallScore.risk_level,
        })
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 hidden justify-end md:flex">
          <LanguageToggle />
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              {t.eyebrow}
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {t.title}
            </h1>
            <p className="mt-3 text-slate-400">
              {t.description}
            </p>
            <p className="mt-2 text-sm text-slate-500">{user.email}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/buy"
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              {t.requestAssessment}
            </a>

            <a
              href="mailto:support@humansurface.com?subject=HumanSurface%20Support"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              {dictionary.common.actions.contactSupport}
            </a>

            <LogoutButton label={dictionary.common.actions.logout} />
          </div>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold text-white">
                {t.noLinkedTitle}
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                {t.noLinkedText}
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/buy"
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  {t.requestAssessment}
                </a>

                <a
                  href="mailto:support@humansurface.com?subject=Client%20account%20linking%20support"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
                >
                  {dictionary.common.actions.contactSupport}
                </a>
              </div>
            </div>
          ) : (
            orders.map((order) => {
              const assessment = order.assessment_id
                ? assessmentsById.get(order.assessment_id) ?? null
                : null

              const overallScore = order.assessment_id
                ? overallScoresByAssessmentId.get(order.assessment_id) ?? null
                : null

              const normalizedAssessmentStatus = normalizeAssessmentStatus(
                assessment?.status ?? null,
              )

              const canOpenReport = normalizedAssessmentStatus === 'published'
              const availabilityMessage = getAssessmentAvailabilityMessage(
                normalizedAssessmentStatus,
                t,
              )

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="text-xl font-semibold text-white">
                        {order.company_name}
                      </div>
                      <div className="mt-1 text-slate-400">{order.domain}</div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <LabeledStatusBadge
                          label={t.paymentLabel}
                          value={order.status}
                          dictionary={dictionary}
                        />
                        <LabeledStatusBadge
                          label={t.billingLabel}
                          value={order.billing_status}
                          dictionary={dictionary}
                        />
                        {assessment?.status ? (
                          <LabeledStatusBadge
                            label={t.assessmentLabel}
                            value={normalizedAssessmentStatus ?? assessment.status}
                            dictionary={dictionary}
                          />
                        ) : null}
                      </div>

                      <div className="mt-3 text-sm text-slate-500">
                        {t.createdLabel}: {formatDateTime(order.created_at, locale)}
                      </div>

                      {assessment ? (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-[#071022] px-4 py-4">
                          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            {t.summaryTitle}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-6">
                            <div>
                              <div className="text-xs text-slate-500">
                                {t.overallScoreLabel}
                              </div>
                              <div className="text-2xl font-semibold text-white">
                                {overallScore?.score_value ?? assessment.overall_score}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-slate-500">
                                {t.riskLevelLabel}
                              </div>
                              <div className="mt-1">
                                <RiskBadge
                                  value={
                                    overallScore?.risk_level ?? assessment.overall_risk_level
                                  }
                                  dictionary={dictionary}
                                />
                              </div>
                            </div>

                            {canOpenReport ? (
                              <div>
                                <div className="text-xs text-slate-500">
                                  {t.publishedLabel}
                                </div>
                                <div className="mt-1 text-sm text-slate-300">
                                  {formatDateTime(
                                    assessment.published_at ??
                                      assessment.created_at ??
                                      order.created_at,
                                    locale,
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </div>

                          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                            {availabilityMessage}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-[#071022] px-4 py-4 text-sm text-slate-300">
                          {t.orderRecordedText}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                      {order.assessment_id ? (
                        <a
                          href={`/assessment/status/${order.assessment_id}`}
                          className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950"
                        >
                          {t.viewStatus}
                        </a>
                      ) : null}

                      {order.assessment_id && canOpenReport ? (
                        <a
                          href={`/assessment/report/${order.assessment_id}`}
                          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
                        >
                          {t.openReport}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })
          )}

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="text-sm uppercase tracking-[0.18em] text-cyan-300">
                  {t.anotherEyebrow}
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {t.anotherTitle}
                </h2>
                <p className="mt-3 leading-7 text-slate-400">
                  {t.anotherText}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="/buy"
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  {t.requestAssessment}
                </a>

                <a
                  href="mailto:support@humansurface.com?subject=HumanSurface%20New%20Assessment%20Request"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
                >
                  {dictionary.common.actions.contactSupport}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

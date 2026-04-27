import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseAuthServerClient } from '@/lib/supabase-auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { formatDateTime } from '@/lib/date'
import LanguageToggle from '@/app/components/language-toggle'
import { getDictionary, getRequestLocale } from '@/lib/i18n/server'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'

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

type CompanyUserLookupRow = {
  id: string
}

type NormalizedAssessmentStatus = 'draft' | 'in_review' | 'published' | 'archived'

function normalizeAssessmentStatus(value: string): NormalizedAssessmentStatus | null {
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

function formatStatusLabel(value: string, dictionary: Dictionary) {
  switch (value.toLowerCase()) {
    case 'archived':
      return dictionary.common.status.archived
    case 'completed':
      return dictionary.common.status.completed
    case 'draft':
      return dictionary.common.status.draft
    case 'failed':
      return dictionary.common.status.failed
    case 'in_review':
      return dictionary.common.status.inReview
    case 'processing':
      return dictionary.common.status.processing
    case 'published':
      return dictionary.common.status.published
    case 'queued':
      return dictionary.common.status.queued
    case 'running':
      return dictionary.common.status.running
    default:
      return value.replace(/_/g, ' ')
  }
}

function StatusBadge({
  value,
  dictionary,
}: {
  value: string
  dictionary: Dictionary
}) {
  const normalized = value.toLowerCase()

  const cls =
    normalized === 'published' || normalized === 'completed'
      ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
      : normalized === 'in_review' ||
          normalized === 'processing' ||
          normalized === 'queued' ||
          normalized === 'running' ||
          normalized === 'draft'
        ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
      : normalized === 'archived' || normalized === 'failed'
        ? 'border-red-400/20 bg-red-400/10 text-red-200'
      : 'border-white/10 bg-white/[0.03] text-slate-300'

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${cls}`}
    >
      {formatStatusLabel(value, dictionary)}
    </span>
  )
}

export default async function AssessmentStatusPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const locale = await getRequestLocale()
  const dictionary = await getDictionary(locale)
  const t = dictionary.assessmentStatus

  const auth = await createSupabaseAuthServerClient()
  const {
    data: { user },
  } = await auth.auth.getUser()

  if (!user?.id) {
    redirect('/login')
  }

  const { data: companyUserData, error: companyUserError } = await supabaseAdmin
    .from('company_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (companyUserError) {
    throw new Error(`Company user lookup failed: ${companyUserError.message}`)
  }

  if (!companyUserData?.id) {
    notFound()
  }

  const companyUser = companyUserData as CompanyUserLookupRow

  const { data: orderData, error: orderError } = await supabaseAdmin
    .from('assessment_orders')
    .select('id, assessment_id, company_user_id')
    .eq('assessment_id', id)
    .eq('company_user_id', companyUser.id)
    .maybeSingle()

  if (orderError) {
    throw new Error(`Order lookup failed: ${orderError.message}`)
  }

  if (!orderData) {
    notFound()
  }

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
  const normalizedStatus = normalizeAssessmentStatus(assessment.status)

  if (normalizedStatus === 'published') {
    redirect(`/assessment/report/${assessment.id}`)
  }

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 hidden justify-end md:flex">
          <LanguageToggle />
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <div className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
                {t.eyebrow}
              </div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                {organization?.name || t.fallbackTitle}
              </h1>
              <p className="mt-3 text-slate-400">
                {organization?.domain || '—'}
                {organization?.industry ? ` · ${organization.industry}` : ''}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {t.createdLabel}: {formatDateTime(assessment.created_at, locale)}
              </p>
            </div>

            <div className="self-start">
              <StatusBadge
                value={normalizedStatus ?? assessment.status}
                dictionary={dictionary}
              />
            </div>
          </div>

          {normalizedStatus === 'draft' ? (
            <>
              <div className="mt-8 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-6">
                <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">
                  {t.states.draft.eyebrow}
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {t.states.draft.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-200">
                  {t.states.draft.description}
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-6">
                <div className="text-sm uppercase tracking-[0.16em] text-fuchsia-200">
                  {t.deliveryTitle}
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {t.states.draft.deliveryText}
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="text-sm uppercase tracking-[0.16em] text-slate-400">
                  {t.referenceTitle}
                </div>
                <div className="mt-2 break-all text-sm text-slate-300">
                  {assessment.id}
                </div>
              </div>
            </>
          ) : null}

          {normalizedStatus === 'in_review' ? (
            <>
              <div className="mt-8 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-6">
                <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">
                  {t.states.inReview.eyebrow}
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {t.states.inReview.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-200">
                  {t.states.inReview.description}
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-6">
                <div className="text-sm uppercase tracking-[0.16em] text-fuchsia-200">
                  {t.deliveryTitle}
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {t.states.inReview.deliveryText}
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="text-sm uppercase tracking-[0.16em] text-slate-400">
                  {t.referenceTitle}
                </div>
                <div className="mt-2 break-all text-sm text-slate-300">
                  {assessment.id}
                </div>
              </div>
            </>
          ) : null}

          {normalizedStatus === 'archived' ? (
            <>
              <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/10 p-6">
                <div className="text-sm uppercase tracking-[0.16em] text-red-200">
                  {t.states.archived.eyebrow}
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {t.states.archived.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-200">
                  {t.states.archived.description}
                </p>
              </div>

              <div className="mt-8">
                <a
                  href="mailto:support@humansurface.com?subject=HumanSurface%20Archived%20Assessment%20Support"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
                >
                  {t.contactSupport}
                </a>
              </div>
            </>
          ) : null}

          <div className="mt-8">
            <Link
              href="/client"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              {t.backToClientArea}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

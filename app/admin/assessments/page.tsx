import Link from 'next/link'
import AdminTopbar from '@/app/components/admin/admin-topbar'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type AssessmentStatus = 'draft' | 'in_review' | 'published' | 'archived'

type Assessment = {
  id: string
  organization_id: string
  status: string
  overall_score: number
  overall_risk_level: string
  created_at: string
  published_at?: string | null
}

type Organization = {
  id: string
  name: string
  domain: string
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

function formatStatusLabel(value: string | null | undefined) {
  if (!value) return 'unknown'
  return value.replace(/_/g, ' ')
}

function RiskBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase()

  const cls =
    normalized === 'critical'
      ? 'border-red-400/20 bg-red-400/10 text-red-200'
      : normalized === 'high'
        ? 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200'
        : normalized === 'medium' || normalized === 'moderate'
          ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
          : 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${cls}`}>
      {formatStatusLabel(value)}
    </span>
  )
}

function StatusBadge({ value }: { value: string | null | undefined }) {
  const normalized = (value ?? 'unknown').toLowerCase()

  const cls =
    normalized === 'published' || normalized === 'completed'
      ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
      : normalized === 'in_review'
        ? 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200'
        : normalized === 'draft' || normalized === 'processing' || normalized === 'queued'
          ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
          : normalized === 'archived'
            ? 'border-white/10 bg-white/[0.03] text-slate-300'
            : 'border-red-400/20 bg-red-400/10 text-red-200'

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${cls}`}>
      {formatStatusLabel(value)}
    </span>
  )
}

function MetricCard({
  label,
  value,
  accent = 'default',
}: {
  label: string
  value: number
  accent?: 'default' | 'cyan' | 'fuchsia' | 'emerald'
}) {
  const cls =
    accent === 'cyan'
      ? 'border-cyan-300/20 bg-cyan-300/[0.08]'
      : accent === 'fuchsia'
        ? 'border-fuchsia-400/20 bg-fuchsia-400/[0.08]'
        : accent === 'emerald'
          ? 'border-emerald-300/20 bg-emerald-300/[0.08]'
          : 'border-white/10 bg-white/[0.04]'

  return (
    <div className={`rounded-2xl border p-5 backdrop-blur-xl ${cls}`}>
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
      {label}
    </div>
  )
}

function AssessmentCard({
  assessment,
  organization,
  priority = false,
}: {
  assessment: Assessment
  organization: Organization | null
  priority?: boolean
}) {
  const normalizedStatus = normalizeAssessmentStatus(assessment.status) ?? assessment.status

  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        priority
          ? 'border-fuchsia-400/20 bg-fuchsia-400/[0.06]'
          : 'border-white/10 bg-[#030815]'
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-white">
              {organization?.name || 'Unknown organization'}
            </div>
            <StatusBadge value={normalizedStatus} />
          </div>

          <div className="mt-1 text-sm text-slate-400">{organization?.domain || '—'}</div>

          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
            <span>Created: {new Date(assessment.created_at).toLocaleString()}</span>
            {assessment.published_at ? (
              <span>Published: {new Date(assessment.published_at).toLocaleString()}</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="text-3xl font-semibold text-white">{assessment.overall_score}</div>
          <RiskBadge value={assessment.overall_risk_level} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/admin/assessments/${assessment.id}`}
          className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          Open
        </Link>

        <Link
          href={`/admin/assessments/${assessment.id}/report`}
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
        >
          Report
        </Link>

        <Link
          href={`/admin/assessments/${assessment.id}/print`}
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
        >
          Print
        </Link>
      </div>
    </div>
  )
}

function AssessmentSection({
  title,
  subtitle,
  assessments,
  organizations,
  priority = false,
}: {
  title: string
  subtitle: string
  assessments: Assessment[]
  organizations: Organization[]
  priority?: boolean
}) {
  return (
    <section
      className={`rounded-[28px] border p-6 backdrop-blur-xl ${
        priority
          ? 'border-fuchsia-400/20 bg-fuchsia-400/[0.05]'
          : 'border-white/10 bg-white/[0.04]'
      }`}
    >
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {assessments.length === 0 ? (
          <EmptyState label={`No assessments in ${title.toLowerCase()}.`} />
        ) : (
          assessments.map((assessment) => {
            const organization =
              organizations.find((org) => org.id === assessment.organization_id) ?? null

            return (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                organization={organization}
                priority={priority}
              />
            )
          })
        )}
      </div>
    </section>
  )
}

export default async function AssessmentsPage() {
  const supabase = await createSupabaseServerClient()

  const [{ data: assessmentsData }, { data: organizationsData }] = await Promise.all([
    supabase.from('assessments').select('*').order('created_at', { ascending: false }),
    supabase.from('organizations').select('id, name, domain'),
  ])

  const assessments = (assessmentsData ?? []) as Assessment[]
  const organizations = (organizationsData ?? []) as Organization[]

  const inReviewAssessments = assessments.filter(
    (assessment) => normalizeAssessmentStatus(assessment.status) === 'in_review',
  )

  const draftAssessments = assessments.filter(
    (assessment) => normalizeAssessmentStatus(assessment.status) === 'draft',
  )

  const publishedAssessments = assessments.filter(
    (assessment) => normalizeAssessmentStatus(assessment.status) === 'published',
  )

  const archivedAssessments = assessments.filter(
    (assessment) => normalizeAssessmentStatus(assessment.status) === 'archived',
  )

  return (
    <>
      <AdminTopbar
        title="Assessments"
        subtitle="Validate reviewed assessments, publish reports, and monitor delivery status."
      />

      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Needs review" value={inReviewAssessments.length} accent="fuchsia" />
          <MetricCard label="Draft" value={draftAssessments.length} accent="cyan" />
          <MetricCard label="Published" value={publishedAssessments.length} accent="emerald" />
          <MetricCard label="Archived" value={archivedAssessments.length} />
        </section>

        <AssessmentSection
          title="Needs review"
          subtitle="Assessments ready for admin validation before client publication."
          assessments={inReviewAssessments}
          organizations={organizations}
          priority
        />

        <AssessmentSection
          title="Draft"
          subtitle="Assessments still being prepared or not yet ready for final review."
          assessments={draftAssessments}
          organizations={organizations}
        />

        <AssessmentSection
          title="Published"
          subtitle="Assessments already released to clients."
          assessments={publishedAssessments}
          organizations={organizations}
        />

        <AssessmentSection
          title="Archived"
          subtitle="Historical assessments no longer active."
          assessments={archivedAssessments}
          organizations={organizations}
        />
      </div>
    </>
  )
}
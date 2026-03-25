import type { AssessmentStatus } from './assessment-status'
import type {
  AssessmentFinding,
  FindingSeverity,
  OverallRisk,
} from './assessment-publish-validation'

export type CustomerReportViewModel = {
  id: string
  slug: string
  title: string
  customerName: string
  publishedAt?: string | null
  status: AssessmentStatus
  overallRisk?: OverallRisk | null

  executiveSummary: string

  keyFindings: AssessmentFinding[]
  immediateRecommendations: string[]
  strategicRecommendations: string[]
  whatChanged: string[]

  methodology?: string | null
  scope?: string | null
  limitations?: string | null
}

type RawAssessmentRecord = {
  id: string
  slug?: string | null
  title?: string | null
  status: AssessmentStatus
  publishedAt?: string | null

  executiveSummary?: string | null
  overallRisk?: OverallRisk | null

  keyFindings?: AssessmentFinding[] | null
  immediateRecommendations?: string[] | null
  strategicRecommendations?: string[] | null
  whatChanged?: string[] | null

  methodology?: string | null
  scope?: string | null
  limitations?: string | null

  customer?: {
    name?: string | null
  } | null
}

function normalizeString(value?: string | null, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function normalizeStringArray(value?: string[] | null): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
}

function normalizeFindings(value?: AssessmentFinding[] | null): AssessmentFinding[] {
  if (!Array.isArray(value)) return []

  return value.map((finding, index) => ({
    id: normalizeString(finding.id, `finding-${index + 1}`),
    title: normalizeString(finding.title, 'Untitled finding'),
    severity: (finding.severity || 'medium') as FindingSeverity,
    summary: normalizeString(finding.summary),
    businessImpact: normalizeString(finding.businessImpact) || null,
    affectedArea: normalizeString(finding.affectedArea) || null,
    details: normalizeString(finding.details) || null,
  }))
}

export function mapAssessmentToCustomerReportViewModel(
  assessment: RawAssessmentRecord,
): CustomerReportViewModel {
  const whatChanged = normalizeStringArray(assessment.whatChanged)

  return {
    id: assessment.id,
    slug: normalizeString(assessment.slug),
    title: normalizeString(assessment.title, 'Assessment report'),
    customerName: normalizeString(assessment.customer?.name, 'Client'),
    publishedAt: assessment.publishedAt ?? null,
    status: assessment.status,
    overallRisk: assessment.overallRisk ?? null,
    executiveSummary: normalizeString(assessment.executiveSummary),

    keyFindings: normalizeFindings(assessment.keyFindings),
    immediateRecommendations: normalizeStringArray(assessment.immediateRecommendations),
    strategicRecommendations: normalizeStringArray(assessment.strategicRecommendations),
    whatChanged:
      whatChanged.length > 0 ? whatChanged : ['Initial published version'],

    methodology: normalizeString(assessment.methodology) || null,
    scope: normalizeString(assessment.scope) || null,
    limitations: normalizeString(assessment.limitations) || null,
  }
}
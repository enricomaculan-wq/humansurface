import type { AssessmentStatus } from './assessment-status'

export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical'
export type OverallRisk = 'low' | 'moderate' | 'high' | 'critical'

export type AssessmentFinding = {
  id: string
  title: string
  severity: FindingSeverity
  summary: string
  businessImpact?: string | null
  affectedArea?: string | null
  details?: string | null
}

export type PublishableAssessment = {
  id: string
  customerId?: string | null
  title?: string | null
  slug?: string | null
  status: AssessmentStatus

  executiveSummary?: string | null
  overallRisk?: OverallRisk | null

  keyFindings?: AssessmentFinding[] | null
  immediateRecommendations?: string[] | null
  strategicRecommendations?: string[] | null
  whatChanged?: string[] | null

  methodology?: string | null
  scope?: string | null
  limitations?: string | null

  publishedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type PublishValidationResult = {
  canPublish: boolean
  errors: string[]
  warnings: string[]
}

const PLACEHOLDER_PATTERNS = [
  /\blorem ipsum\b/i,
  /\btodo\b/i,
  /\btbd\b/i,
  /\bplaceholder\b/i,
  /\btest\b/i,
]

function normalizeString(value?: string | null): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeStringArray(value?: string[] | null): string[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function hasPlaceholderContent(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))
}

function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

export function validateAssessmentForPublish(
  assessment: PublishableAssessment,
): PublishValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const title = normalizeString(assessment.title)
  const slug = normalizeString(assessment.slug)
  const executiveSummary = normalizeString(assessment.executiveSummary)

  const keyFindings = Array.isArray(assessment.keyFindings) ? assessment.keyFindings : []
  const immediateRecommendations = normalizeStringArray(assessment.immediateRecommendations)
  const strategicRecommendations = normalizeStringArray(assessment.strategicRecommendations)
  const whatChanged = normalizeStringArray(assessment.whatChanged)

  if (assessment.status !== 'in_review') {
    errors.push('Assessment must be in review before publication.')
  }

  if (!isNonEmptyString(assessment.customerId)) {
    errors.push('Missing customer association.')
  }

  if (!title) {
    errors.push('Missing assessment title.')
  }

  if (!slug) {
    errors.push('Missing report slug.')
  } else if (!isValidSlug(slug)) {
    errors.push('Invalid report slug format.')
  }

  if (!executiveSummary) {
    errors.push('Missing executive summary.')
  }

  if (!assessment.overallRisk) {
    errors.push('Missing overall risk.')
  }

  if (keyFindings.length === 0) {
    errors.push('At least one key finding is required.')
  }

  if (immediateRecommendations.length === 0) {
    errors.push('At least one immediate recommendation is required.')
  }

  if (strategicRecommendations.length === 0) {
    errors.push('At least one strategic recommendation is required.')
  }

  const criticalTextFields = [title, slug, executiveSummary]
  for (const value of criticalTextFields) {
    if (value && hasPlaceholderContent(value)) {
      errors.push('Placeholder content detected in required fields.')
      break
    }
  }

  for (const finding of keyFindings) {
    const findingTitle = normalizeString(finding.title)
    const findingSummary = normalizeString(finding.summary)

    if (!findingTitle) {
      errors.push('A finding is missing its title.')
    }

    if (!findingSummary) {
      errors.push(`Finding "${findingTitle || finding.id}" is missing its summary.`)
    }

    if (!finding.severity) {
      errors.push(`Finding "${findingTitle || finding.id}" is missing severity.`)
    }

    if (findingTitle && hasPlaceholderContent(findingTitle)) {
      errors.push(`Placeholder content detected in finding "${findingTitle}".`)
    }

    if (findingSummary && hasPlaceholderContent(findingSummary)) {
      errors.push(`Placeholder content detected in finding "${findingTitle || finding.id}".`)
    }

    const businessImpact = normalizeString(finding.businessImpact)
    const details = normalizeString(finding.details)

    if (businessImpact && hasPlaceholderContent(businessImpact)) {
      errors.push(`Placeholder content detected in finding "${findingTitle || finding.id}" business impact.`)
    }

    if (details && hasPlaceholderContent(details)) {
      errors.push(`Placeholder content detected in finding "${findingTitle || finding.id}" details.`)
    }
  }

  for (const item of immediateRecommendations) {
    if (hasPlaceholderContent(item)) {
      errors.push('Placeholder content detected in immediate recommendations.')
      break
    }
  }

  for (const item of strategicRecommendations) {
    if (hasPlaceholderContent(item)) {
      errors.push('Placeholder content detected in strategic recommendations.')
      break
    }
  }

  if (keyFindings.length < 3) {
    warnings.push('Fewer than 3 key findings provided.')
  }

  if (whatChanged.length === 0) {
    warnings.push('What changed section is empty.')
  }

  if (!isNonEmptyString(assessment.methodology)) {
    warnings.push('Methodology is missing.')
  }

  if (!isNonEmptyString(assessment.scope)) {
    warnings.push('Scope is missing.')
  }

  if (!isNonEmptyString(assessment.limitations)) {
    warnings.push('Limitations are missing.')
  }

  return {
    canPublish: errors.length === 0,
    errors,
    warnings,
  }
}
import type {
  DarkwebFindingCategory,
  DarkwebScoreSummary,
  DarkwebSeverity,
  DarkwebSeedType,
  JsonRecord,
} from './types'

type ScorableDarkwebFinding = {
  category: DarkwebFindingCategory
  severity: DarkwebSeverity
  confidence: number
  matched_entity_type?: DarkwebSeedType | null
  requires_review?: boolean | null
  metadata?: JsonRecord | null
}

function severityWeight(severity: DarkwebSeverity) {
  if (severity === 'critical') return 42
  if (severity === 'high') return 28
  if (severity === 'medium') return 14
  return 6
}

function categoryWeight(category: DarkwebFindingCategory) {
  switch (category) {
    case 'credential_exposure':
      return 1.55
    case 'fraud_enabling_exposure':
      return 1.35
    case 'sensitive_document_exposure':
      return 1.15
    case 'employee_exposure':
      return 0.95
    case 'brand_domain_mention':
      return 0.45
    case 'technical_exposure_correlation':
    default:
      return 0.6
  }
}

function repetitionMultiplier(category: DarkwebFindingCategory, categoryCount: number) {
  if (category === 'credential_exposure' || category === 'fraud_enabling_exposure') {
    if (categoryCount === 0) return 1
    if (categoryCount === 1) return 0.85
    return 0.65
  }

  if (category === 'brand_domain_mention') {
    if (categoryCount === 0) return 0.75
    if (categoryCount === 1) return 0.35
    return 0.15
  }

  if (categoryCount === 0) return 1
  if (categoryCount === 1) return 0.65
  return 0.4
}

function reviewMultiplier(finding: ScorableDarkwebFinding) {
  if (!finding.requires_review) return 1

  if (
    finding.category === 'credential_exposure' ||
    finding.category === 'fraud_enabling_exposure'
  ) {
    return 0.9
  }

  return 0.7
}

function matchQualityMultiplier(finding: ScorableDarkwebFinding) {
  const strength =
    typeof finding.metadata?.match_strength === 'string'
      ? finding.metadata.match_strength
      : null

  if (strength === 'weak') return 0.55
  if (strength === 'medium') return 0.85
  return 1
}

function riskLevel(score: number) {
  if (score >= 85) return 'critical'
  if (score >= 65) return 'high'
  if (score >= 35) return 'medium'
  return 'low'
}

function normalizeScore(raw: number) {
  const value = 100 * (1 - Math.exp(-raw / 95))
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function calculateDarkwebScore(
  findings: ScorableDarkwebFinding[],
): DarkwebScoreSummary {
  let raw = 0
  const byCategory = new Map<DarkwebFindingCategory, number>()

  for (const finding of findings) {
    const confidence = Math.max(0, Math.min(1, finding.confidence))
    const categoryCount = byCategory.get(finding.category) ?? 0

    raw +=
      severityWeight(finding.severity) *
      categoryWeight(finding.category) *
      Math.max(0.35, confidence) *
      repetitionMultiplier(finding.category, categoryCount) *
      reviewMultiplier(finding) *
      matchQualityMultiplier(finding)

    byCategory.set(finding.category, categoryCount + 1)
  }

  const criticalFindings = findings.filter((finding) => finding.severity === 'critical').length
  const highFindings = findings.filter((finding) => finding.severity === 'high').length
  const credentialFindings = findings.filter(
    (finding) => finding.category === 'credential_exposure',
  ).length
  const fraudRelevantFindings = findings.filter(
    (finding) =>
      finding.category === 'fraud_enabling_exposure' ||
      finding.category === 'credential_exposure' ||
      finding.category === 'employee_exposure',
  ).length

  if (criticalFindings > 0) raw += 12
  if (credentialFindings >= 2) raw += 8
  if (fraudRelevantFindings >= 3) raw += 8

  const score = normalizeScore(raw)

  return {
    score,
    riskLevel: riskLevel(score),
    totalFindings: findings.length,
    criticalFindings,
    highFindings,
    credentialFindings,
    fraudRelevantFindings,
  }
}

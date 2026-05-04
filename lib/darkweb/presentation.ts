import type {
  DarkwebFindingCategory,
  DarkwebRiskLevel,
  DarkwebSeverity,
} from './types'

export type DarkwebPresentationFinding = {
  id: string
  source_type: string
  source_name: string | null
  category: string
  matched_term: string
  matched_entity_type: string
  confidence: number
  severity: string
  title: string
  summary: string | null
  evidence_snippet: string | null
  raw_reference: string | null
  requires_review: boolean
  status: string
  created_at: string
}

export type DarkwebPresentationScoreSnapshot = {
  score: number
  risk_level: string
  total_findings: number
  critical_findings: number
  high_findings: number
  credential_findings: number
  fraud_relevant_findings: number
  created_at: string
}

export type DarkwebBusinessBucket =
  | 'accounts'
  | 'fraud'
  | 'documents'
  | 'people'
  | 'brand'
  | 'technical'

type CategoryPresentation = {
  bucket: DarkwebBusinessBucket
  bucketLabel: string
  categoryLabel: string
  businessMeaning: string
  remediation: string
  findingLead: string
}

export type DarkwebPresentedFinding = DarkwebPresentationFinding & {
  categoryLabel: string
  businessBucket: DarkwebBusinessBucket
  businessBucketLabel: string
  businessMeaning: string
  confidenceLabel: string
  reviewLabel: string
  severityLabel: string
  sourceLabel: string
  remediation: string
  reviewerSummary: string
}

export type DarkwebBusinessGroup = {
  key: DarkwebBusinessBucket
  label: string
  description: string
  remediation: string
  count: number
  reviewCount: number
  highestSeverity: DarkwebSeverity
  findings: DarkwebPresentedFinding[]
}

export type DarkwebPresentationSummary = {
  headline: string
  keyTakeaway: string
  recommendedAction: string
  scoreLabel: string
  scoreMeaning: string
  totalFindings: number
  reviewRequiredCount: number
  criticalOrHighCount: number
  groups: DarkwebBusinessGroup[]
  findings: DarkwebPresentedFinding[]
}

const DEFAULT_SEVERITY: DarkwebSeverity = 'low'

const CATEGORY_PRESENTATION: Record<DarkwebFindingCategory, CategoryPresentation> = {
  credential_exposure: {
    bucket: 'accounts',
    bucketLabel: 'Accounts and credentials',
    categoryLabel: 'Credential exposure',
    businessMeaning:
      'Account material may be exposed and could support unauthorized access or targeted follow-up.',
    remediation:
      'Confirm whether the account is active, rotate credentials, revoke sessions, and check for reuse across business systems.',
    findingLead: 'Potential account exposure involving',
  },
  fraud_enabling_exposure: {
    bucket: 'fraud',
    bucketLabel: 'Fraud and impersonation',
    categoryLabel: 'Fraud-enabling exposure',
    businessMeaning:
      'The signal could help an attacker impersonate the business, target finance workflows, or prepare social engineering.',
    remediation:
      'Review finance and identity controls, warn the relevant internal owner, and verify recent payment or account-change requests.',
    findingLead: 'Fraud-relevant signal involving',
  },
  sensitive_document_exposure: {
    bucket: 'documents',
    bucketLabel: 'Sensitive documents',
    categoryLabel: 'Sensitive document exposure',
    businessMeaning:
      'A business document or document reference may be exposed outside expected control.',
    remediation:
      'Confirm the document owner, remove public access where possible, and rotate any credentials or private links contained in the file.',
    findingLead: 'Sensitive document signal involving',
  },
  employee_exposure: {
    bucket: 'people',
    bucketLabel: 'People and roles',
    categoryLabel: 'Employee-linked exposure',
    businessMeaning:
      'A person, role, or business function appears in a context that may support targeted outreach.',
    remediation:
      'Brief the affected person or function, validate exposed contact details, and apply extra scrutiny to requests using that identity.',
    findingLead: 'Employee-linked signal involving',
  },
  brand_domain_mention: {
    bucket: 'brand',
    bucketLabel: 'Brand and domains',
    categoryLabel: 'Brand or domain mention',
    businessMeaning:
      'The business name or domain appears in dark-web-adjacent context, but this may be a low-context mention.',
    remediation:
      'Review the evidence before action. Escalate only if the mention includes credentials, fraud intent, or sensitive business details.',
    findingLead: 'Brand or domain mention involving',
  },
  technical_exposure_correlation: {
    bucket: 'technical',
    bucketLabel: 'Technical exposure',
    categoryLabel: 'Technical correlation',
    businessMeaning:
      'A technical identifier appears in the collected data and needs context before business impact is clear.',
    remediation:
      'Validate ownership, confirm whether the asset is active, and cross-check against existing exposure findings before escalation.',
    findingLead: 'Technical signal involving',
  },
}

const BUCKET_ORDER: DarkwebBusinessBucket[] = [
  'accounts',
  'fraud',
  'documents',
  'people',
  'brand',
  'technical',
]

const BUCKET_PRIORITY: Record<DarkwebBusinessBucket, number> = {
  accounts: 6,
  fraud: 5,
  documents: 4,
  people: 3,
  brand: 2,
  technical: 1,
}

function normalizeCategory(value: string): DarkwebFindingCategory {
  if (value in CATEGORY_PRESENTATION) return value as DarkwebFindingCategory
  return 'technical_exposure_correlation'
}

function findingContextText(finding: DarkwebPresentationFinding) {
  return [
    finding.title,
    finding.summary,
    finding.evidence_snippet,
    finding.raw_reference,
    finding.source_name,
    finding.source_type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function presentationCategoryForFinding(
  finding: DarkwebPresentationFinding,
): DarkwebFindingCategory {
  const category = normalizeCategory(finding.category)

  if (category !== 'brand_domain_mention') return category

  const context = findingContextText(finding)

  if (
    /\b(fraud|finance|financial|treasury|payment|invoice|wire|bank|escrow|fullz|identity|account takeover|ato|phishing kit|carding)\b/.test(
      context,
    )
  ) {
    return 'fraud_enabling_exposure'
  }

  if (
    /\b(document|passport|contract|payroll|tax|statement|confidential|nda|pdf|spreadsheet)\b/.test(
      context,
    )
  ) {
    return 'sensitive_document_exposure'
  }

  if (/\b(hr|human resources|employee|staff|personnel|recruiting)\b/.test(context)) {
    return 'employee_exposure'
  }

  return category
}

function normalizeSeverity(value: string | null | undefined): DarkwebSeverity {
  if (value === 'critical' || value === 'high' || value === 'medium' || value === 'low') {
    return value
  }

  return DEFAULT_SEVERITY
}

function normalizeRiskLevel(value: string | null | undefined): DarkwebRiskLevel {
  if (value === 'critical' || value === 'high' || value === 'medium' || value === 'low') {
    return value
  }

  return 'low'
}

function severityRank(severity: DarkwebSeverity) {
  if (severity === 'critical') return 4
  if (severity === 'high') return 3
  if (severity === 'medium') return 2
  return 1
}

function formatLabel(value: string | null | undefined) {
  if (!value) return 'Unknown'
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return 'Unknown confidence'
  return `${Math.round(value * 100)}%`
}

function confidenceLabel(confidence: number) {
  const formatted = formatPercent(confidence)

  if (confidence >= 0.85) return `High confidence (${formatted})`
  if (confidence >= 0.65) return `Moderate confidence (${formatted})`
  return `Needs validation (${formatted})`
}

function severityLabel(severity: DarkwebSeverity) {
  if (severity === 'critical') return 'Critical business risk'
  if (severity === 'high') return 'High business risk'
  if (severity === 'medium') return 'Moderate business risk'
  return 'Low business risk'
}

function sourceLabel(finding: DarkwebPresentationFinding) {
  return finding.source_name || formatLabel(finding.source_type)
}

function reviewerSummary(finding: DarkwebPresentationFinding, config: CategoryPresentation) {
  const matchedTerm = finding.matched_term || 'monitored asset'
  return `${config.findingLead} ${matchedTerm}. ${config.businessMeaning}`
}

function presentFinding(finding: DarkwebPresentationFinding): DarkwebPresentedFinding {
  const category = presentationCategoryForFinding(finding)
  const severity = normalizeSeverity(finding.severity)
  const config = CATEGORY_PRESENTATION[category]

  return {
    ...finding,
    categoryLabel: config.categoryLabel,
    businessBucket: config.bucket,
    businessBucketLabel: config.bucketLabel,
    businessMeaning: config.businessMeaning,
    confidenceLabel: confidenceLabel(finding.confidence),
    reviewLabel: finding.requires_review
      ? 'Needs analyst review'
      : 'High-signal match',
    severityLabel: severityLabel(severity),
    sourceLabel: sourceLabel(finding),
    remediation: config.remediation,
    reviewerSummary: reviewerSummary(finding, config),
  }
}

function sortPresentedFindings(findings: DarkwebPresentedFinding[]) {
  return [...findings].sort((a, b) => {
    const severityDelta =
      severityRank(normalizeSeverity(b.severity)) - severityRank(normalizeSeverity(a.severity))
    if (severityDelta !== 0) return severityDelta
    return b.confidence - a.confidence
  })
}

function buildGroups(findings: DarkwebPresentedFinding[]) {
  const byBucket = new Map<DarkwebBusinessBucket, DarkwebPresentedFinding[]>()

  for (const finding of findings) {
    const current = byBucket.get(finding.businessBucket) ?? []
    current.push(finding)
    byBucket.set(finding.businessBucket, current)
  }

  const groups = BUCKET_ORDER.flatMap((bucket): DarkwebBusinessGroup[] => {
    const bucketFindings = sortPresentedFindings(byBucket.get(bucket) ?? [])
    if (bucketFindings.length === 0) return []

    const first = bucketFindings[0]
    const highestSeverity = bucketFindings.reduce<DarkwebSeverity>((highest, finding) => {
      const severity = normalizeSeverity(finding.severity)
      return severityRank(severity) > severityRank(highest) ? severity : highest
    }, DEFAULT_SEVERITY)

    return [
      {
        key: bucket,
        label: first.businessBucketLabel,
        description: first.businessMeaning,
        remediation: first.remediation,
        count: bucketFindings.length,
        reviewCount: bucketFindings.filter((finding) => finding.requires_review).length,
        highestSeverity,
        findings: bucketFindings,
      },
    ]
  })

  return groups.sort((a, b) => {
    const priorityDelta = BUCKET_PRIORITY[b.key] - BUCKET_PRIORITY[a.key]
    if (priorityDelta !== 0) return priorityDelta
    const severityDelta = severityRank(b.highestSeverity) - severityRank(a.highestSeverity)
    if (severityDelta !== 0) return severityDelta
    const countDelta = b.count - a.count
    if (countDelta !== 0) return countDelta
    return BUCKET_ORDER.indexOf(a.key) - BUCKET_ORDER.indexOf(b.key)
  })
}

function scoreLabel(scoreSnapshot?: DarkwebPresentationScoreSnapshot | null) {
  if (!scoreSnapshot) return 'No score snapshot'
  return `${scoreSnapshot.score} / ${formatLabel(scoreSnapshot.risk_level)}`
}

function findingWord(count: number) {
  return `finding${count === 1 ? '' : 's'}`
}

function scoreMeaning(params: {
  scoreSnapshot?: DarkwebPresentationScoreSnapshot | null
  totalFindings: number
  criticalOrHighCount: number
  reviewRequiredCount: number
}) {
  const {
    scoreSnapshot,
    totalFindings,
    criticalOrHighCount,
    reviewRequiredCount,
  } = params

  if (!scoreSnapshot) {
    return totalFindings === 0
      ? 'No dark web score has been generated yet.'
      : 'Findings are present, but no score snapshot is available yet.'
  }

  return `Overall dark web risk is ${formatLabel(scoreSnapshot.risk_level)} (score ${scoreSnapshot.score}) from ${totalFindings} ${findingWord(totalFindings)}. ${criticalOrHighCount} ${findingWord(criticalOrHighCount)} ${criticalOrHighCount === 1 ? 'has' : 'have'} high or critical severity; ${reviewRequiredCount} ${reviewRequiredCount === 1 ? 'requires' : 'require'} analyst review.`
}

function headline(params: {
  scoreSnapshot?: DarkwebPresentationScoreSnapshot | null
  totalFindings: number
  groups: DarkwebBusinessGroup[]
}) {
  const { scoreSnapshot, totalFindings, groups } = params
  const riskLevel = normalizeRiskLevel(scoreSnapshot?.risk_level)

  if (totalFindings === 0) return 'No dark web findings recorded'
  if (riskLevel === 'critical') return 'Critical dark web exposure needs review'
  if (riskLevel === 'high') return 'High dark web exposure needs review'

  const leadingGroup = groups[0]?.label.toLowerCase()
  if (leadingGroup) return `${formatLabel(riskLevel)} dark web signal: ${leadingGroup}`

  return `${formatLabel(riskLevel)} dark web signal`
}

function keyTakeaway(params: {
  scoreSnapshot?: DarkwebPresentationScoreSnapshot | null
  totalFindings: number
  groups: DarkwebBusinessGroup[]
}) {
  const { scoreSnapshot, totalFindings, groups } = params

  if (totalFindings === 0) {
    return scoreSnapshot
      ? 'The latest run did not produce findings that need admin action.'
      : 'Run the pipeline when source data is available to generate an internal dark web summary.'
  }

  const leadingGroups = groups.slice(0, 2).map((group) => group.label.toLowerCase())
  if (leadingGroups.length === 0) {
    return 'Findings are present, but there is not enough categorized detail for a business summary yet.'
  }

  const groupText =
    leadingGroups.length === 1
      ? leadingGroups[0]
      : `${leadingGroups[0]} and ${leadingGroups[1]}`

  return `The strongest signals are in ${groupText}. Treat this as internal review material until each finding is validated.`
}

function recommendedAction(params: {
  totalFindings: number
  reviewRequiredCount: number
  groups: DarkwebBusinessGroup[]
}) {
  const { totalFindings, reviewRequiredCount, groups } = params

  if (totalFindings === 0) return 'No action is needed unless new source data is imported.'

  const primaryRemediation = groups[0]?.remediation
  if (reviewRequiredCount > 0) {
    return `Review ${reviewRequiredCount} finding${reviewRequiredCount === 1 ? '' : 's'} before escalation. ${primaryRemediation ?? ''}`.trim()
  }

  return primaryRemediation ?? 'Confirm the finding owner and document the remediation decision.'
}

export function buildDarkwebPresentationSummary(params: {
  findings: DarkwebPresentationFinding[]
  scoreSnapshot?: DarkwebPresentationScoreSnapshot | null
}): DarkwebPresentationSummary {
  const presentedFindings = sortPresentedFindings(params.findings.map(presentFinding))
  const groups = buildGroups(presentedFindings)
  const totalFindings = params.scoreSnapshot?.total_findings ?? presentedFindings.length
  const rawReviewRequiredCount = presentedFindings.filter(
    (finding) => finding.requires_review,
  ).length
  const reviewRequiredCount = Math.min(rawReviewRequiredCount, totalFindings)
  const criticalOrHighCount =
    params.scoreSnapshot
      ? params.scoreSnapshot.critical_findings + params.scoreSnapshot.high_findings
      : presentedFindings.filter((finding) => {
          const severity = normalizeSeverity(finding.severity)
          return severity === 'critical' || severity === 'high'
        }).length

  return {
    headline: headline({
      scoreSnapshot: params.scoreSnapshot,
      totalFindings,
      groups,
    }),
    keyTakeaway: keyTakeaway({
      scoreSnapshot: params.scoreSnapshot,
      totalFindings,
      groups,
    }),
    recommendedAction: recommendedAction({
      totalFindings,
      reviewRequiredCount,
      groups,
    }),
    scoreLabel: scoreLabel(params.scoreSnapshot),
    scoreMeaning: scoreMeaning({
      scoreSnapshot: params.scoreSnapshot,
      totalFindings,
      criticalOrHighCount,
      reviewRequiredCount,
    }),
    totalFindings,
    reviewRequiredCount,
    criticalOrHighCount,
    groups,
    findings: presentedFindings,
  }
}

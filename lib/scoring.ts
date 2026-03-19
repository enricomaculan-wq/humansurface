import type {
  AssessmentScoreSummary,
  FindingRow,
  PersonScoreSummary,
  RiskLevel,
} from '@/lib/types'

function severityWeight(severity: string) {
  switch (severity) {
    case 'high':
      return 26
    case 'medium':
      return 14
    case 'low':
      return 6
    default:
      return 4
  }
}

function categoryWeights(category: string) {
  switch (category) {
    case 'impersonation':
      return { impersonation: 1.0, finance: 0.65, hr: 0.2 }
    case 'social_engineering_context':
      return { impersonation: 0.35, finance: 0.2, hr: 1.0 }
    case 'email_exposure':
      return { impersonation: 0.7, finance: 0.35, hr: 0.45 }
    case 'role_visibility':
      return { impersonation: 0.75, finance: 0.25, hr: 0.35 }
    case 'org_visibility':
      return { impersonation: 0.45, finance: 0.25, hr: 0.25 }
    default:
      return { impersonation: 0.25, finance: 0.25, hr: 0.25 }
  }
}

function normalizeScore(raw: number, k = 60) {
  const value = 100 * (1 - Math.exp(-raw / k))
  return Math.max(0, Math.min(100, Math.round(value)))
}

function riskLevel(score: number): RiskLevel {
  if (score >= 78) return 'high'
  if (score >= 42) return 'medium'
  return 'low'
}

function groupedByCategory(findings: FindingRow[]) {
  const map = new Map<string, FindingRow[]>()

  for (const finding of findings) {
    const existing = map.get(finding.category) ?? []
    existing.push(finding)
    map.set(finding.category, existing)
  }

  return map
}

function categoryDiminishingMultiplier(index: number) {
  if (index === 0) return 1
  if (index === 1) return 0.7
  if (index === 2) return 0.5
  if (index === 3) return 0.35
  return 0.2
}

function highSeverityBonus(findings: FindingRow[]) {
  const highCount = findings.filter((f) => f.severity === 'high').length
  if (highCount === 0) return 0
  if (highCount === 1) return 6
  if (highCount === 2) return 10
  return 14
}

function repeatedExposurePenaltyCap(raw: number) {
  return Math.min(raw, 160)
}

function computeRawDimensionScores(findings: FindingRow[]) {
  let impersonationRaw = 0
  let financeRaw = 0
  let hrRaw = 0

  const byCategory = groupedByCategory(findings)

  for (const [, categoryFindings] of byCategory.entries()) {
    const sorted = [...categoryFindings].sort((a, b) => {
      const aw = severityWeight(a.severity)
      const bw = severityWeight(b.severity)
      return bw - aw
    })

    sorted.forEach((finding, index) => {
      const base = severityWeight(finding.severity)
      const weights = categoryWeights(finding.category)
      const multiplier = categoryDiminishingMultiplier(index)

      impersonationRaw += base * weights.impersonation * multiplier
      financeRaw += base * weights.finance * multiplier
      hrRaw += base * weights.hr * multiplier
    })
  }

  impersonationRaw += highSeverityBonus(
    findings.filter(
      (f) =>
        f.category === 'impersonation' ||
        f.category === 'role_visibility' ||
        f.category === 'email_exposure',
    ),
  )

  financeRaw += highSeverityBonus(
    findings.filter(
      (f) =>
        f.category === 'impersonation' ||
        f.category === 'email_exposure',
    ),
  )

  hrRaw += highSeverityBonus(
    findings.filter(
      (f) =>
        f.category === 'social_engineering_context' ||
        f.category === 'email_exposure',
    ),
  )

  return {
    impersonationRaw: repeatedExposurePenaltyCap(impersonationRaw),
    financeRaw: repeatedExposurePenaltyCap(financeRaw),
    hrRaw: repeatedExposurePenaltyCap(hrRaw),
  }
}

export function calculateAssessmentScores(findings: FindingRow[]): AssessmentScoreSummary {
  const { impersonationRaw, financeRaw, hrRaw } = computeRawDimensionScores(findings)

  const impersonationScore = normalizeScore(impersonationRaw, 60)
  const financeScore = normalizeScore(financeRaw, 60)
  const hrScore = normalizeScore(hrRaw, 60)

  const overallRaw = (impersonationRaw + financeRaw + hrRaw) / 3
  const overallScore = normalizeScore(overallRaw, 62)

  return {
    impersonationScore,
    impersonationRiskLevel: riskLevel(impersonationScore),
    financeScore,
    financeRiskLevel: riskLevel(financeScore),
    hrScore,
    hrRiskLevel: riskLevel(hrScore),
    overallScore,
    overallRiskLevel: riskLevel(overallScore),
  }
}

export function calculatePersonScores(findings: FindingRow[]): PersonScoreSummary[] {
  const byPerson = new Map<string, FindingRow[]>()

  for (const finding of findings) {
    if (!finding.person_id) continue

    const existing = byPerson.get(finding.person_id) ?? []
    existing.push(finding)
    byPerson.set(finding.person_id, existing)
  }

  return Array.from(byPerson.entries()).map(([personId, personFindings]) => {
    const scoreSummary = calculateAssessmentScores(personFindings)

    const topCategories = Array.from(
      new Set(personFindings.map((f) => f.category)),
    ).slice(0, 3)

    const highCount = personFindings.filter((f) => f.severity === 'high').length
    const mediumCount = personFindings.filter((f) => f.severity === 'medium').length

    return {
      personId,
      overallScore: scoreSummary.overallScore,
      overallRiskLevel: scoreSummary.overallRiskLevel,
      reasonSummary: `Derived from ${personFindings.length} linked finding(s); high: ${highCount}; medium: ${mediumCount}; categories: ${topCategories.join(', ') || 'general'}.`,
    }
  })
}
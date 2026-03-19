import type {
  AssessmentScoreSummary,
  FindingRow,
  PersonScoreSummary,
  RiskLevel,
} from '@/lib/types'

function severityWeight(severity: string) {
  switch (severity) {
    case 'high':
      return 24
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
      return { impersonation: 1.0, finance: 0.7, hr: 0.2 }
    case 'social_engineering_context':
      return { impersonation: 0.3, finance: 0.2, hr: 1.0 }
    case 'email_exposure':
      return { impersonation: 0.8, finance: 0.4, hr: 0.5 }
    case 'role_visibility':
      return { impersonation: 0.9, finance: 0.3, hr: 0.4 }
    case 'org_visibility':
      return { impersonation: 0.5, finance: 0.3, hr: 0.3 }
    default:
      return { impersonation: 0.3, finance: 0.3, hr: 0.3 }
  }
}

function clamp100(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function riskLevel(score: number): RiskLevel {
  if (score >= 70) return 'high'
  if (score >= 35) return 'medium'
  return 'low'
}

export function calculateAssessmentScores(findings: FindingRow[]): AssessmentScoreSummary {
  let impersonationRaw = 0
  let financeRaw = 0
  let hrRaw = 0

  for (const finding of findings) {
    const base = severityWeight(finding.severity)
    const weights = categoryWeights(finding.category)

    impersonationRaw += base * weights.impersonation
    financeRaw += base * weights.finance
    hrRaw += base * weights.hr
  }

  const impersonationScore = clamp100(impersonationRaw)
  const financeScore = clamp100(financeRaw)
  const hrScore = clamp100(hrRaw)
  const overallScore = clamp100((impersonationScore + financeScore + hrScore) / 3)

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
    const topCategories = Array.from(new Set(personFindings.map((f) => f.category))).slice(0, 3)
    const topSeverities = Array.from(new Set(personFindings.map((f) => f.severity)))

    return {
      personId,
      overallScore: scoreSummary.overallScore,
      overallRiskLevel: scoreSummary.overallRiskLevel,
      reasonSummary: `Derived from ${personFindings.length} linked finding(s); categories: ${topCategories.join(', ') || 'general'}; severities: ${topSeverities.join(', ') || 'n/a'}.`,
    }
  })
}
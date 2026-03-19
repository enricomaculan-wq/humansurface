export type RiskLevel = 'low' | 'medium' | 'high'
export type SourceType = 'html' | 'pdf' | 'fallback'

export type FindingCategory =
  | 'general'
  | 'email_exposure'
  | 'org_visibility'
  | 'role_visibility'
  | 'social_engineering_context'
  | 'impersonation'

export type AssessmentRow = {
  id: string
  organization_id: string
  status: string
  overall_score: number
  overall_risk_level: RiskLevel
  created_at: string
}

export type OrganizationRow = {
  id: string
  name: string
  domain: string
  industry: string | null
}

export type FindingRow = {
  id: string
  person_id: string | null
  title: string
  description: string | null
  severity: RiskLevel | string
  category: FindingCategory | string
}

export type PersonRow = {
  id: string
  organization_id?: string
  email: string | null
  full_name: string | null
  role_title: string
  department?: string | null
  is_key_person?: boolean
}

export type ScoreRow = {
  id?: string
  assessment_id?: string
  person_id: string | null
  score_type?: string
  score_value?: number
  risk_level?: RiskLevel | string
  reason_summary?: string | null
}

export type ScannerPerson = {
  fullName: string | null
  roleTitle: string
  department: string | null
  email: string | null
  isKeyPerson: boolean
}

export type ScannerFinding = {
  title: string
  description: string
  severity: RiskLevel
  category: FindingCategory
  linkedPersonEmail?: string | null
  linkedPersonSignature?: string | null
  sourceUrl: string | null
  sourceTitle: string | null
  sourceType: SourceType
}

export type ExtractedSignal = {
  url: string
  title: string
  text: string
  emails: string[]
  hasLeadershipSignals: boolean
  hasFinanceSignals: boolean
  hasHrSignals: boolean
  hasContactSignals: boolean
  detectedPeople: ScannerPerson[]
}

export type AssessmentScoreSummary = {
  impersonationScore: number
  impersonationRiskLevel: RiskLevel
  financeScore: number
  financeRiskLevel: RiskLevel
  hrScore: number
  hrRiskLevel: RiskLevel
  overallScore: number
  overallRiskLevel: RiskLevel
}

export type PersonScoreSummary = {
  personId: string
  overallScore: number
  overallRiskLevel: RiskLevel
  reasonSummary: string
}

export type ClassifiedSignals = {
  findings: ScannerFinding[]
  people: ScannerPerson[]
  summary: {
    publicEmailCount: number
    scannedPages: number
    detectedPeople: number
    detectedFindings: number
  }
}
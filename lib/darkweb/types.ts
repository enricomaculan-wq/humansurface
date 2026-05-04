export type JsonRecord = Record<string, unknown>

export type DarkwebRiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type DarkwebSeverity = DarkwebRiskLevel

export type DarkwebSearchRunStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'canceled'

export type DarkwebSearchRunTrigger = 'manual' | 'assessment' | 'system'

export type DarkwebSeedType =
  | 'domain'
  | 'email'
  | 'email_pattern'
  | 'person'
  | 'key_role'
  | 'brand'
  | 'subdomain'
  | 'document_name'
  | 'distinctive_string'
  | 'username'
  | 'phone'

export type DarkwebSeedSource =
  | 'assessment'
  | 'monitored_asset'
  | 'manual'
  | 'system'

export type DarkwebFindingCategory =
  | 'credential_exposure'
  | 'brand_domain_mention'
  | 'employee_exposure'
  | 'sensitive_document_exposure'
  | 'technical_exposure_correlation'
  | 'fraud_enabling_exposure'

export type DarkwebFindingStatus =
  | 'new'
  | 'reviewed'
  | 'suppressed'
  | 'resolved'

export type DarkwebRawResultStatus =
  | 'new'
  | 'normalized'
  | 'matched'
  | 'ignored'
  | 'failed'

export type DarkwebSeedInput = {
  seedType: DarkwebSeedType
  term: string
  normalizedTerm?: string
  source: DarkwebSeedSource
  confidence?: number
  metadata?: JsonRecord
}

export type DarkwebRawResultInput = {
  seedId?: string | null
  sourceType: string
  sourceName?: string | null
  rawReference?: string | null
  rawPayload?: JsonRecord
  normalizedText?: string | null
  rawHash?: string | null
  status?: DarkwebRawResultStatus
  errorMessage?: string | null
  observedAt?: string | null
}

export type DarkwebFindingInput = {
  rawResultId?: string | null
  findingId?: string | null
  fingerprint?: string | null
  sourceType: string
  sourceName?: string | null
  category: DarkwebFindingCategory
  matchedTerm: string
  matchedEntityType: DarkwebSeedType
  confidence: number
  severity: DarkwebSeverity
  title: string
  summary?: string | null
  evidenceSnippet?: string | null
  rawReference?: string | null
  requiresReview?: boolean
  status?: DarkwebFindingStatus
  metadata?: JsonRecord
}

export type DarkwebSearchRunRecord = {
  id: string
  assessment_id: string | null
  organization_id: string
  status: DarkwebSearchRunStatus
  trigger_source: DarkwebSearchRunTrigger
  started_at: string | null
  completed_at: string | null
  error_message: string | null
  metadata: JsonRecord
  created_at: string
  updated_at: string
}

export type DarkwebSeedRecord = {
  id: string
  run_id: string | null
  assessment_id: string | null
  organization_id: string
  seed_type: DarkwebSeedType
  term: string
  normalized_term: string
  source: DarkwebSeedSource
  confidence: number
  metadata: JsonRecord
  created_at: string
  updated_at: string
}

export type DarkwebRawResultRecord = {
  id: string
  run_id: string | null
  seed_id: string | null
  assessment_id: string | null
  organization_id: string
  source_type: string
  source_name: string | null
  raw_reference: string | null
  raw_payload: JsonRecord
  normalized_text: string | null
  raw_hash: string | null
  status: DarkwebRawResultStatus
  error_message: string | null
  observed_at: string | null
  collected_at: string
  created_at: string
  updated_at: string
}

export type DarkwebFindingRecord = {
  id: string
  run_id: string | null
  raw_result_id: string | null
  finding_id: string | null
  fingerprint: string | null
  assessment_id: string | null
  organization_id: string
  source_type: string
  source_name: string | null
  category: DarkwebFindingCategory
  matched_term: string
  matched_entity_type: DarkwebSeedType
  confidence: number
  severity: DarkwebSeverity
  title: string
  summary: string | null
  evidence_snippet: string | null
  raw_reference: string | null
  requires_review: boolean
  status: DarkwebFindingStatus
  metadata: JsonRecord
  created_at: string
  updated_at: string
}

export type DarkwebScoreSummary = {
  score: number
  riskLevel: DarkwebRiskLevel
  totalFindings: number
  criticalFindings: number
  highFindings: number
  credentialFindings: number
  fraudRelevantFindings: number
}

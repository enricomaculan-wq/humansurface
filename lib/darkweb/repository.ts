import { supabaseAdmin } from '@/lib/supabase-admin'
import { normalizeDarkwebTerm } from './normalize'
import type {
  DarkwebFindingInput,
  DarkwebFindingRecord,
  DarkwebRawResultInput,
  DarkwebRawResultRecord,
  DarkwebScoreSummary,
  DarkwebSearchRunRecord,
  DarkwebSearchRunStatus,
  DarkwebSearchRunTrigger,
  DarkwebSeedInput,
  DarkwebSeedRecord,
  JsonRecord,
} from './types'

type MonitoredAssetSeedRecord = {
  id: string
  asset_type: string
  value: string
  normalized_value: string
  display_name: string | null
  criticality: string
  is_active: boolean
  is_primary: boolean | null
  metadata: JsonRecord | null
  tags: unknown
}

type SupabaseErrorLike = {
  code?: unknown
  message?: unknown
  details?: unknown
  hint?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message

  if (!isRecord(error)) return fallback

  const supabaseError = error as SupabaseErrorLike
  const message =
    typeof supabaseError.message === 'string' ? supabaseError.message : null
  const code = typeof supabaseError.code === 'string' ? supabaseError.code : null
  const details =
    typeof supabaseError.details === 'string' ? supabaseError.details : null
  const hint = typeof supabaseError.hint === 'string' ? supabaseError.hint : null

  return [
    fallback,
    message,
    code ? `code ${code}` : null,
    details ? `details: ${details}` : null,
    hint ? `hint: ${hint}` : null,
  ]
    .filter(Boolean)
    .join(' - ')
}

function metadataOrEmpty(metadata: JsonRecord | null | undefined) {
  return metadata ?? {}
}

export async function createDarkwebSearchRun(params: {
  organizationId: string
  assessmentId?: string | null
  triggerSource?: DarkwebSearchRunTrigger
  metadata?: JsonRecord
}) {
  const { data, error } = await supabaseAdmin
    .from('darkweb_search_runs')
    .insert({
      organization_id: params.organizationId,
      assessment_id: params.assessmentId ?? null,
      trigger_source: params.triggerSource ?? 'manual',
      status: 'queued',
      metadata: metadataOrEmpty(params.metadata),
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(toErrorMessage(error, 'Unable to create dark web search run.'))
  }

  return data as DarkwebSearchRunRecord
}

export async function updateDarkwebSearchRunStatus(params: {
  runId: string
  status: DarkwebSearchRunStatus
  errorMessage?: string | null
  metadata?: JsonRecord
}) {
  const now = new Date().toISOString()
  const patch: JsonRecord = {
    status: params.status,
    error_message: params.errorMessage ?? null,
  }

  if (params.status === 'running') {
    patch.started_at = now
  }

  if (
    params.status === 'completed' ||
    params.status === 'failed' ||
    params.status === 'canceled'
  ) {
    patch.completed_at = now
  }

  if (params.metadata) {
    patch.metadata = params.metadata
  }

  const { data, error } = await supabaseAdmin
    .from('darkweb_search_runs')
    .update(patch)
    .eq('id', params.runId)
    .select('*')
    .single()

  if (error) {
    throw new Error(toErrorMessage(error, 'Unable to update dark web search run.'))
  }

  return data as DarkwebSearchRunRecord
}

export async function listMonitoredAssetsForDarkwebSeeds(organizationId: string) {
  const { data, error } = await supabaseAdmin
    .from('monitored_assets')
    .select(`
      id,
      asset_type,
      value,
      normalized_value,
      display_name,
      criticality,
      is_active,
      is_primary,
      metadata,
      tags
    `)
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('criticality', { ascending: true })

  if (error) {
    throw new Error(toErrorMessage(error, 'Unable to load monitored assets.'))
  }

  return (data ?? []) as MonitoredAssetSeedRecord[]
}

export async function listDarkwebSeedsForRun(runId: string) {
  const { data, error } = await supabaseAdmin
    .from('darkweb_seeds')
    .select('*')
    .eq('run_id', runId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(toErrorMessage(error, 'Unable to load dark web seeds.'))
  }

  return (data ?? []) as DarkwebSeedRecord[]
}

export async function persistDarkwebSeeds(params: {
  runId?: string | null
  organizationId: string
  assessmentId?: string | null
  seeds: DarkwebSeedInput[]
}) {
  if (params.seeds.length === 0) return []

  const rows = params.seeds
    .map((seed) => {
      const normalizedTerm =
        seed.normalizedTerm ?? normalizeDarkwebTerm(seed.seedType, seed.term)

      if (!normalizedTerm) return null

      return {
        run_id: params.runId ?? null,
        assessment_id: params.assessmentId ?? null,
        organization_id: params.organizationId,
        seed_type: seed.seedType,
        term: seed.term,
        normalized_term: normalizedTerm,
        source: seed.source,
        confidence: seed.confidence ?? 0.7,
        metadata: metadataOrEmpty(seed.metadata),
      }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  if (rows.length === 0) return []

  const { data, error } = await supabaseAdmin
    .from('darkweb_seeds')
    .insert(rows)
    .select('*')

  if (error) {
    throw new Error(toErrorMessage(error, 'Unable to persist dark web seeds.'))
  }

  return (data ?? []) as DarkwebSeedRecord[]
}

export async function persistDarkwebRawResults(params: {
  runId?: string | null
  organizationId: string
  assessmentId?: string | null
  results: DarkwebRawResultInput[]
}) {
  if (params.results.length === 0) return []

  const persisted: DarkwebRawResultRecord[] = []

  for (const result of params.results) {
    const row = {
      run_id: params.runId ?? null,
      seed_id: result.seedId ?? null,
      assessment_id: params.assessmentId ?? null,
      organization_id: params.organizationId,
      source_type: result.sourceType,
      source_name: result.sourceName ?? null,
      raw_reference: result.rawReference ?? null,
      raw_payload: result.rawPayload ?? {},
      normalized_text: result.normalizedText ?? null,
      raw_hash: result.rawHash ?? null,
      status: result.status ?? 'new',
      error_message: result.errorMessage ?? null,
      observed_at: result.observedAt ?? null,
    }

    const { data, error } = await supabaseAdmin
      .from('darkweb_raw_results')
      .insert(row)
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505' && result.rawHash) {
        const { data: existing, error: existingError } = await supabaseAdmin
          .from('darkweb_raw_results')
          .select('*')
          .eq('organization_id', params.organizationId)
          .eq('raw_hash', result.rawHash)
          .maybeSingle()

        if (existingError) {
          throw new Error(
            toErrorMessage(existingError, 'Unable to load duplicate dark web raw result.'),
          )
        }

        if (existing) {
          persisted.push(existing as DarkwebRawResultRecord)
          continue
        }
      }

      throw new Error(toErrorMessage(error, 'Unable to persist dark web raw results.'))
    }

    persisted.push(data as DarkwebRawResultRecord)
  }

  return persisted
}

export async function listDarkwebRawResultsForRun(runId: string) {
  const { data, error } = await supabaseAdmin
    .from('darkweb_raw_results')
    .select('*')
    .eq('run_id', runId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(toErrorMessage(error, 'Unable to load dark web raw results.'))
  }

  return (data ?? []) as DarkwebRawResultRecord[]
}

export async function updateDarkwebRawResultStatus(params: {
  rawResultId: string
  status: DarkwebRawResultRecord['status']
  errorMessage?: string | null
}) {
  const { error } = await supabaseAdmin
    .from('darkweb_raw_results')
    .update({
      status: params.status,
      error_message: params.errorMessage ?? null,
    })
    .eq('id', params.rawResultId)

  if (error) {
    throw new Error(toErrorMessage(error, 'Unable to update dark web raw result.'))
  }
}

export async function persistDarkwebFindings(params: {
  runId?: string | null
  organizationId: string
  assessmentId?: string | null
  findings: DarkwebFindingInput[]
}) {
  if (params.findings.length === 0) return []

  const persisted: DarkwebFindingRecord[] = []

  for (const finding of params.findings) {
    const row = {
      run_id: params.runId ?? null,
      raw_result_id: finding.rawResultId ?? null,
      finding_id: finding.findingId ?? null,
      fingerprint: finding.fingerprint ?? null,
      assessment_id: params.assessmentId ?? null,
      organization_id: params.organizationId,
      source_type: finding.sourceType,
      source_name: finding.sourceName ?? null,
      category: finding.category,
      matched_term: finding.matchedTerm,
      matched_entity_type: finding.matchedEntityType,
      confidence: finding.confidence,
      severity: finding.severity,
      title: finding.title,
      summary: finding.summary ?? null,
      evidence_snippet: finding.evidenceSnippet ?? null,
      raw_reference: finding.rawReference ?? null,
      requires_review: finding.requiresReview ?? true,
      status: finding.status ?? 'new',
      metadata: metadataOrEmpty(finding.metadata),
    }

    if (finding.fingerprint) {
      const { data: existing, error: existingError } = await supabaseAdmin
        .from('darkweb_findings')
        .select('*')
        .eq('organization_id', params.organizationId)
        .eq('fingerprint', finding.fingerprint)
        .maybeSingle()

      if (existingError) {
        throw new Error(
          toErrorMessage(existingError, 'Unable to load duplicate dark web finding.'),
        )
      }

      if (existing?.id) {
        const { data, error } = await supabaseAdmin
          .from('darkweb_findings')
          .update(row)
          .eq('id', existing.id)
          .select('*')
          .single()

        if (error) {
          throw new Error(toErrorMessage(error, 'Unable to update dark web finding.'))
        }

        persisted.push(data as DarkwebFindingRecord)
        continue
      }
    }

    const { data, error } = await supabaseAdmin
      .from('darkweb_findings')
      .insert(row)
      .select('*')
      .single()

    if (error) {
      throw new Error(toErrorMessage(error, 'Unable to persist dark web finding.'))
    }

    persisted.push(data as DarkwebFindingRecord)
  }

  return persisted
}

export async function persistDarkwebScoreSnapshot(params: {
  runId?: string | null
  organizationId: string
  assessmentId?: string | null
  summary: DarkwebScoreSummary
  metadata?: JsonRecord
}) {
  const { error } = await supabaseAdmin
    .from('darkweb_score_snapshots')
    .insert({
      run_id: params.runId ?? null,
      assessment_id: params.assessmentId ?? null,
      organization_id: params.organizationId,
      score: params.summary.score,
      risk_level: params.summary.riskLevel,
      total_findings: params.summary.totalFindings,
      critical_findings: params.summary.criticalFindings,
      high_findings: params.summary.highFindings,
      credential_findings: params.summary.credentialFindings,
      fraud_relevant_findings: params.summary.fraudRelevantFindings,
      metadata: metadataOrEmpty(params.metadata),
    })

  if (error) {
    throw new Error(toErrorMessage(error, 'Unable to persist dark web score snapshot.'))
  }
}

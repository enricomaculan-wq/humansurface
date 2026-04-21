import { supabaseAdmin } from '@/lib/supabase-admin'

type RawPayload = Record<string, unknown>

type MatchCandidate = {
  asset_type: string
  value: string
  reason: string
}

type MatchedAsset = {
  id: string
  organization_id: string
  asset_type: string
  normalized_value: string
  display_name: string | null
  criticality: string
  is_active: boolean
}

type RawEventRow = {
  id: string
  organization_id: string | null
  source_type: string
  source_name: string | null
  event_type: string
  external_id: string | null
  title: string
  raw_payload: RawPayload | null
  normalized_text: string | null
  observed_at: string | null
  collected_at: string | null
  processing_status: string | null
  matched_asset_count: number | null
  processing_error: string | null
  processed_at: string | null
}

type ProcessResult = {
  matched: boolean
  findingId?: string
}

function normalizeValue(assetType: string, value: string) {
  const trimmed = value.trim()

  if (['email', 'domain', 'brand', 'username'].includes(assetType)) {
    return trimmed.toLowerCase()
  }

  if (assetType === 'phone') {
    return trimmed.replace(/\s+/g, '')
  }

  return trimmed
}

function extractDomainFromEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  if (!normalized.includes('@')) return null
  const parts = normalized.split('@')
  return parts[1] || null
}

function normalizeLooseText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9@.\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildSearchText(rawEvent: {
  title: string
  source_name: string | null
  source_type: string
  raw_payload: RawPayload
  normalized_text: string | null
}) {
  const payload = rawEvent.raw_payload ?? {}

  const parts = [
    rawEvent.title,
    rawEvent.source_name ?? '',
    rawEvent.source_type,
    rawEvent.normalized_text ?? '',
    typeof payload.email === 'string' ? payload.email : '',
    typeof payload.domain === 'string' ? payload.domain : '',
    typeof payload.brand === 'string' ? payload.brand : '',
    typeof payload.username === 'string' ? payload.username : '',
    typeof payload.snippet === 'string' ? payload.snippet : '',
    typeof payload.url === 'string' ? payload.url : '',
  ]

  return normalizeLooseText(parts.filter(Boolean).join(' '))
}

function extractCandidates(payload: RawPayload): MatchCandidate[] {
  const candidates: MatchCandidate[] = []

  const email = typeof payload.email === 'string' ? payload.email : null
  const domain = typeof payload.domain === 'string' ? payload.domain : null
  const brand = typeof payload.brand === 'string' ? payload.brand : null
  const username = typeof payload.username === 'string' ? payload.username : null

  if (email) {
    const normalizedEmail = normalizeValue('email', email)
    candidates.push({
      asset_type: 'email',
      value: normalizedEmail,
      reason: 'payload.email',
    })

    const derivedDomain = extractDomainFromEmail(normalizedEmail)
    if (derivedDomain) {
      candidates.push({
        asset_type: 'domain',
        value: normalizeValue('domain', derivedDomain),
        reason: 'derived_from_email',
      })
    }
  }

  if (domain) {
    candidates.push({
      asset_type: 'domain',
      value: normalizeValue('domain', domain),
      reason: 'payload.domain',
    })
  }

  if (brand) {
    candidates.push({
      asset_type: 'brand',
      value: normalizeValue('brand', brand),
      reason: 'payload.brand',
    })
  }

  if (username) {
    candidates.push({
      asset_type: 'username',
      value: normalizeValue('username', username),
      reason: 'payload.username',
    })
  }

  const deduped = new Map<string, MatchCandidate>()
  for (const candidate of candidates) {
    deduped.set(`${candidate.asset_type}:${candidate.value}`, candidate)
  }

  return [...deduped.values()]
}

function mapEventTypeToCategory(eventType: string) {
  if (eventType === 'credential_exposure') return 'credential_exposure'
  if (eventType === 'stealer_detected') return 'stealer_log'
  if (eventType === 'brand_mention') return 'brand_mention'
  if (eventType === 'pii_exposure') return 'pii_exposure'
  return 'access_mention'
}

function computeSeverity(eventType: string, criticalities: string[]) {
  const hasCritical = criticalities.includes('critical')
  const hasHigh = criticalities.includes('high')

  if (eventType === 'stealer_detected' && hasCritical) return 'critical'
  if (eventType === 'credential_exposure' && hasCritical) return 'critical'
  if (eventType === 'credential_exposure' && hasHigh) return 'high'
  if (hasCritical || hasHigh) return 'high'
  return 'medium'
}

function computeConfidence(payload: RawPayload, matchedAssetsCount: number) {
  if (typeof payload.confidence === 'number') return payload.confidence
  if (matchedAssetsCount >= 2) return 0.9
  return 0.8
}

function brandTextVariants(value: string) {
  const normalized = normalizeLooseText(value)
  const compact = normalized.replace(/\s+/g, '')
  const dashed = normalized.replace(/\s+/g, '-')
  return Array.from(new Set([normalized, compact, dashed])).filter(Boolean)
}

function uniqueAssets(assets: MatchedAsset[]) {
  const map = new Map<string, MatchedAsset>()
  for (const asset of assets) {
    map.set(asset.id, asset)
  }
  return [...map.values()]
}

function ensureSingleOrganization(assets: MatchedAsset[]) {
  const organizationIds = Array.from(new Set(assets.map((asset) => asset.organization_id)))
  if (organizationIds.length > 1) {
    throw new Error('Matched assets belong to multiple organizations.')
  }
  return organizationIds[0] ?? null
}

function buildDedupeKey(rawEvent: RawEventRow, assets: MatchedAsset[]) {
  return `${rawEvent.event_type}:${rawEvent.title}:${assets
    .map((a) => a.id)
    .sort()
    .join(',')}`
}

async function markRawEventState(
  rawEventId: string,
  patch: {
    organization_id?: string
    processing_status: 'processed' | 'failed' | 'no_match'
    matched_asset_count?: number
    processing_error?: string | null
    processed_at?: string
  }
) {
  const { error } = await supabaseAdmin
    .from('darkweb_raw_events')
    .update({
      ...patch,
      processed_at: patch.processed_at ?? new Date().toISOString(),
    })
    .eq('id', rawEventId)

  if (error) {
    throw error
  }
}

async function findExactMatchedAssets(
  organizationId: string | null,
  candidates: MatchCandidate[]
) {
  const values = candidates.map((c) => c.value)
  if (values.length === 0) return []

  let query = supabaseAdmin
    .from('monitored_assets')
    .select(`
      id,
      organization_id,
      asset_type,
      normalized_value,
      display_name,
      criticality,
      is_active
    `)
    .in('normalized_value', values)
    .eq('is_active', true)

  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as MatchedAsset[]
}

async function findFuzzyBrandAssets(
  organizationId: string | null,
  searchText: string
) {
  let query = supabaseAdmin
    .from('monitored_assets')
    .select(`
      id,
      organization_id,
      asset_type,
      normalized_value,
      display_name,
      criticality,
      is_active
    `)
    .eq('asset_type', 'brand')
    .eq('is_active', true)

  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }

  const { data, error } = await query
  if (error) throw error

  const assets = (data ?? []) as MatchedAsset[]

  return assets.filter((asset) => {
    const variants = brandTextVariants(asset.normalized_value)
    return variants.some((variant) => searchText.includes(variant))
  })
}

async function ensureRemediationTasks(params: {
  assessmentId: string
  category: string
  severity: string
}) {
  const taskTemplates: Array<{
    title: string
    priority: string
    effort: string
    impact: string
    status: string
  }> = []

  if (params.category === 'credential_exposure') {
    taskTemplates.push({
      title: 'Reset exposed credentials for affected accounts',
      priority: params.severity === 'critical' ? 'critical' : 'high',
      effort: 'medium',
      impact: 'high',
      status: 'open',
    })
    taskTemplates.push({
      title: 'Review MFA and active sessions for exposed identities',
      priority: 'high',
      effort: 'low',
      impact: 'high',
      status: 'open',
    })
  }

  if (params.category === 'stealer_log') {
    taskTemplates.push({
      title: 'Investigate stealer-related compromise indicators',
      priority: params.severity === 'critical' ? 'critical' : 'high',
      effort: 'medium',
      impact: 'high',
      status: 'open',
    })
  }

  if (params.category === 'brand_mention') {
    taskTemplates.push({
      title: 'Review suspicious brand mention for phishing or impersonation',
      priority: 'medium',
      effort: 'low',
      impact: 'medium',
      status: 'open',
    })
  }

  for (const task of taskTemplates) {
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('remediation_tasks')
      .select('id')
      .eq('assessment_id', params.assessmentId)
      .eq('title', task.title)
      .maybeSingle()

    if (existingError) throw existingError
    if (existing?.id) continue

    const { error: insertError } = await supabaseAdmin
      .from('remediation_tasks')
      .insert({
        assessment_id: params.assessmentId,
        title: task.title,
        priority: task.priority,
        effort: task.effort,
        impact: task.impact,
        status: task.status,
      })

    if (insertError) throw insertError
  }
}

async function upsertFindingAndRelations(params: {
  rawEvent: RawEventRow
  payload: RawPayload
  searchText: string
  assets: MatchedAsset[]
  candidates: MatchCandidate[]
  fuzzyBrandAssets: MatchedAsset[]
  organizationId: string
}) {
  const { rawEvent, payload, searchText, assets, candidates, fuzzyBrandAssets, organizationId } =
    params

  const { data: assessment, error: assessmentError } = await supabaseAdmin
    .from('assessments')
    .select('id')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (assessmentError) throw assessmentError
  if (!assessment?.id) {
    throw new Error(`No assessment found for organization ${organizationId}`)
  }

  const category = mapEventTypeToCategory(rawEvent.event_type)
  const severity = computeSeverity(
    rawEvent.event_type,
    assets.map((a) => a.criticality)
  )
  const confidence = computeConfidence(payload, assets.length)
  const dedupeKey = buildDedupeKey(rawEvent, assets)

  const { data: existingFinding, error: existingFindingError } = await supabaseAdmin
    .from('findings')
    .select('id, metadata')
    .eq('assessment_id', assessment.id)
    .eq('module', 'darkweb')
    .contains('metadata', { dedupe_key: dedupeKey })
    .maybeSingle()

  if (existingFindingError) throw existingFindingError

  let findingId: string

  if (existingFinding?.id) {
    findingId = existingFinding.id

    const nextMetadata =
  existingFinding.metadata && typeof existingFinding.metadata === 'object'
    ? {
        ...existingFinding.metadata,
        raw_event_id: rawEvent.id,
        last_raw_event_id: rawEvent.id,
        search_text: searchText,
      }
    : {
        dedupe_key: dedupeKey,
        raw_event_id: rawEvent.id,
        last_raw_event_id: rawEvent.id,
        search_text: searchText,
      }
    const { error: updateFindingError } = await supabaseAdmin
      .from('findings')
      .update({
        last_seen_at: rawEvent.observed_at ?? new Date().toISOString(),
        confidence,
        metadata: nextMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', findingId)

    if (updateFindingError) throw updateFindingError
  } else {
    const { data: finding, error: insertFindingError } = await supabaseAdmin
      .from('findings')
      .insert({
        assessment_id: assessment.id,
        person_id: null,
        module: 'darkweb',
        title: rawEvent.title,
        description: `Matched dark web signal from ${rawEvent.source_name ?? rawEvent.source_type}.`,
        severity,
        category,
        source_type: rawEvent.source_type,
        source_title: rawEvent.source_name,
        source_domain:
          typeof payload.domain === 'string'
            ? payload.domain
            : extractDomainFromEmail(typeof payload.email === 'string' ? payload.email : '') ?? null,
        confidence,
        finding_status: 'new',
        first_seen_at: rawEvent.observed_at ?? new Date().toISOString(),
        last_seen_at: rawEvent.observed_at ?? new Date().toISOString(),
        evidence_redacted:
          typeof payload.snippet === 'string' ? payload.snippet : rawEvent.title,
        metadata: {
          dedupe_key: dedupeKey,
          raw_event_id: rawEvent.id,
          search_text: searchText,
        },
      })
      .select('id')
      .single()

    if (insertFindingError) throw insertFindingError
    if (!finding?.id) throw new Error('Finding insert succeeded but no id returned.')

    findingId = finding.id
  }

  for (const asset of assets) {
    const { error: linkError } = await supabaseAdmin
      .from('finding_assets')
      .upsert(
        {
          finding_id: findingId,
          asset_id: asset.id,
        },
        { onConflict: 'finding_id,asset_id' }
      )

    if (linkError) throw linkError
  }

  const evidenceMatchedFields = [
    ...candidates,
    ...fuzzyBrandAssets.map((asset) => ({
      asset_type: asset.asset_type,
      value: asset.normalized_value,
      reason: 'fuzzy_brand_match',
    })),
  ]

  const { data: existingEvidence, error: existingEvidenceError } = await supabaseAdmin
    .from('finding_evidence')
    .select('id')
    .eq('finding_id', findingId)
    .eq('raw_event_id', rawEvent.id)
    .maybeSingle()

  if (existingEvidenceError) throw existingEvidenceError

  if (!existingEvidence?.id) {
    const { error: evidenceError } = await supabaseAdmin
      .from('finding_evidence')
      .insert({
        finding_id: findingId,
        source_type: rawEvent.source_type,
        source_name: rawEvent.source_name,
        source_reference: rawEvent.external_id,
        snippet_redacted:
          typeof payload.snippet === 'string' ? payload.snippet : rawEvent.title,
        matched_fields: evidenceMatchedFields,
        observed_at: rawEvent.observed_at ?? null,
        collected_at: rawEvent.collected_at,
        confidence,
        sensitivity_level: severity === 'critical' ? 'high' : 'medium',
        raw_event_id: rawEvent.id,
      })

    if (evidenceError) throw evidenceError
  }

  if (severity === 'critical' || severity === 'high') {
    const alertType =
      severity === 'critical' ? 'new_critical_finding' : 'new_high_finding'

    const { data: existingAlert, error: existingAlertError } = await supabaseAdmin
      .from('darkweb_alerts')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('assessment_id', assessment.id)
      .eq('finding_id', findingId)
      .eq('alert_type', alertType)
      .eq('channel', 'dashboard')
      .maybeSingle()

    if (existingAlertError) throw existingAlertError

    if (!existingAlert?.id) {
      const { error: alertError } = await supabaseAdmin
        .from('darkweb_alerts')
        .insert({
          organization_id: organizationId,
          assessment_id: assessment.id,
          finding_id: findingId,
          alert_type: alertType,
          channel: 'dashboard',
          status: 'pending',
          payload: {
            title: rawEvent.title,
            severity,
          },
        })

      if (alertError) throw alertError
    }
  }

  await ensureRemediationTasks({
    assessmentId: assessment.id,
    category,
    severity,
  })

  return {
    findingId,
    assessmentId: assessment.id,
    severity,
  }
}

export async function processDarkwebRawEvent(
  rawEventId: string
): Promise<ProcessResult> {
  try {
    const { data: rawEvent, error: rawError } = await supabaseAdmin
      .from('darkweb_raw_events')
      .select('*')
      .eq('id', rawEventId)
      .single()

    if (rawError) throw rawError
    if (!rawEvent) throw new Error(`Raw event not found: ${rawEventId}`)

    const typedRawEvent = rawEvent as RawEventRow
    const payload = (typedRawEvent.raw_payload ?? {}) as RawPayload
    const searchText = buildSearchText({
      title: typedRawEvent.title,
      source_name: typedRawEvent.source_name,
      source_type: typedRawEvent.source_type,
      raw_payload: payload,
      normalized_text: typedRawEvent.normalized_text,
    })
    const candidates = extractCandidates(payload)

    const exactAssets = await findExactMatchedAssets(
      typedRawEvent.organization_id,
      candidates
    )
    const fuzzyBrandAssets = await findFuzzyBrandAssets(
      typedRawEvent.organization_id,
      searchText
    )
    const assets = uniqueAssets([...exactAssets, ...fuzzyBrandAssets])

    if (assets.length === 0) {
      await markRawEventState(rawEventId, {
        organization_id: typedRawEvent.organization_id ?? undefined,
        processing_status: 'no_match',
        matched_asset_count: 0,
        processing_error: null,
      })

      return { matched: false }
    }

    const organizationId =
      typedRawEvent.organization_id ?? ensureSingleOrganization(assets)

    if (!organizationId) {
      throw new Error('Matched assets found but organization_id is missing.')
    }

    const crossTenantAssets = assets.filter(
      (asset) => asset.organization_id !== organizationId
    )

    if (crossTenantAssets.length > 0) {
      throw new Error('Cross-tenant asset match detected.')
    }

    const result = await upsertFindingAndRelations({
      rawEvent: typedRawEvent,
      payload,
      searchText,
      assets,
      candidates,
      fuzzyBrandAssets,
      organizationId,
    })

    await markRawEventState(rawEventId, {
      organization_id: organizationId,
      processing_status: 'processed',
      matched_asset_count: assets.length,
      processing_error: null,
    })

    return {
      matched: true,
      findingId: result.findingId,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected error while processing raw event.'

    console.error('[darkweb] process failed', rawEventId, error)

    try {
      await markRawEventState(rawEventId, {
        processing_status: 'failed',
        matched_asset_count: 0,
        processing_error: message,
      })
    } catch (updateError) {
      console.error('[darkweb] failed to mark raw event as failed', rawEventId, updateError)
    }

    throw error
  }
}
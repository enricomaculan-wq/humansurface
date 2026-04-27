import { createSupabaseAuthServerClient } from '@/lib/supabase-auth-server'
import { getCurrentDarkwebContext } from '@/lib/darkweb/context'
import { supabaseAdmin } from '@/lib/supabase-admin'

export type DarkWebFindingFilters = {
  severity?: string
  category?: string
  status?: string
  q?: string
  sort?: string
}

function severityRank(value: string | null) {
  if (value === 'critical') return 4
  if (value === 'high') return 3
  if (value === 'medium') return 2
  if (value === 'low') return 1
  return 0
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export async function getDarkWebOverview() {
  const context = await getCurrentDarkwebContext()
  if (!context?.assessment) return null

  const supabase = await createSupabaseAuthServerClient()
  const { assessment, organization } = context

  const { data: snapshot, error: snapshotError } = await supabase
    .from('risk_snapshots')
    .select(`
      assessment_id,
      darkweb_exposure_score,
      public_exposure_score,
      overall_exposure_score,
      total_findings,
      critical_findings,
      high_findings,
      medium_findings,
      low_findings
    `)
    .eq('assessment_id', assessment.id)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (snapshotError) throw snapshotError

  return {
    organization,
    assessment,
    snapshot,
  }
}

export async function getDarkWebFindings() {
  const context = await getCurrentDarkwebContext()
  if (!context?.assessment) return []

  const supabase = await createSupabaseAuthServerClient()

  const { data, error } = await supabase
    .from('findings')
    .select(`
      id,
      assessment_id,
      person_id,
      assigned_person_id,
      title,
      description,
      severity,
      category,
      source_type,
      source_title,
      source_domain,
      confidence,
      finding_status,
      first_seen_at,
      last_seen_at,
      evidence_redacted,
      metadata
    `)
    .eq('assessment_id', context.assessment.id)
    .eq('module', 'darkweb')
    .order('last_seen_at', { ascending: false, nullsFirst: false })

  if (error) throw error
  return data ?? []
}

export async function getDarkWebFindingsFiltered(
  filters: DarkWebFindingFilters = {}
) {
  const context = await getCurrentDarkwebContext()
  if (!context?.assessment) return []

  const supabase = await createSupabaseAuthServerClient()

  let query = supabase
    .from('findings')
    .select(`
      id,
      assessment_id,
      person_id,
      assigned_person_id,
      title,
      description,
      severity,
      category,
      source_type,
      source_title,
      source_domain,
      confidence,
      finding_status,
      first_seen_at,
      last_seen_at,
      evidence_redacted,
      metadata
    `)
    .eq('assessment_id', context.assessment.id)
    .eq('module', 'darkweb')

  if (filters.severity && filters.severity !== 'all') {
    query = query.eq('severity', filters.severity)
  }

  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }

  if (filters.status && filters.status !== 'all') {
    query = query.eq('finding_status', filters.status)
  }

  if (filters.q && filters.q.trim()) {
    const term = filters.q.trim()
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`)
  }

  const sort = filters.sort ?? 'newest'

  if (sort === 'oldest') {
    query = query.order('last_seen_at', { ascending: true, nullsFirst: false })
  } else if (sort === 'highest_confidence') {
    query = query.order('confidence', { ascending: false, nullsFirst: false })
  } else {
    query = query.order('last_seen_at', { ascending: false, nullsFirst: false })
  }

  const { data, error } = await query
  if (error) throw error

  let rows = data ?? []

  if (sort === 'highest_severity') {
    rows = [...rows].sort((a, b) => {
      const severityDiff = severityRank(b.severity) - severityRank(a.severity)
      if (severityDiff !== 0) return severityDiff

      const aTime = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0
      const bTime = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0
      return bTime - aTime
    })
  }

  return rows
}

export async function getDarkWebFindingById(findingId: string) {
  const context = await getCurrentDarkwebContext()
  if (!context?.assessment) return null

  const supabase = await createSupabaseAuthServerClient()

  const { data, error } = await supabase
    .from('findings')
    .select(`
      id,
      assessment_id,
      person_id,
      assigned_person_id,
      title,
      description,
      severity,
      category,
      source_type,
      source_title,
      source_domain,
      confidence,
      finding_status,
      first_seen_at,
      last_seen_at,
      evidence_redacted,
      metadata,
      assigned_person:assigned_person_id (
        id,
        full_name,
        email,
        role_title
      )
    `)
    .eq('id', findingId)
    .eq('assessment_id', context.assessment.id)
    .eq('module', 'darkweb')
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    ...data,
    assigned_person: firstRelation(data.assigned_person),
  }
}

export async function getDarkWebFindingEvidence(findingId: string) {
  const context = await getCurrentDarkwebContext()
  if (!context?.assessment) return []

  const supabase = await createSupabaseAuthServerClient()

  const { data: finding, error: findingError } = await supabase
    .from('findings')
    .select('id')
    .eq('id', findingId)
    .eq('assessment_id', context.assessment.id)
    .eq('module', 'darkweb')
    .maybeSingle()

  if (findingError) throw findingError
  if (!finding) return []

  const { data, error } = await supabase
    .from('finding_evidence')
    .select(`
      id,
      finding_id,
      source_type,
      source_name,
      source_reference,
      snippet_redacted,
      matched_fields,
      observed_at,
      collected_at,
      confidence,
      sensitivity_level,
      raw_event_id
    `)
    .eq('finding_id', findingId)
    .order('observed_at', { ascending: false, nullsFirst: false })

  if (error) throw error
  return data ?? []
}

export async function getDarkWebRemediationTasks() {
  const context = await getCurrentDarkwebContext()
  if (!context?.assessment) return []

  const supabase = await createSupabaseAuthServerClient()

  const { data, error } = await supabase
    .from('remediation_tasks')
    .select(`
      id,
      assessment_id,
      assigned_person_id,
      title,
      priority,
      effort,
      impact,
      status,
      created_at,
      assigned_person:assigned_person_id (
        id,
        full_name,
        email,
        role_title
      )
    `)
    .eq('assessment_id', context.assessment.id)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    ...row,
    assigned_person: firstRelation(row.assigned_person),
  }))
}

export async function getDarkWebAssignablePeople() {
  const context = await getCurrentDarkwebContext()
  if (!context?.organization?.id) return []

  const supabase = await createSupabaseAuthServerClient()

  const { data, error } = await supabase
    .from('people')
    .select(`
      id,
      full_name,
      email,
      role_title,
      is_key_person,
      organization_id
    `)
    .eq('organization_id', context.organization.id)
    .order('is_key_person', { ascending: false })
    .order('full_name', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getDarkWebMonitoredAssets() {
  const context = await getCurrentDarkwebContext()
  if (!context?.organization?.id) return []

  const supabase = await createSupabaseAuthServerClient()

  const { data: assets, error: assetsError } = await supabase
    .from('monitored_assets')
    .select(`
      id,
      organization_id,
      asset_type,
      value,
      normalized_value,
      display_name,
      criticality,
      verification_status,
      is_active,
      is_primary,
      last_checked_at,
      created_at
    `)
    .eq('organization_id', context.organization.id)
    .order('created_at', { ascending: false })

  if (assetsError) throw assetsError

  const assetIds = (assets ?? []).map((a) => a.id)
  const counts = new Map<string, number>()

  if (assetIds.length > 0) {
    const { data: links, error: linksError } = await supabase
      .from('finding_assets')
      .select(`
        asset_id,
        finding_id
      `)
      .in('asset_id', assetIds)

    if (linksError) throw linksError

    for (const row of links ?? []) {
      counts.set(row.asset_id, (counts.get(row.asset_id) ?? 0) + 1)
    }
  }

  return (assets ?? []).map((asset) => ({
    ...asset,
    findings_count: counts.get(asset.id) ?? 0,
  }))
}

export async function getDarkWebMonitoredAssetsFiltered(filters: {
  q?: string
  assetType?: string
  criticality?: string
  sort?: string
}) {
  const assets = await getDarkWebMonitoredAssets()

  const q = filters.q?.trim().toLowerCase() ?? ''
  const assetType = filters.assetType ?? 'all'
  const criticality = filters.criticality ?? 'all'
  const sort = filters.sort ?? 'most_exposed'

  let rows = [...assets]

  if (q) {
    rows = rows.filter((asset) => {
      const left = (asset.display_name ?? '').toLowerCase()
      const right = (asset.value ?? '').toLowerCase()
      return left.includes(q) || right.includes(q)
    })
  }

  if (assetType !== 'all') {
    rows = rows.filter((asset) => asset.asset_type === assetType)
  }

  if (criticality !== 'all') {
    rows = rows.filter((asset) => asset.criticality === criticality)
  }

  if (sort === 'criticality') {
    rows.sort((a, b) => severityRank(b.criticality) - severityRank(a.criticality))
  } else if (sort === 'name_asc') {
    rows.sort((a, b) =>
      (a.display_name ?? a.value ?? '').localeCompare(b.display_name ?? b.value ?? '')
    )
  } else {
    rows.sort((a, b) => {
      if ((b.findings_count ?? 0) !== (a.findings_count ?? 0)) {
        return (b.findings_count ?? 0) - (a.findings_count ?? 0)
      }
      return severityRank(b.criticality) - severityRank(a.criticality)
    })
  }

  return rows
}

export async function getDarkWebTopExposedAssets(limit = 3) {
  const assets = await getDarkWebMonitoredAssets()

  return [...assets]
    .sort((a, b) => {
      if ((b.findings_count ?? 0) !== (a.findings_count ?? 0)) {
        return (b.findings_count ?? 0) - (a.findings_count ?? 0)
      }
      return severityRank(b.criticality) - severityRank(a.criticality)
    })
    .slice(0, limit)
}

export async function getDarkWebAlerts() {
  const context = await getCurrentDarkwebContext()
  if (!context?.organization?.id) return []

  const supabase = await createSupabaseAuthServerClient()

  const { data, error } = await supabase
    .from('darkweb_alerts')
    .select(`
      id,
      organization_id,
      assessment_id,
      finding_id,
      alert_type,
      channel,
      status,
      payload,
      created_at,
      sent_at
    `)
    .eq('organization_id', context.organization.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getDarkWebRawEventsInbox() {
  const context = await getCurrentDarkwebContext()
  if (!context?.organization?.id) return []

  const { data, error } = await supabaseAdmin
    .from('darkweb_raw_events')
    .select(`
      id,
      organization_id,
      source_type,
      source_name,
      event_type,
      external_id,
      title,
      raw_payload,
      normalized_text,
      observed_at,
      collected_at,
      processing_status,
      matched_asset_count,
      processing_error,
      processed_at,
      created_at
    `)
    .or(`organization_id.eq.${context.organization.id},organization_id.is.null`)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function getDarkWebAssignedWork() {
  const context = await getCurrentDarkwebContext()
  if (!context?.organization?.id) {
    return {
      owner: null,
      findings: [],
      tasks: [],
    }
  }

  const supabase = await createSupabaseAuthServerClient()

  const owner =
    context.person ??
    (await getDarkWebAssignablePeople()).find((person) => person.is_key_person) ??
    null

  if (!owner) {
    return {
      owner: null,
      findings: [],
      tasks: [],
    }
  }

  const { data: findings, error: findingsError } = await supabase
    .from('findings')
    .select(`
      id,
      assessment_id,
      assigned_person_id,
      title,
      description,
      severity,
      category,
      source_type,
      finding_status,
      confidence,
      last_seen_at
    `)
    .eq('module', 'darkweb')
    .eq('assessment_id', context.assessment?.id ?? '')
    .eq('assigned_person_id', owner.id)
    .order('last_seen_at', { ascending: false, nullsFirst: false })

  if (findingsError) throw findingsError

  const { data: tasks, error: tasksError } = await supabase
    .from('remediation_tasks')
    .select(`
      id,
      assessment_id,
      assigned_person_id,
      title,
      priority,
      effort,
      impact,
      status,
      created_at
    `)
    .eq('assessment_id', context.assessment?.id ?? '')
    .eq('assigned_person_id', owner.id)
    .order('created_at', { ascending: false })

  if (tasksError) throw tasksError

  return {
    owner,
    findings: findings ?? [],
    tasks: tasks ?? [],
  }
}

export async function getDarkWebMetrics() {
  const context = await getCurrentDarkwebContext()
  if (!context?.organization?.id || !context.assessment?.id) {
    return {
      totals: {
        totalRawEvents: 0,
        processedEvents: 0,
        pendingEvents: 0,
        failedEvents: 0,
        noMatchEvents: 0,
        matchedEvents: 0,
        totalFindings: 0,
        criticalFindings: 0,
        openFindings: 0,
      },
      rates: {
        processedRate: 0,
        matchRate: 0,
        failedRate: 0,
      },
      findingsByCategory: [],
      findingsBySeverity: [],
      rawEventsByStatus: [],
    }
  }

  const supabase = await createSupabaseAuthServerClient()

  const { data: rawEvents, error: rawEventsError } = await supabase
    .from('darkweb_raw_events')
    .select(`
      id,
      organization_id,
      event_type,
      processing_status,
      matched_asset_count,
      created_at
    `)
    .or(`organization_id.eq.${context.organization.id},organization_id.is.null`)

  if (rawEventsError) throw rawEventsError

  const { data: findings, error: findingsError } = await supabase
    .from('findings')
    .select(`
      id,
      category,
      severity,
      finding_status,
      module,
      assessment_id,
      created_at
    `)
    .eq('module', 'darkweb')
    .eq('assessment_id', context.assessment.id)

  if (findingsError) throw findingsError

  const events = rawEvents ?? []
  const findingRows = findings ?? []

  const totalRawEvents = events.length
  const processedEvents = events.filter((e) => e.processing_status === 'processed').length
  const pendingEvents = events.filter((e) => e.processing_status === 'pending').length
  const failedEvents = events.filter((e) => e.processing_status === 'failed').length
  const noMatchEvents = events.filter((e) => e.processing_status === 'no_match').length
  const matchedEvents = events.filter((e) => (e.matched_asset_count ?? 0) > 0).length

  const processedRate =
    totalRawEvents > 0 ? Math.round((processedEvents / totalRawEvents) * 100) : 0
  const matchRate =
    totalRawEvents > 0 ? Math.round((matchedEvents / totalRawEvents) * 100) : 0
  const failedRate =
    totalRawEvents > 0 ? Math.round((failedEvents / totalRawEvents) * 100) : 0

  const findingsByCategoryMap = new Map<string, number>()
  const findingsBySeverityMap = new Map<string, number>()
  const rawEventsByStatusMap = new Map<string, number>()

  for (const row of findingRows) {
    findingsByCategoryMap.set(
      row.category ?? 'unknown',
      (findingsByCategoryMap.get(row.category ?? 'unknown') ?? 0) + 1
    )

    findingsBySeverityMap.set(
      row.severity ?? 'unknown',
      (findingsBySeverityMap.get(row.severity ?? 'unknown') ?? 0) + 1
    )
  }

  for (const row of events) {
    rawEventsByStatusMap.set(
      row.processing_status ?? 'unknown',
      (rawEventsByStatusMap.get(row.processing_status ?? 'unknown') ?? 0) + 1
    )
  }

  const findingsByCategory = [...findingsByCategoryMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

  const findingsBySeverity = [...findingsBySeverityMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => severityRank(b.label) - severityRank(a.label))

  const rawEventsByStatus = [...rawEventsByStatusMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

  return {
    totals: {
      totalRawEvents,
      processedEvents,
      pendingEvents,
      failedEvents,
      noMatchEvents,
      matchedEvents,
      totalFindings: findingRows.length,
      criticalFindings: findingRows.filter((f) => f.severity === 'critical').length,
      openFindings: findingRows.filter(
        (f) => !['resolved', 'suppressed'].includes(f.finding_status ?? 'new')
      ).length,
    },
    rates: {
      processedRate,
      matchRate,
      failedRate,
    },
    findingsByCategory,
    findingsBySeverity,
    rawEventsByStatus,
  }
}

export async function getDarkWebConnectors() {
  const context = await getCurrentDarkwebContext()
  if (!context?.organization?.id) return []

  const { data, error } = await supabaseAdmin
    .from('darkweb_connectors')
    .select(`
      id,
      organization_id,
      connector_type,
      display_name,
      status,
      config,
      last_run_at,
      last_success_at,
      last_error,
      created_at,
      updated_at
    `)
    .eq('organization_id', context.organization.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getDarkWebConnectorRuns(connectorId?: string) {
  const context = await getCurrentDarkwebContext()
  if (!context?.organization?.id) return []

  let query = supabaseAdmin
    .from('darkweb_connector_runs')
    .select(`
      id,
      connector_id,
      organization_id,
      trigger_type,
      status,
      started_at,
      finished_at,
      emitted_count,
      inserted_count,
      error_message,
      triggered_by_user_id,
      triggered_by_person_id,
      metadata,
      darkweb_connectors (
        id,
        display_name,
        connector_type
      )
    `)
    .eq('organization_id', context.organization.id)
    .order('started_at', { ascending: false })
    .limit(100)

  if (connectorId) {
    query = query.eq('connector_id', connectorId)
  }

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((row) => ({
    ...row,
    connector: firstRelation(row.darkweb_connectors),
  }))
}

export async function getDarkWebConnectorById(connectorId: string) {
  const context = await getCurrentDarkwebContext()
  if (!context?.organization?.id) return null

  const { data, error } = await supabaseAdmin
    .from('darkweb_connectors')
    .select(`
      id,
      organization_id,
      connector_type,
      display_name,
      status,
      config,
      last_run_at,
      last_success_at,
      last_error,
      created_at,
      updated_at
    `)
    .eq('id', connectorId)
    .eq('organization_id', context.organization.id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getDarkWebConnectorStats() {
  const connectors = await getDarkWebConnectors()

  return {
    total: connectors.length,
    active: connectors.filter((c) => c.status === 'active').length,
    paused: connectors.filter((c) => c.status === 'paused').length,
    failing: connectors.filter((c) => !!c.last_error).length,
  }
}

export async function getDarkWebMonitoredAssetById(assetId: string) {
  const context = await getCurrentDarkwebContext()
  if (!context?.organization?.id) return null

  const supabase = await createSupabaseAuthServerClient()

  const { data, error } = await supabase
    .from('monitored_assets')
    .select(`
      id,
      organization_id,
      asset_type,
      value,
      normalized_value,
      display_name,
      criticality,
      verification_status,
      is_active,
      is_primary,
      last_checked_at,
      created_at
    `)
    .eq('id', assetId)
    .eq('organization_id', context.organization.id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getDarkWebFindingsForAsset(assetId: string) {
  const context = await getCurrentDarkwebContext()
  if (!context?.assessment?.id) return []

  const supabase = await createSupabaseAuthServerClient()

  const { data: links, error: linksError } = await supabase
    .from('finding_assets')
    .select('finding_id')
    .eq('asset_id', assetId)

  if (linksError) throw linksError

  const findingIds = (links ?? []).map((row) => row.finding_id)
  if (findingIds.length === 0) return []

  const { data, error } = await supabase
    .from('findings')
    .select(`
      id,
      assessment_id,
      assigned_person_id,
      title,
      description,
      severity,
      category,
      source_type,
      source_title,
      source_domain,
      confidence,
      finding_status,
      first_seen_at,
      last_seen_at,
      evidence_redacted,
      metadata
    `)
    .eq('assessment_id', context.assessment.id)
    .eq('module', 'darkweb')
    .in('id', findingIds)
    .order('last_seen_at', { ascending: false, nullsFirst: false })

  if (error) throw error
  return data ?? []
}

export async function getDarkWebFindingByRawEventId(rawEventId: string) {
  const context = await getCurrentDarkwebContext()
  if (!context?.assessment?.id) return null

  const supabase = await createSupabaseAuthServerClient()

  const { data, error } = await supabase
    .from('findings')
    .select(`
      id,
      assessment_id,
      title,
      severity,
      category,
      source_type,
      finding_status,
      metadata
    `)
    .eq('assessment_id', context.assessment.id)
    .eq('module', 'darkweb')
    .contains('metadata', { raw_event_id: rawEventId })
    .order('last_seen_at', { ascending: false, nullsFirst: false })
    .maybeSingle()

  if (error) throw error
  return data
}
export async function getDarkWebRawEventById(rawEventId: string) {
  const context = await getCurrentDarkwebContext()
  if (!context?.organization?.id) return null

  const { data, error } = await supabaseAdmin
    .from('darkweb_raw_events')
    .select(`
      id,
      organization_id,
      source_type,
      source_name,
      event_type,
      external_id,
      title,
      raw_payload,
      normalized_text,
      observed_at,
      collected_at,
      processing_status,
      matched_asset_count,
      processing_error,
      processed_at,
      created_at
    `)
    .eq('id', rawEventId)
    .or(`organization_id.eq.${context.organization.id},organization_id.is.null`)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}
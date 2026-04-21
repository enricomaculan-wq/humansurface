import { requireCurrentDarkwebContext } from '@/lib/darkweb/context'
import { supabaseAdmin } from '@/lib/supabase-admin'

function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export async function requireOwnedMonitoredAsset(assetId: string) {
  const context = await requireCurrentDarkwebContext()

  const { data, error } = await supabaseAdmin
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
      metadata,
      tags,
      created_at,
      last_checked_at
    `)
    .eq('id', assetId)
    .eq('organization_id', context.organization.id)
    .maybeSingle()

  if (error) {
    throw new Error(toMessage(error, 'Unable to load monitored asset.'))
  }

  if (!data) {
    throw new Error('Monitored asset not found for the current organization.')
  }

  return {
    context,
    asset: data,
  }
}

export async function requireOwnedConnector(connectorId: string) {
  const context = await requireCurrentDarkwebContext()

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

  if (error) {
    throw new Error(toMessage(error, 'Unable to load connector.'))
  }

  if (!data) {
    throw new Error('Connector not found for the current organization.')
  }

  return {
    context,
    connector: data,
  }
}

export async function requireOwnedRawEvent(rawEventId: string) {
  const context = await requireCurrentDarkwebContext()

  const { data: rawEvent, error } = await supabaseAdmin
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
    throw new Error(toMessage(error, 'Unable to load raw event.'))
  }

  if (!rawEvent) {
    throw new Error('Raw event not found for the current organization.')
  }

  return {
    context,
    rawEvent,
  }
}

export async function requireOwnedFinding(findingId: string) {
  const context = await requireCurrentDarkwebContext()

  if (!context.assessment?.id) {
    throw new Error('No assessment found for the current organization.')
  }

  const { data, error } = await supabaseAdmin
    .from('findings')
    .select(`
      id,
      assessment_id,
      person_id,
      assigned_person_id,
      module,
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
    .eq('id', findingId)
    .eq('assessment_id', context.assessment.id)
    .eq('module', 'darkweb')
    .maybeSingle()

  if (error) {
    throw new Error(toMessage(error, 'Unable to load finding.'))
  }

  if (!data) {
    throw new Error('Finding not found for the current organization.')
  }

  return {
    context,
    finding: data,
  }
}

export async function requireAssignablePerson(personId: string) {
  const context = await requireCurrentDarkwebContext()

  const { data, error } = await supabaseAdmin
    .from('people')
    .select(`
      id,
      organization_id,
      full_name,
      email,
      role_title,
      is_key_person
    `)
    .eq('id', personId)
    .eq('organization_id', context.organization.id)
    .maybeSingle()

  if (error) {
    throw new Error(toMessage(error, 'Unable to load person.'))
  }

  if (!data) {
    throw new Error('Person not found for the current organization.')
  }

  return {
    context,
    person: data,
  }
}
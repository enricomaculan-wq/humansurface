'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireCurrentDarkwebContext } from '@/lib/darkweb/context'
import { requireOwnedConnector } from '@/lib/darkweb/ownership'

export type UpdateConnectorFormState = {
  error: string | null
}

function parseTimeoutMs(value: string) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 10000
  return Math.max(1000, Math.min(30000, parsed))
}

function buildConnectorConfig(
  formData: FormData,
  connectorType: string,
  context: Awaited<ReturnType<typeof requireCurrentDarkwebContext>>,
  existingConfig: Record<string, unknown> | null | undefined
) {
  const domain = String(formData.get('domain') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()

  const endpointUrl = String(formData.get('endpoint_url') ?? '').trim()
  const authHeader = String(formData.get('auth_header') ?? '').trim()
  const sourceName = String(formData.get('source_name') ?? '').trim()
  const sourceType = String(formData.get('source_type') ?? '').trim()
  const method = String(formData.get('method') ?? '').trim().toUpperCase()
  const cursorParam = String(formData.get('cursor_param') ?? '').trim()
  const sinceParam = String(formData.get('since_param') ?? '').trim()
  const itemsPath = String(formData.get('items_path') ?? '').trim()
  const nextCursorPath = String(formData.get('next_cursor_path') ?? '').trim()
  const timeoutMsRaw = String(formData.get('timeout_ms') ?? '').trim()

  const csvSourceLabel = String(formData.get('csv_source_label') ?? '').trim()

  const previous =
    existingConfig && typeof existingConfig === 'object' ? existingConfig : {}

  const baseMeta = {
    ...previous,
    updated_by_user_id: context.user.id,
    updated_by_person_id: context.person?.id ?? null,
  }

  if (connectorType === 'manual_seed') {
    const defaultDomain = context.organization.domain || 'humansurface.demo'
    const effectiveDomain = domain || defaultDomain

    return {
      ...baseMeta,
      domain: effectiveDomain,
      email: email || `admin@${effectiveDomain}`,
    }
  }

  if (connectorType === 'http_feed') {
    return {
      ...baseMeta,
      endpoint_url: endpointUrl || null,
      auth_header: authHeader || null,
      source_name: sourceName || 'HTTP Feed',
      source_type: sourceType || 'http_feed',
      method: method === 'POST' ? 'POST' : 'GET',
      cursor_param: cursorParam || 'cursor',
      since_param: sinceParam || 'since',
      items_path: itemsPath || 'items',
      next_cursor_path: nextCursorPath || 'next_cursor',
      timeout_ms: parseTimeoutMs(timeoutMsRaw),
    }
  }

  if (connectorType === 'csv_upload') {
    return {
      ...baseMeta,
      source_label: csvSourceLabel || 'CSV Upload',
    }
  }

  return baseMeta
}

export async function updateConnectorAction(
  connectorId: string,
  _prevState: UpdateConnectorFormState,
  formData: FormData
): Promise<UpdateConnectorFormState> {
  try {
    const context = await requireCurrentDarkwebContext()
    const { connector } = await requireOwnedConnector(connectorId)

    const displayName = String(formData.get('display_name') ?? '').trim()
    const connectorType = String(formData.get('connector_type') ?? '').trim()
    const status = String(formData.get('status') ?? 'active').trim()

    const allowedTypes = ['manual_seed', 'http_feed', 'csv_upload']
    const allowedStatuses = ['active', 'paused']

    if (!displayName) {
      return { error: 'Display name is required.' }
    }

    if (!allowedTypes.includes(connectorType)) {
      return { error: 'Invalid connector type.' }
    }

    if (!allowedStatuses.includes(status)) {
      return { error: 'Invalid connector status.' }
    }

    if (connectorType === 'http_feed') {
      const endpointUrl = String(formData.get('endpoint_url') ?? '').trim()
      if (!endpointUrl) {
        return { error: 'Endpoint URL is required for HTTP feed connectors.' }
      }

      const method = String(formData.get('method') ?? '').trim().toUpperCase()
      if (method && method !== 'GET' && method !== 'POST') {
        return { error: 'HTTP feed method must be GET or POST.' }
      }
    }

    const config = buildConnectorConfig(
      formData,
      connectorType,
      context,
      connector.config as Record<string, unknown> | null | undefined
    )

    const { error } = await supabaseAdmin
      .from('darkweb_connectors')
      .update({
        connector_type: connectorType,
        display_name: displayName,
        status,
        config,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectorId)
      .eq('organization_id', context.organization.id)

    if (error) {
      return { error: error.message || 'Unable to update connector.' }
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unexpected error while updating connector.',
    }
  }

  redirect('/dashboard/dark-web/connectors?updated=1')
}
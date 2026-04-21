import { supabaseAdmin } from '@/lib/supabase-admin'
import { loadConnectorCursors, saveConnectorCursors } from './cursors'
import { persistNormalizedDarkwebEvents } from './persist'
import { getDarkwebConnector } from './registry'
import type { DarkwebConnectorType } from './types'

type RunConnectorOptions = {
  triggerType?: 'manual' | 'cron' | 'system'
  triggeredByUserId?: string | null
  triggeredByPersonId?: string | null
  allowPaused?: boolean
}

export async function runDarkwebConnector(
  connectorId: string,
  options: RunConnectorOptions = {}
) {
  const {
    triggerType = 'system',
    triggeredByUserId = null,
    triggeredByPersonId = null,
    allowPaused = false,
  } = options

  const { data: connector, error } = await supabaseAdmin
    .from('darkweb_connectors')
    .select('*')
    .eq('id', connectorId)
    .single()

  if (error) throw error
  if (!connector) throw new Error(`Connector not found: ${connectorId}`)

  if (connector.status === 'paused' && !allowPaused) {
    throw new Error('Connector is paused.')
  }

  const cursors = await loadConnectorCursors(connectorId)
  const runner = getDarkwebConnector(connector.connector_type as DarkwebConnectorType)

  const startedAt = new Date().toISOString()

  try {
    const result = await runner.run({
      connectorId: connector.id,
      organizationId: connector.organization_id,
      config: connector.config ?? {},
      cursors,
    })

    const persistResult = await persistNormalizedDarkwebEvents({
      organizationId: connector.organization_id,
      events: result.events,
    })

    if (result.nextCursors) {
      await saveConnectorCursors(connector.id, result.nextCursors)
    }

    const nextConfig =
      connector.config && typeof connector.config === 'object'
        ? {
            ...connector.config,
            last_trigger_type: triggerType,
            last_triggered_by_user_id: triggeredByUserId,
            last_triggered_by_person_id: triggeredByPersonId,
            last_run_started_at: startedAt,
            last_run_finished_at: new Date().toISOString(),
            last_run_status: 'success',
            last_run_emitted_count: result.events.length,
            last_run_inserted_count: persistResult.inserted,
          }
        : {
            last_trigger_type: triggerType,
            last_triggered_by_user_id: triggeredByUserId,
            last_triggered_by_person_id: triggeredByPersonId,
            last_run_started_at: startedAt,
            last_run_finished_at: new Date().toISOString(),
            last_run_status: 'success',
            last_run_emitted_count: result.events.length,
            last_run_inserted_count: persistResult.inserted,
          }

    await supabaseAdmin
      .from('darkweb_connectors')
      .update({
        config: nextConfig,
        last_run_at: new Date().toISOString(),
        last_success_at: new Date().toISOString(),
        last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connector.id)

    return {
      connectorId: connector.id,
      inserted: persistResult.inserted,
      emitted: result.events.length,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    const nextConfig =
      connector.config && typeof connector.config === 'object'
        ? {
            ...connector.config,
            last_trigger_type: triggerType,
            last_triggered_by_user_id: triggeredByUserId,
            last_triggered_by_person_id: triggeredByPersonId,
            last_run_started_at: startedAt,
            last_run_finished_at: new Date().toISOString(),
            last_run_status: 'failed',
            last_run_error: message,
          }
        : {
            last_trigger_type: triggerType,
            last_triggered_by_user_id: triggeredByUserId,
            last_triggered_by_person_id: triggeredByPersonId,
            last_run_started_at: startedAt,
            last_run_finished_at: new Date().toISOString(),
            last_run_status: 'failed',
            last_run_error: message,
          }

    await supabaseAdmin
      .from('darkweb_connectors')
      .update({
        config: nextConfig,
        last_run_at: new Date().toISOString(),
        last_error: message,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connector.id)

    throw error
  }
}
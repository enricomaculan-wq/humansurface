import { supabaseAdmin } from '@/lib/supabase-admin'

type StartRunParams = {
  connectorId: string
  organizationId: string
  triggerType: 'manual' | 'cron' | 'system'
  triggeredByUserId?: string | null
  triggeredByPersonId?: string | null
  metadata?: Record<string, unknown>
}

type FinishRunParams = {
  runId: string
  status: 'success' | 'failed'
  emittedCount?: number
  insertedCount?: number
  errorMessage?: string | null
  metadata?: Record<string, unknown>
}

export async function startDarkwebConnectorRun(params: StartRunParams) {
  const { data, error } = await supabaseAdmin
    .from('darkweb_connector_runs')
    .insert({
      connector_id: params.connectorId,
      organization_id: params.organizationId,
      trigger_type: params.triggerType,
      status: 'running',
      started_at: new Date().toISOString(),
      triggered_by_user_id: params.triggeredByUserId ?? null,
      triggered_by_person_id: params.triggeredByPersonId ?? null,
      metadata: params.metadata ?? {},
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(error.message || 'Unable to create connector run history.')
  }

  return data.id as string
}

export async function finishDarkwebConnectorRun(params: FinishRunParams) {
  const { error } = await supabaseAdmin
    .from('darkweb_connector_runs')
    .update({
      status: params.status,
      finished_at: new Date().toISOString(),
      emitted_count: params.emittedCount ?? 0,
      inserted_count: params.insertedCount ?? 0,
      error_message: params.errorMessage ?? null,
      metadata: params.metadata ?? {},
    })
    .eq('id', params.runId)

  if (error) {
    throw new Error(error.message || 'Unable to finalize connector run history.')
  }
}
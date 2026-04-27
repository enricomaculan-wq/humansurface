import { supabaseAdmin } from '@/lib/supabase-admin'
import { runDarkwebConnector } from './run-connector'

type RunAllOptions = {
  organizationId?: string
  triggerType?: 'manual' | 'cron' | 'system'
  triggeredByUserId?: string | null
  triggeredByPersonId?: string | null
  includePaused?: boolean
  limit?: number
}

type RunAllResultItem = {
  connectorId: string
  ok: boolean
  inserted?: number
  emitted?: number
  error?: string
}

export async function runAllActiveDarkwebConnectors(
  options: RunAllOptions = {}
) {
  const {
    organizationId,
    triggerType = 'system',
    triggeredByUserId = null,
    triggeredByPersonId = null,
    includePaused = false,
    limit = 50,
  } = options

  let query = supabaseAdmin
    .from('darkweb_connectors')
    .select('id, organization_id, status, created_at')
    .order('created_at', { ascending: true })
    .limit(limit)

  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }

  if (includePaused) {
    query = query.in('status', ['active', 'paused'])
  } else {
    query = query.eq('status', 'active')
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message || 'Unable to load dark web connectors.')
  }

  const connectors = data ?? []
  const results: RunAllResultItem[] = []

  for (const connector of connectors) {
    try {
      const result = await runDarkwebConnector(connector.id, {
        triggerType,
        triggeredByUserId,
        triggeredByPersonId,
        allowPaused: includePaused,
      })

      results.push({
        connectorId: connector.id,
        ok: true,
        inserted: result.inserted,
        emitted: result.emitted,
      })
    } catch (error) {
      results.push({
        connectorId: connector.id,
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected run error.',
      })
    }
  }

  return {
    total: connectors.length,
    ok: results.filter((item) => item.ok).length,
    failed: results.filter((item) => !item.ok).length,
    results,
  }
}
import { supabaseAdmin } from '@/lib/supabase-admin'
import { runDarkwebConnector } from './run-connector'

export async function runAllActiveDarkwebConnectors() {
  const { data, error } = await supabaseAdmin
    .from('darkweb_connectors')
    .select('id')
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  if (error) throw error

  const results: Array<{
    connectorId: string
    ok: boolean
    inserted?: number
    emitted?: number
    error?: string
  }> = []

  for (const row of data ?? []) {
    try {
      const result = await runDarkwebConnector(row.id)
      results.push({
        connectorId: row.id,
        ok: true,
        inserted: result.inserted,
        emitted: result.emitted,
      })
    } catch (error) {
      results.push({
        connectorId: row.id,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return results
}
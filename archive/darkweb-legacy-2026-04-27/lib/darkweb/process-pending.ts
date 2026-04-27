import { supabaseAdmin } from '@/lib/supabase-admin'
import { processDarkwebRawEvent } from '@/lib/darkweb/matcher'

export async function processPendingDarkwebRawEvents(limit = 50) {
  const { data, error } = await supabaseAdmin
    .from('darkweb_raw_events')
    .select('id')
    .eq('processing_status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw error
  }

  const results: Array<{
    rawEventId: string
    ok: boolean
    findingId?: string
    matched?: boolean
    error?: string
  }> = []

  for (const row of data ?? []) {
    try {
      const result = await processDarkwebRawEvent(row.id)

      results.push({
        rawEventId: row.id,
        ok: true,
        matched: result.matched,
        findingId: result.findingId,
      })
    } catch (error) {
      results.push({
        rawEventId: row.id,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return {
    attempted: (data ?? []).length,
    processed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  }
}
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function loadConnectorCursors(connectorId: string) {
  const { data, error } = await supabaseAdmin
    .from('darkweb_connector_cursors')
    .select('cursor_key, cursor_value')
    .eq('connector_id', connectorId)

  if (error) throw error

  const result: Record<string, string | null> = {}

  for (const row of data ?? []) {
    result[row.cursor_key] = row.cursor_value
  }

  return result
}

export async function saveConnectorCursors(
  connectorId: string,
  cursors: Record<string, string | null>
) {
  for (const [cursorKey, cursorValue] of Object.entries(cursors)) {
    const { error } = await supabaseAdmin
      .from('darkweb_connector_cursors')
      .upsert(
        {
          connector_id: connectorId,
          cursor_key: cursorKey,
          cursor_value: cursorValue,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'connector_id,cursor_key' }
      )

    if (error) throw error
  }
}
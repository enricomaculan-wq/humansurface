import { supabaseAdmin } from '@/lib/supabase-admin'
import type { NormalizedDarkwebEvent } from './types'

export async function persistNormalizedDarkwebEvents(params: {
  organizationId: string
  events: NormalizedDarkwebEvent[]
}) {
  if (params.events.length === 0) return { inserted: 0 }

  let inserted = 0

  for (const event of params.events) {
    const { error } = await supabaseAdmin
      .from('darkweb_raw_events')
      .insert({
        organization_id: params.organizationId,
        source_type: event.source_type,
        source_name: event.source_name ?? null,
        event_type: event.event_type,
        external_id: event.external_id ?? null,
        title: event.title,
        raw_payload: event.payload,
        normalized_text: event.normalized_text ?? null,
        observed_at: event.observed_at ?? null,
        processing_status: 'pending',
        matched_asset_count: 0,
      })

    if (error) {
      if (error.code === '23505') {
        continue
      }
      throw error
    }

    inserted += 1
  }

  return { inserted }
}
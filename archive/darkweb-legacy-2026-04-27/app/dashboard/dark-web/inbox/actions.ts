'use server'

import { revalidatePath } from 'next/cache'
import { processDarkwebRawEvent } from '@/lib/darkweb/matcher'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireOwnedRawEvent } from '@/lib/darkweb/ownership'
import { requireCurrentDarkwebContext } from '@/lib/darkweb/context'

function revalidateDarkwebPages(rawEventId?: string) {
  revalidatePath('/dashboard/dark-web/inbox')
  revalidatePath('/dashboard/dark-web/findings')
  revalidatePath('/dashboard/dark-web/alerts')
  revalidatePath('/dashboard/dark-web/metrics')
  revalidatePath('/dashboard/dark-web')
  if (rawEventId) {
    revalidatePath(`/dashboard/dark-web/inbox/${rawEventId}`)
  }
}

export async function processSingleRawEventAction(rawEventId: string) {
  const { rawEvent } = await requireOwnedRawEvent(rawEventId)

  await processDarkwebRawEvent(rawEvent.id)

  revalidateDarkwebPages(rawEvent.id)
}

export async function processAllPendingRawEventsAction() {
  const context = await requireCurrentDarkwebContext()

  const { data, error } = await supabaseAdmin
    .from('darkweb_raw_events')
    .select('id')
    .eq('organization_id', context.organization.id)
    .eq('processing_status', 'pending')
    .order('created_at', { ascending: true })
    .limit(50)

  if (error) {
    throw new Error(error.message || 'Unable to load pending raw events.')
  }

  for (const row of data ?? []) {
    try {
      await processDarkwebRawEvent(row.id)
    } catch (error) {
      console.error('bulk process failed for raw event', row.id, error)

      await supabaseAdmin
        .from('darkweb_raw_events')
        .update({
          processing_status: 'failed',
          processing_error:
            error instanceof Error
              ? error.message
              : 'Unexpected error while processing raw event.',
          processed_at: new Date().toISOString(),
        })
        .eq('id', row.id)
    }
  }

  revalidateDarkwebPages()
}

export async function retryRawEventAction(rawEventId: string) {
  const { rawEvent } = await requireOwnedRawEvent(rawEventId)

  const { error: resetError } = await supabaseAdmin
    .from('darkweb_raw_events')
    .update({
      processing_status: 'pending',
      processing_error: null,
      matched_asset_count: 0,
      processed_at: null,
    })
    .eq('id', rawEvent.id)

  if (resetError) {
    throw new Error(resetError.message || 'Unable to reset raw event for retry.')
  }

  await processDarkwebRawEvent(rawEvent.id)

  revalidateDarkwebPages(rawEvent.id)
}

export async function reprocessRawEventAction(rawEventId: string) {
  const { rawEvent } = await requireOwnedRawEvent(rawEventId)

  const { error: resetError } = await supabaseAdmin
    .from('darkweb_raw_events')
    .update({
      processing_status: 'pending',
      processing_error: null,
      matched_asset_count: 0,
      processed_at: null,
    })
    .eq('id', rawEvent.id)

  if (resetError) {
    throw new Error(resetError.message || 'Unable to reset raw event for reprocess.')
  }

  await processDarkwebRawEvent(rawEvent.id)

  revalidateDarkwebPages(rawEvent.id)
}
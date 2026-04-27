'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireCurrentDarkwebContext } from '@/lib/darkweb/context'

export type CreateRawEventState = {
  error: string | null
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9@.\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function createRawEventAction(
  _prevState: CreateRawEventState,
  formData: FormData
): Promise<CreateRawEventState> {
  try {
    const context = await requireCurrentDarkwebContext()

    const sourceType = String(formData.get('source_type') ?? '').trim()
    const sourceName = String(formData.get('source_name') ?? '').trim()
    const eventType = String(formData.get('event_type') ?? '').trim()
    const title = String(formData.get('title') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const domain = String(formData.get('domain') ?? '').trim()
    const brand = String(formData.get('brand') ?? '').trim()
    const username = String(formData.get('username') ?? '').trim()
    const snippet = String(formData.get('snippet') ?? '').trim()
    const url = String(formData.get('url') ?? '').trim()
    const externalId = String(formData.get('external_id') ?? '').trim()

    if (!sourceType) return { error: 'Source type is required.' }
    if (!eventType) return { error: 'Event type is required.' }
    if (!title) return { error: 'Title is required.' }

    const allowedEventTypes = [
      'credential_exposure',
      'stealer_detected',
      'brand_mention',
      'pii_exposure',
      'access_mention',
    ]

    if (!allowedEventTypes.includes(eventType)) {
      return { error: 'Invalid event type.' }
    }

    const organizationId = context.organization.id

    const rawPayload: Record<string, unknown> = {
      created_by_user_id: context.user.id,
    }

    if (context.person?.id) {
      rawPayload.created_by_person_id = context.person.id
    }

    if (email) rawPayload.email = email
    if (domain) rawPayload.domain = domain
    if (brand) rawPayload.brand = brand
    if (username) rawPayload.username = username
    if (snippet) rawPayload.snippet = snippet
    if (url) rawPayload.url = url

    const normalizedText = normalizeText(
      [title, sourceName, email, domain, brand, username, snippet, url]
        .filter(Boolean)
        .join(' ')
    )

    const { error } = await supabaseAdmin
      .from('darkweb_raw_events')
      .insert({
        organization_id: organizationId,
        source_type: sourceType,
        source_name: sourceName || null,
        event_type: eventType,
        external_id: externalId || null,
        title,
        raw_payload: rawPayload,
        normalized_text: normalizedText || null,
        observed_at: new Date().toISOString(),
        processing_status: 'pending',
        matched_asset_count: 0,
      })

    if (error) {
      if (error.code === '23505') {
        return { error: 'A raw event with this external id already exists.' }
      }
      return { error: error.message || 'Unable to create raw event.' }
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unexpected error while creating raw event.',
    }
  }

  redirect('/dashboard/dark-web/inbox?created=1')
}
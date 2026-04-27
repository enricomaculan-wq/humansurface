'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { parseDarkwebCsv } from '@/lib/darkweb/connectors/csv-import'
import { requireCurrentDarkwebContext } from '@/lib/darkweb/context'

export type CsvUploadState = {
  error: string | null
}

export async function uploadCsvRawEventsAction(
  _prevState: CsvUploadState,
  formData: FormData
): Promise<CsvUploadState> {
  try {
    const context = await requireCurrentDarkwebContext()

    const file = formData.get('file')

    if (!(file instanceof File)) {
      return { error: 'Please select a CSV file.' }
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return { error: 'The uploaded file must be a CSV.' }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const rows = parseDarkwebCsv(buffer)

    if (rows.length === 0) {
      return { error: 'The CSV file is empty or has no valid rows.' }
    }

    const organizationId = context.organization.id
    let inserted = 0

    for (const row of rows) {
      const rawPayload =
        row.raw_payload && typeof row.raw_payload === 'object'
          ? {
              ...row.raw_payload,
              created_by_user_id: context.user.id,
              created_by_person_id: context.person?.id ?? null,
              import_source: 'csv_upload',
            }
          : {
              created_by_user_id: context.user.id,
              created_by_person_id: context.person?.id ?? null,
              import_source: 'csv_upload',
            }

      const { error } = await supabaseAdmin
        .from('darkweb_raw_events')
        .insert({
          organization_id: organizationId,
          source_type: row.source_type,
          source_name: row.source_name,
          event_type: row.event_type,
          external_id: row.external_id,
          title: row.title,
          raw_payload: rawPayload,
          normalized_text: row.normalized_text,
          observed_at: row.observed_at,
          processing_status: 'pending',
          matched_asset_count: 0,
        })

      if (error) {
        if (error.code === '23505') {
          continue
        }
        return { error: error.message || 'Unable to import CSV rows.' }
      }

      inserted += 1
    }

    redirect(`/dashboard/dark-web/inbox?created=1&imported=${inserted}`)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unexpected error while importing CSV.',
    }
  }
}
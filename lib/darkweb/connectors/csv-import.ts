import { parse } from 'csv-parse/sync'

export type CsvImportedRawEvent = {
  source_type: string
  source_name: string | null
  event_type:
    | 'credential_exposure'
    | 'stealer_detected'
    | 'brand_mention'
    | 'pii_exposure'
    | 'access_mention'
  external_id: string | null
  title: string
  raw_payload: Record<string, unknown>
  normalized_text: string | null
  observed_at: string | null
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9@.\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function asString(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function normalizeEventType(value: string) {
  const normalized = value.trim().toLowerCase()

  if (
    normalized === 'credential_exposure' ||
    normalized === 'stealer_detected' ||
    normalized === 'brand_mention' ||
    normalized === 'pii_exposure' ||
    normalized === 'access_mention'
  ) {
    return normalized
  }

  return 'credential_exposure'
}

export function parseDarkwebCsv(buffer: Buffer): CsvImportedRawEvent[] {
  const text = buffer.toString('utf-8')

  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, unknown>[]

  return rows.map((row, index) => {
    const sourceType = asString(row.source_type) || 'csv_upload'
    const sourceName = asString(row.source_name) || 'CSV Upload'
    const eventType = normalizeEventType(asString(row.event_type))
    const title =
      asString(row.title) || `Imported dark web event ${index + 1}`

    const email = asString(row.email)
    const domain = asString(row.domain)
    const brand = asString(row.brand)
    const username = asString(row.username)
    const snippet = asString(row.snippet)
    const url = asString(row.url)
    const observedAt = asString(row.observed_at)
    const externalId = asString(row.external_id)

    const rawPayload: Record<string, unknown> = {}
    if (email) rawPayload.email = email
    if (domain) rawPayload.domain = domain
    if (brand) rawPayload.brand = brand
    if (username) rawPayload.username = username
    if (snippet) rawPayload.snippet = snippet
    if (url) rawPayload.url = url

    const normalizedTextSource = [
      title,
      sourceName,
      email,
      domain,
      brand,
      username,
      snippet,
      url,
    ]
      .filter(Boolean)
      .join(' ')

    return {
      source_type: sourceType,
      source_name: sourceName || null,
      event_type: eventType,
      external_id: externalId || null,
      title,
      raw_payload: rawPayload,
      normalized_text: normalizedTextSource
        ? normalizeText(normalizedTextSource)
        : null,
      observed_at: observedAt || null,
    }
  })
}
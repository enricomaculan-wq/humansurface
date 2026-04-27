import type {
  ConnectorRunContext,
  ConnectorRunResult,
  DarkwebConnector,
  NormalizedDarkwebEvent,
} from './types'



type JsonRecord = Record<string, unknown>

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : null
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9@.\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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

  if (normalized === 'stealer_log') return 'stealer_detected'
  if (normalized === 'credential') return 'credential_exposure'
  if (normalized === 'brand') return 'brand_mention'
  if (normalized === 'pii') return 'pii_exposure'
  if (normalized === 'access') return 'access_mention'

  return 'credential_exposure'
}

function getByPath(input: unknown, path: string): unknown {
  if (!path.trim()) return undefined

  const parts = path.split('.').map((part) => part.trim()).filter(Boolean)
  let current: unknown = input

  for (const part of parts) {
    if (Array.isArray(current)) {
      const index = Number(part)
      if (!Number.isInteger(index)) return undefined
      current = current[index]
      continue
    }

    if (!current || typeof current !== 'object') {
      return undefined
    }

    current = (current as JsonRecord)[part]
  }

  return current
}

function extractItems(payload: unknown, itemsPath?: string): JsonRecord[] {
  const fromConfiguredPath = itemsPath ? getByPath(payload, itemsPath) : undefined
  const candidate = fromConfiguredPath ?? payload

  if (Array.isArray(candidate)) {
    return candidate.filter((item): item is JsonRecord => !!item && typeof item === 'object')
  }

  const candidateRecord = asRecord(candidate)
  if (candidateRecord) {
    for (const key of ['items', 'events', 'data', 'results']) {
      const value = candidateRecord[key]
      if (Array.isArray(value)) {
        return value.filter((item): item is JsonRecord => !!item && typeof item === 'object')
      }
    }
  }

  throw new Error(
    'HTTP feed response must be an array or an object containing items/events/data/results.'
  )
}

function extractNextCursor(payload: unknown, nextCursorPath?: string) {
  const fromConfiguredPath = nextCursorPath ? getByPath(payload, nextCursorPath) : undefined

  const direct = asString(fromConfiguredPath)
  if (direct) return direct

  const payloadRecord = asRecord(payload)
  if (!payloadRecord) return null

  for (const key of ['next_cursor', 'nextCursor', 'cursor']) {
    const value = asString(payloadRecord[key])
    if (value) return value
  }

  return null
}

function buildNormalizedEvent(
  row: JsonRecord,
  defaults: {
    sourceName: string
    sourceType: string
  }
): NormalizedDarkwebEvent {
  const sourceType = asString(row.source_type) || defaults.sourceType || 'http_feed'
  const sourceName = asString(row.source_name) || defaults.sourceName || 'HTTP Feed'
  const eventType = normalizeEventType(asString(row.event_type) || asString(row.type))
  const title = asString(row.title) || asString(row.name) || 'Imported HTTP feed event'
  const externalId =
    asString(row.external_id) || asString(row.id) || asString(row.reference) || null

  const email = asString(row.email)
  const domain = asString(row.domain)
  const brand = asString(row.brand)
  const username = asString(row.username)
  const snippet = asString(row.snippet) || asString(row.description)
  const url = asString(row.url)
  const confidence = asNumber(row.confidence)

  const payload: Record<string, unknown> = {}

  if (email) payload.email = email
  if (domain) payload.domain = domain
  if (brand) payload.brand = brand
  if (username) payload.username = username
  if (snippet) payload.snippet = snippet
  if (url) payload.url = url
  if (confidence !== null) payload.confidence = confidence

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
    external_id: externalId,
    title,
    observed_at:
      asString(row.observed_at) ||
      asString(row.timestamp) ||
      asString(row.created_at) ||
      null,
    payload,
    normalized_text: normalizedTextSource
      ? normalizeText(normalizedTextSource)
      : null,
  }
}

function mergeHeaders(
  baseHeaders: HeadersInit,
  extraHeadersRaw: unknown
): Headers {
  const headers = new Headers(baseHeaders)

  if (extraHeadersRaw && typeof extraHeadersRaw === 'object' && !Array.isArray(extraHeadersRaw)) {
    for (const [key, value] of Object.entries(extraHeadersRaw as JsonRecord)) {
      const normalizedValue = asString(value)
      if (key.trim() && normalizedValue) {
        headers.set(key, normalizedValue)
      }
    }
  }

  return headers
}

export class HttpFeedConnector implements DarkwebConnector {
  type = 'http_feed' as const

  async run(context: ConnectorRunContext): Promise<ConnectorRunResult> {
    const endpointUrl =
      typeof context.config.endpoint_url === 'string'
        ? context.config.endpoint_url.trim()
        : ''

    const authHeader =
      typeof context.config.auth_header === 'string'
        ? context.config.auth_header.trim()
        : ''

    const sourceName =
      typeof context.config.source_name === 'string'
        ? context.config.source_name.trim()
        : 'HTTP Feed'

    const sourceType =
      typeof context.config.source_type === 'string'
        ? context.config.source_type.trim()
        : 'http_feed'

    const method =
      typeof context.config.method === 'string'
        ? context.config.method.trim().toUpperCase()
        : 'GET'

    const cursorParam =
      typeof context.config.cursor_param === 'string'
        ? context.config.cursor_param.trim()
        : 'cursor'

    const sinceParam =
      typeof context.config.since_param === 'string'
        ? context.config.since_param.trim()
        : 'since'

    const itemsPath =
      typeof context.config.items_path === 'string'
        ? context.config.items_path.trim()
        : ''

    const nextCursorPath =
      typeof context.config.next_cursor_path === 'string'
        ? context.config.next_cursor_path.trim()
        : ''

    const timeoutMs =
      typeof context.config.timeout_ms === 'number' && Number.isFinite(context.config.timeout_ms)
        ? Math.max(1000, Math.min(30000, context.config.timeout_ms))
        : 10000

    if (!endpointUrl) {
      throw new Error('HTTP feed connector requires endpoint_url in config.')
    }

    if (method !== 'GET' && method !== 'POST') {
      throw new Error('HTTP feed connector only supports GET or POST methods.')
    }

    const headers = mergeHeaders(
      {
        Accept: 'application/json',
      },
      context.config.headers
    )

    if (authHeader) {
      headers.set('Authorization', authHeader)
    }

    const lastSuccessAt = context.cursors.last_success_at
    const lastCursor = context.cursors.next_cursor

    const url = new URL(endpointUrl)

    if (method === 'GET') {
      if (lastCursor && cursorParam) {
        url.searchParams.set(cursorParam, lastCursor)
      } else if (lastSuccessAt && sinceParam) {
        url.searchParams.set(sinceParam, lastSuccessAt)
      }
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const body =
        method === 'POST'
          ? JSON.stringify({
              ...(asRecord(context.config.request_body) ?? {}),
              ...(lastCursor && cursorParam ? { [cursorParam]: lastCursor } : {}),
              ...(!lastCursor && lastSuccessAt && sinceParam ? { [sinceParam]: lastSuccessAt } : {}),
            })
          : undefined

      if (method === 'POST') {
        headers.set('Content-Type', 'application/json')
      }

      const response = await fetch(url.toString(), {
        method,
        headers,
        body,
        cache: 'no-store',
        signal: controller.signal,
      })

      if (!response.ok) {
        const responseText = await response.text().catch(() => '')
        throw new Error(
          `HTTP feed request failed with status ${response.status}${
            responseText ? `: ${responseText.slice(0, 300)}` : ''
          }`
        )
      }

      const json = await response.json()
      const items = extractItems(json, itemsPath || undefined)

      const events = items.map((item) =>
        buildNormalizedEvent(item, {
          sourceName,
          sourceType,
        })
      )

      const nextCursor = extractNextCursor(json, nextCursorPath || undefined)

      return {
        events,
        nextCursors: {
          last_success_at: new Date().toISOString(),
          next_cursor: nextCursor,
        },
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`HTTP feed request timed out after ${timeoutMs}ms`)
      }
      throw error
    } finally {
      clearTimeout(timeout)
    }
  }
}
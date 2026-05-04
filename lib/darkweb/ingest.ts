import { createHash } from 'crypto'
import { normalizeDarkwebText } from './normalize'
import type { DarkwebRawResultInput, DarkwebRawResultRecord, JsonRecord } from './types'

export type DarkwebRawIngestionInput = {
  seedId?: string | null
  sourceType: string
  sourceName?: string | null
  rawReference?: string | null
  rawPayload?: JsonRecord
  normalizedText?: string | null
  observedAt?: string | null
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }

  const record = value as JsonRecord
  const entries = Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)

  return `{${entries.join(',')}}`
}

function textValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : null
}

function buildNormalizedText(input: DarkwebRawIngestionInput) {
  if (input.normalizedText?.trim()) {
    return normalizeDarkwebText(input.normalizedText)
  }

  const payload = input.rawPayload ?? {}
  const parts = [
    input.sourceType,
    input.sourceName ?? '',
    input.rawReference ?? '',
    textValue(payload.title),
    textValue(payload.email),
    textValue(payload.domain),
    textValue(payload.brand),
    textValue(payload.username),
    textValue(payload.person),
    textValue(payload.role),
    textValue(payload.event_type),
    textValue(payload.category),
    textValue(payload.breach_name),
    textValue(payload.dataset),
    textValue(payload.service),
    textValue(payload.snippet),
    textValue(payload.description),
    textValue(payload.url),
  ]

  const text = parts.filter(Boolean).join(' ')
  return text ? normalizeDarkwebText(text) : null
}

export function normalizeRawIngestionInput(
  input: DarkwebRawIngestionInput,
): DarkwebRawResultInput {
  const rawPayload = input.rawPayload ?? {}
  const normalizedText = buildNormalizedText(input)
  const hashSource = stableStringify({
    sourceType: input.sourceType,
    rawReference: input.rawReference ?? null,
    rawPayload,
    normalizedText,
  })

  return {
    seedId: input.seedId ?? null,
    sourceType: input.sourceType,
    sourceName: input.sourceName ?? null,
    rawReference: input.rawReference ?? null,
    rawPayload,
    normalizedText,
    rawHash: createHash('sha256').update(hashSource).digest('hex'),
    status: 'normalized',
    observedAt: input.observedAt ?? null,
  }
}

export function coerceDarkwebRawIngestionInputs(value: unknown) {
  const root = asRecord(value)
  const candidate =
    Array.isArray(value)
      ? value
      : Array.isArray(root?.results)
        ? root.results
        : root
          ? [root]
          : []

  return candidate
    .map((item): DarkwebRawIngestionInput | null => {
      const row = asRecord(item)
      if (!row) return null

      const rawPayload =
        asRecord(row.rawPayload) ?? asRecord(row.raw_payload) ?? row
      const sourceType =
        textValue(row.sourceType) || textValue(row.source_type) || 'manual_admin'
      const sourceName =
        textValue(row.sourceName) ||
        textValue(row.source_name) ||
        'Manual admin import'

      return {
        seedId: textValue(row.seedId) || textValue(row.seed_id) || null,
        sourceType,
        sourceName,
        rawReference:
          textValue(row.rawReference) ||
          textValue(row.raw_reference) ||
          textValue(row.externalId) ||
          textValue(row.external_id) ||
          null,
        rawPayload,
        normalizedText:
          textValue(row.normalizedText) || textValue(row.normalized_text) || null,
        observedAt:
          textValue(row.observedAt) || textValue(row.observed_at) || null,
      }
    })
    .filter((item): item is DarkwebRawIngestionInput => item !== null)
}

export async function ingestDarkwebRawResults(params: {
  runId: string
  organizationId: string
  assessmentId?: string | null
  results: DarkwebRawIngestionInput[]
}): Promise<DarkwebRawResultRecord[]> {
  const normalizedResults = params.results.map(normalizeRawIngestionInput)
  const { persistDarkwebRawResults } = await import('./repository')

  return persistDarkwebRawResults({
    runId: params.runId,
    organizationId: params.organizationId,
    assessmentId: params.assessmentId ?? null,
    results: normalizedResults,
  })
}

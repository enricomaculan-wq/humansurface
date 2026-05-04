import type {
  DarkwebFindingCategory,
  DarkwebSeedType,
  DarkwebSeverity,
  JsonRecord,
} from './types'

const EMAIL_RE = /([a-z0-9._%+-])([a-z0-9._%+-]*)(@[a-z0-9.-]+\.[a-z]{2,})/gi

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function joinedSignalText(input: {
  sourceType?: string | null
  sourceName?: string | null
  eventType?: string | null
  payload?: JsonRecord | null
}) {
  const payload = input.payload ?? {}

  return normalizeDarkwebText(
    [
      input.sourceType,
      input.sourceName,
      input.eventType,
      asString(payload.event_type),
      asString(payload.category),
      asString(payload.type),
      asString(payload.breach_name),
      asString(payload.dataset),
      asString(payload.source),
      asString(payload.description),
      asString(payload.snippet),
      asString(payload.url),
    ]
      .filter(Boolean)
      .join(' '),
  )
}

export function darkwebSignalFlags(input: {
  sourceType?: string | null
  sourceName?: string | null
  eventType?: string | null
  payload?: JsonRecord | null
}) {
  const payload = input.payload ?? {}
  const signalText = joinedSignalText(input)
  const credentialSecret =
    asString(payload.password) ||
    asString(payload.pass) ||
    asString(payload.pwd) ||
    asString(payload.password_hash) ||
    asString(payload.hash) ||
    asString(payload.secret) ||
    asString(payload.token)

  return {
    credentialSecret: Boolean(credentialSecret),
    credentialContext:
      Boolean(credentialSecret) ||
      /\b(credential|combo|login|password|passwd|pwd|hash|stealer|infostealer|leak|breach|dump)\b/.test(
        signalText,
      ),
    fraudContext:
      /\b(fraud|marketplace|escrow|fullz|identity|bank|payment|invoice|wire|account takeover|ato|phishing kit|carding)\b/.test(
        signalText,
      ),
    documentContext:
      /\b(document|passport|invoice|contract|payroll|tax|statement|confidential|nda|pdf|spreadsheet)\b/.test(
        signalText,
      ),
  }
}

export function normalizeDarkwebText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9@.\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeDarkwebTerm(seedType: DarkwebSeedType, value: string) {
  const trimmed = value.trim()

  if (!trimmed) return ''

  if (
    seedType === 'email' ||
    seedType === 'email_pattern' ||
    seedType === 'domain' ||
    seedType === 'subdomain' ||
    seedType === 'brand' ||
    seedType === 'username'
  ) {
    return trimmed.toLowerCase()
  }

  if (seedType === 'phone') {
    return trimmed.replace(/\s+/g, '')
  }

  return normalizeDarkwebText(trimmed)
}

export function confidenceFromValue(value: unknown, fallback = 0.7) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.max(0, Math.min(1, value))
}

export function redactDarkwebEvidence(value: string | null | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return null

  return trimmed
    .replace(EMAIL_RE, (_match, first: string, rest: string, domain: string) => {
      const mask = rest ? `${first}${'*'.repeat(Math.min(rest.length, 6))}` : first
      return `${mask}${domain.toLowerCase()}`
    })
    .replace(/\b(password|pass|pwd)\s*[:=]\s*\S+/gi, '$1: [redacted]')
    .slice(0, 800)
}

export function inferDarkwebCategory(input: {
  sourceType?: string | null
  sourceName?: string | null
  eventType?: string | null
  matchedEntityType?: DarkwebSeedType | null
  payload?: JsonRecord | null
}): DarkwebFindingCategory {
  const signals = darkwebSignalFlags(input)
  const eventType = asString(input.eventType).toLowerCase()
  const credentialEntity =
    input.matchedEntityType === 'email' ||
    input.matchedEntityType === 'email_pattern' ||
    input.matchedEntityType === 'username' ||
    input.matchedEntityType === 'phone'

  if (signals.credentialContext && (signals.credentialSecret || credentialEntity)) {
    return 'credential_exposure'
  }

  if (signals.fraudContext) {
    return 'fraud_enabling_exposure'
  }

  if (signals.documentContext) {
    return 'sensitive_document_exposure'
  }

  if (
    input.matchedEntityType === 'person' ||
    input.matchedEntityType === 'key_role' ||
    eventType.includes('employee')
  ) {
    return 'employee_exposure'
  }

  if (
    input.matchedEntityType === 'domain' ||
    input.matchedEntityType === 'subdomain' ||
    input.matchedEntityType === 'brand'
  ) {
    return 'brand_domain_mention'
  }

  return 'technical_exposure_correlation'
}

export function inferDarkwebSeverity(input: {
  category: DarkwebFindingCategory
  confidence: number
  matchedEntityType?: DarkwebSeedType | null
  criticality?: string | null
  credentialSecret?: boolean
  fraudContext?: boolean
  matchStrength?: 'strong' | 'medium' | 'weak'
}): DarkwebSeverity {
  const criticality = asString(input.criticality).toLowerCase()
  const weakMatch = input.matchStrength === 'weak'
  const brandDomainEntity =
    input.matchedEntityType === 'brand' ||
    input.matchedEntityType === 'domain' ||
    input.matchedEntityType === 'subdomain'
  const highValueEntity =
    input.matchedEntityType === 'email' ||
    input.matchedEntityType === 'username' ||
    input.matchedEntityType === 'key_role'

  if (
    input.category === 'credential_exposure' &&
    (input.credentialSecret || criticality === 'critical') &&
    input.confidence >= 0.85
  ) {
    return 'critical'
  }

  if (
    input.category === 'fraud_enabling_exposure' &&
    brandDomainEntity &&
    input.matchStrength !== 'strong'
  ) {
    return input.confidence >= 0.7 ? 'medium' : 'low'
  }

  if (
    (input.category === 'fraud_enabling_exposure' &&
      (input.fraudContext || input.confidence >= 0.75)) ||
    (input.category === 'sensitive_document_exposure' && input.confidence >= 0.7) ||
    criticality === 'critical'
  ) {
    return 'high'
  }

  if (
    input.category === 'credential_exposure' ||
    (highValueEntity && !weakMatch && input.confidence >= 0.7) ||
    criticality === 'high'
  ) {
    return 'high'
  }

  if (
    input.category === 'brand_domain_mention' &&
    (weakMatch || input.confidence < 0.7)
  ) {
    return 'low'
  }

  if (weakMatch || input.confidence < 0.5) return 'low'
  return 'medium'
}

export function buildDarkwebFindingTitle(input: {
  category: DarkwebFindingCategory
  matchedTerm: string
}) {
  switch (input.category) {
    case 'credential_exposure':
      return `Potential credential exposure for ${input.matchedTerm}`
    case 'brand_domain_mention':
      return `Dark web mention involving ${input.matchedTerm}`
    case 'employee_exposure':
      return `Employee exposure signal for ${input.matchedTerm}`
    case 'sensitive_document_exposure':
      return `Sensitive document exposure signal for ${input.matchedTerm}`
    case 'fraud_enabling_exposure':
      return `Fraud-enabling exposure involving ${input.matchedTerm}`
    case 'technical_exposure_correlation':
    default:
      return `Technical exposure correlation for ${input.matchedTerm}`
  }
}

import {
  buildDarkwebFindingTitle,
  confidenceFromValue,
  darkwebSignalFlags,
  inferDarkwebCategory,
  inferDarkwebSeverity,
  normalizeDarkwebTerm,
  normalizeDarkwebText,
  redactDarkwebEvidence,
} from './normalize'
import type {
  DarkwebFindingCategory,
  DarkwebFindingInput,
  DarkwebFindingRecord,
  DarkwebRawResultRecord,
  DarkwebSeedRecord,
  DarkwebSeedType,
  JsonRecord,
} from './types'

type MatchStrength = 'strong' | 'medium' | 'weak'

type SeedMatch = {
  seed: DarkwebSeedRecord
  reason: string
  strength: MatchStrength
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function clampConfidence(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))))
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function hasTextTerm(text: string, term: string) {
  if (!term) return false

  const escaped = escapeRegExp(term)
  return new RegExp(`(^|[^a-z0-9@._-])${escaped}($|[^a-z0-9@._-])`, 'i').test(text)
}

function hasDomainTerm(text: string, domain: string) {
  if (!domain) return false

  const escaped = escapeRegExp(domain)
  return new RegExp(`(^|[^a-z0-9.-])${escaped}($|[^a-z0-9.-])`, 'i').test(text)
}

function payloadText(payload: JsonRecord) {
  return [
    asString(payload.title),
    asString(payload.email),
    asString(payload.domain),
    asString(payload.brand),
    asString(payload.username),
    asString(payload.person),
    asString(payload.role),
    asString(payload.event_type),
    asString(payload.category),
    asString(payload.breach_name),
    asString(payload.dataset),
    asString(payload.service),
    asString(payload.snippet),
    asString(payload.description),
    asString(payload.url),
  ]
    .filter(Boolean)
    .join(' ')
}

function emailDomain(value: string) {
  const normalized = value.trim().toLowerCase()
  const at = normalized.lastIndexOf('@')
  if (at <= 0) return null
  return normalized.slice(at + 1) || null
}

function normalizedPayloadValue(payload: JsonRecord, seedType: DarkwebSeedType) {
  if (seedType === 'email') return normalizeDarkwebTerm(seedType, asString(payload.email))
  if (seedType === 'domain') return normalizeDarkwebTerm(seedType, asString(payload.domain))
  if (seedType === 'brand') return normalizeDarkwebTerm(seedType, asString(payload.brand))
  if (seedType === 'username') return normalizeDarkwebTerm(seedType, asString(payload.username))
  if (seedType === 'person') return normalizeDarkwebTerm(seedType, asString(payload.person))
  if (seedType === 'key_role') return normalizeDarkwebTerm(seedType, asString(payload.role))
  if (seedType === 'phone') return normalizeDarkwebTerm(seedType, asString(payload.phone))
  return ''
}

function isEmailPatternMatch(seed: DarkwebSeedRecord, payload: JsonRecord, text: string) {
  if (seed.seed_type !== 'email_pattern') return null

  const domain = seed.normalized_term.replace(/^\*@/, '')
  if (!domain) return null

  const payloadEmailDomain = emailDomain(asString(payload.email))
  if (payloadEmailDomain === domain) return 'medium'

  return text.includes(`@${domain}`) ? 'medium' : null
}

function textMatchStrength(
  seed: DarkwebSeedRecord,
  text: string,
  hasHighSignalContext: boolean,
): MatchStrength | null {
  const term = seed.normalized_term

  if (!term) return null

  switch (seed.seed_type) {
    case 'email':
      return hasTextTerm(text, term) ? 'strong' : null
    case 'domain':
    case 'subdomain':
      if (term.length < 6 || !hasDomainTerm(text, term)) return null
      return hasHighSignalContext ? 'medium' : null
    case 'brand':
      if (term.length < 5 || !hasTextTerm(text, term)) return null
      return hasHighSignalContext ? 'medium' : null
    case 'person':
    case 'key_role':
      if (term.length < 5 || !hasTextTerm(text, term)) return null
      return hasHighSignalContext ? 'medium' : null
    case 'username':
      if (term.length < 5 || !hasTextTerm(text, term)) return null
      return hasHighSignalContext ? 'medium' : null
    case 'phone':
      if (term.replace(/\D/g, '').length < 7) return null
      return text.includes(term) && hasHighSignalContext ? 'medium' : null
    case 'document_name':
    case 'distinctive_string':
      if (term.length < 8 || !hasTextTerm(text, term)) return null
      return hasHighSignalContext ? 'strong' : 'medium'
    case 'email_pattern':
    default:
      return null
  }
}

function seedPriority(seedType: DarkwebSeedType) {
  switch (seedType) {
    case 'email':
      return 1
    case 'username':
      return 2
    case 'phone':
      return 3
    case 'email_pattern':
      return 4
    case 'document_name':
    case 'distinctive_string':
      return 5
    case 'domain':
    case 'subdomain':
      return 6
    case 'person':
    case 'key_role':
      return 7
    case 'brand':
    default:
      return 8
  }
}

function strengthRank(strength: MatchStrength) {
  if (strength === 'strong') return 3
  if (strength === 'medium') return 2
  return 1
}

function selectBestMatches(matches: SeedMatch[]) {
  const hasIdentityMatch = matches.some(
    (match) =>
      match.strength !== 'weak' &&
      ['email', 'email_pattern', 'username', 'phone'].includes(match.seed.seed_type),
  )
  const bestBySeed = new Map<string, SeedMatch>()

  for (const match of matches) {
    if (
      hasIdentityMatch &&
      ['brand', 'domain', 'subdomain'].includes(match.seed.seed_type)
    ) {
      continue
    }

    const key = `${match.seed.seed_type}:${match.seed.normalized_term}`
    const existing = bestBySeed.get(key)

    if (!existing || strengthRank(match.strength) > strengthRank(existing.strength)) {
      bestBySeed.set(key, match)
    }
  }

  return [...bestBySeed.values()]
    .sort((a, b) => {
      const strengthDelta = strengthRank(b.strength) - strengthRank(a.strength)
      if (strengthDelta !== 0) return strengthDelta
      return seedPriority(a.seed.seed_type) - seedPriority(b.seed.seed_type)
    })
    .slice(0, 5)
}

function findSeedMatches(rawResult: DarkwebRawResultRecord, seeds: DarkwebSeedRecord[]) {
  const payload = rawResult.raw_payload ?? {}
  const text = normalizeDarkwebText(
    [rawResult.normalized_text ?? '', payloadText(payload)].filter(Boolean).join(' '),
  )
  const signals = darkwebSignalFlags({
    sourceType: rawResult.source_type,
    sourceName: rawResult.source_name,
    eventType: asString(payload.event_type),
    payload,
  })
  const hasHighSignalContext =
    signals.credentialContext || signals.fraudContext || signals.documentContext
  const matches: SeedMatch[] = []

  for (const seed of seeds) {
    const directPayloadValue = normalizedPayloadValue(payload, seed.seed_type)

    if (directPayloadValue && directPayloadValue === seed.normalized_term) {
      matches.push({ seed, reason: 'payload_exact', strength: 'strong' })
      continue
    }

    const emailPatternStrength = isEmailPatternMatch(seed, payload, text)

    if (emailPatternStrength) {
      matches.push({
        seed,
        reason: 'email_pattern',
        strength: emailPatternStrength,
      })
      continue
    }

    const strength = textMatchStrength(seed, text, hasHighSignalContext)

    if (strength) {
      matches.push({ seed, reason: 'normalized_text', strength })
    }
  }

  return selectBestMatches(matches)
}

function criticalityFromSeed(seed: DarkwebSeedRecord) {
  return typeof seed.metadata.criticality === 'string'
    ? seed.metadata.criticality
    : null
}

function fingerprintSourceKey(rawResult: DarkwebRawResultRecord) {
  const payload = rawResult.raw_payload ?? {}
  const sourceKey =
    asString(payload.breach_id) ||
    asString(payload.breach_name) ||
    asString(payload.dataset) ||
    asString(payload.url) ||
    rawResult.raw_reference ||
    rawResult.raw_hash ||
    rawResult.id

  return normalizeDarkwebText(sourceKey).slice(0, 160)
}

function buildFingerprint(
  rawResult: DarkwebRawResultRecord,
  seed: DarkwebSeedRecord,
  category: DarkwebFindingCategory,
) {
  return [
    category,
    seed.seed_type,
    seed.normalized_term,
    fingerprintSourceKey(rawResult),
  ].join(':')
}

function confidenceForMatch(input: {
  rawResult: DarkwebRawResultRecord
  match: SeedMatch
  category: DarkwebFindingCategory
  credentialSecret: boolean
}) {
  const payload = input.rawResult.raw_payload ?? {}
  const seedConfidence = confidenceFromValue(input.match.seed.confidence, 0.65)
  const payloadConfidence = confidenceFromValue(payload.confidence, 0.65)
  const strengthBase =
    input.match.strength === 'strong'
      ? 0.82
      : input.match.strength === 'medium'
        ? 0.66
        : 0.45
  let confidence =
    seedConfidence * 0.45 + payloadConfidence * 0.3 + strengthBase * 0.25

  confidence = Math.max(confidence, strengthBase)

  if (input.category === 'credential_exposure') {
    confidence = Math.max(confidence, input.credentialSecret ? 0.9 : 0.82)
  }

  const brandDomainTextMatch =
    ['brand', 'domain', 'subdomain'].includes(input.match.seed.seed_type) &&
    input.match.reason === 'normalized_text'

  if (input.category === 'fraud_enabling_exposure' && !brandDomainTextMatch) {
    confidence = Math.max(confidence, 0.76)
  }

  if (brandDomainTextMatch) {
    confidence = Math.min(confidence, 0.62)
  }

  if (input.match.strength === 'weak') {
    confidence = Math.min(confidence, 0.55)
  }

  return clampConfidence(confidence)
}

function reviewGateForFinding(input: {
  category: DarkwebFindingCategory
  confidence: number
  match: SeedMatch
  credentialSecret: boolean
}) {
  if (input.category === 'brand_domain_mention') {
    return {
      requiresReview: true,
      reason: 'brand_or_domain_context_requires_confirmation',
    }
  }

  if (input.match.seed.seed_type === 'email_pattern') {
    return {
      requiresReview: true,
      reason: 'derived_email_pattern_requires_confirmation',
    }
  }

  if (input.match.strength !== 'strong' || input.confidence < 0.8) {
    return {
      requiresReview: true,
      reason: 'non_exact_or_lower_confidence_match',
    }
  }

  if (input.category === 'credential_exposure' && input.credentialSecret) {
    return {
      requiresReview: false,
      reason: 'high_signal_credential_match',
    }
  }

  return {
    requiresReview: true,
    reason: 'analyst_review_before_action',
  }
}

function reasonLabel(reason: string) {
  if (reason === 'payload_exact') return 'exact payload field'
  if (reason === 'email_pattern') return 'derived email-domain pattern'
  return 'normalized evidence text'
}

function normalizeFinding(
  rawResult: DarkwebRawResultRecord,
  match: SeedMatch,
): DarkwebFindingInput {
  const payload = rawResult.raw_payload ?? {}
  const signals = darkwebSignalFlags({
    sourceType: rawResult.source_type,
    sourceName: rawResult.source_name,
    eventType: asString(payload.event_type),
    payload,
  })
  const category = inferDarkwebCategory({
    sourceType: rawResult.source_type,
    sourceName: rawResult.source_name,
    eventType: asString(payload.event_type),
    matchedEntityType: match.seed.seed_type,
    payload,
  })
  const confidence = confidenceForMatch({
    rawResult,
    match,
    category,
    credentialSecret: signals.credentialSecret,
  })
  const severity = inferDarkwebSeverity({
    category,
    confidence,
    matchedEntityType: match.seed.seed_type,
    criticality: criticalityFromSeed(match.seed),
    credentialSecret: signals.credentialSecret,
    fraudContext: signals.fraudContext,
    matchStrength: match.strength,
  })
  const reviewGate = reviewGateForFinding({
    category,
    confidence,
    match,
    credentialSecret: signals.credentialSecret,
  })
  const evidenceSource =
    asString(payload.snippet) ||
    asString(payload.description) ||
    rawResult.normalized_text ||
    rawResult.raw_reference ||
    null

  return {
    rawResultId: rawResult.id,
    fingerprint: buildFingerprint(rawResult, match.seed, category),
    sourceType: rawResult.source_type,
    sourceName: rawResult.source_name,
    category,
    matchedTerm: match.seed.term,
    matchedEntityType: match.seed.seed_type,
    confidence,
    severity,
    title: buildDarkwebFindingTitle({
      category,
      matchedTerm: match.seed.term,
    }),
    summary: `Matched ${match.seed.seed_type} seed through ${reasonLabel(match.reason)} from ${rawResult.source_name ?? rawResult.source_type}. Confidence ${Math.round(confidence * 100)}%; review gate: ${reviewGate.reason}.`,
    evidenceSnippet: redactDarkwebEvidence(evidenceSource),
    rawReference: rawResult.raw_reference,
    requiresReview: reviewGate.requiresReview,
    status: 'new',
    metadata: {
      seed_id: match.seed.id,
      match_reason: match.reason,
      match_strength: match.strength,
      review_reason: reviewGate.reason,
      credential_context: signals.credentialContext,
      credential_secret_present: signals.credentialSecret,
      fraud_context: signals.fraudContext,
      document_context: signals.documentContext,
      raw_hash: rawResult.raw_hash,
    },
  }
}

export function normalizeDarkwebFindingsFromRawResults(params: {
  rawResults: DarkwebRawResultRecord[]
  seeds: DarkwebSeedRecord[]
}) {
  const findingsByFingerprint = new Map<string, DarkwebFindingInput>()
  const matchedRawResultIds = new Set<string>()

  for (const rawResult of params.rawResults) {
    const matches = findSeedMatches(rawResult, params.seeds)

    if (matches.length === 0) continue

    matchedRawResultIds.add(rawResult.id)

    for (const match of matches) {
      const finding = normalizeFinding(rawResult, match)
      const key = finding.fingerprint ?? `${finding.rawResultId}:${finding.matchedTerm}`
      const existing = findingsByFingerprint.get(key)

      if (!existing || finding.confidence > existing.confidence) {
        findingsByFingerprint.set(key, finding)
      }
    }
  }

  return {
    findings: [...findingsByFingerprint.values()],
    matchedRawResultIds,
  }
}

export async function matchAndPersistDarkwebFindings(params: {
  runId: string
  organizationId: string
  assessmentId?: string | null
  rawResults: DarkwebRawResultRecord[]
  seeds: DarkwebSeedRecord[]
}): Promise<DarkwebFindingRecord[]> {
  const { findings, matchedRawResultIds } = normalizeDarkwebFindingsFromRawResults({
    rawResults: params.rawResults,
    seeds: params.seeds,
  })
  const { persistDarkwebFindings, updateDarkwebRawResultStatus } = await import(
    './repository'
  )

  const persisted = await persistDarkwebFindings({
    runId: params.runId,
    organizationId: params.organizationId,
    assessmentId: params.assessmentId ?? null,
    findings,
  })

  for (const rawResult of params.rawResults) {
    await updateDarkwebRawResultStatus({
      rawResultId: rawResult.id,
      status: matchedRawResultIds.has(rawResult.id) ? 'matched' : 'ignored',
    })
  }

  return persisted
}

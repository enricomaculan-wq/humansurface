import { normalizeRawIngestionInput, type DarkwebRawIngestionInput } from './ingest'
import { normalizeDarkwebFindingsFromRawResults } from './match'
import { normalizeDarkwebTerm } from './normalize'
import { calculateDarkwebScore } from './scoring'
import type {
  DarkwebFindingCategory,
  DarkwebFindingInput,
  DarkwebRawResultRecord,
  DarkwebRiskLevel,
  DarkwebScoreSummary,
  DarkwebSeedRecord,
  DarkwebSeedType,
  DarkwebSeverity,
} from './types'

type ExpectedFixtureOutcome = {
  findingCount: number
  category?: DarkwebFindingCategory
  severity?: DarkwebSeverity
  minConfidence?: number
  maxConfidence?: number
  requiresReview?: boolean
  maxScore?: number
  minScore?: number
  notes: string
}

export type DarkwebEvaluationFixture = {
  id: string
  label: string
  rawResult: DarkwebRawIngestionInput
  expected: ExpectedFixtureOutcome
}

export type DarkwebEvaluationFixtureResult = {
  fixture: DarkwebEvaluationFixture
  findings: DarkwebFindingInput[]
  score: DarkwebScoreSummary
  passed: boolean
  failures: string[]
}

export type DarkwebEvaluationResult = {
  seeds: DarkwebSeedRecord[]
  fixtures: DarkwebEvaluationFixtureResult[]
  aggregate: {
    findings: DarkwebFindingInput[]
    score: DarkwebScoreSummary
  }
  guards: {
    weakSignalPassed: boolean
    strongSignalPassed: boolean
    weakBrandScore: number
    strongCredentialFraudScore: number
  }
  passed: boolean
}

const EVALUATION_ORGANIZATION_ID = 'darkweb-evaluation-org'
const EVALUATION_ASSESSMENT_ID = 'darkweb-evaluation-assessment'
const EVALUATION_RUN_ID = 'darkweb-evaluation-run'
const EVALUATION_TIMESTAMP = '2026-04-27T00:00:00.000Z'

function seedRecord(input: {
  id: string
  seedType: DarkwebSeedType
  term: string
  confidence: number
  criticality?: string
}): DarkwebSeedRecord {
  return {
    id: input.id,
    run_id: EVALUATION_RUN_ID,
    assessment_id: EVALUATION_ASSESSMENT_ID,
    organization_id: EVALUATION_ORGANIZATION_ID,
    seed_type: input.seedType,
    term: input.term,
    normalized_term: normalizeDarkwebTerm(input.seedType, input.term),
    source: 'manual',
    confidence: input.confidence,
    metadata: {
      criticality: input.criticality ?? 'medium',
      evaluation_fixture: true,
    },
    created_at: EVALUATION_TIMESTAMP,
    updated_at: EVALUATION_TIMESTAMP,
  }
}

function rawResultRecord(
  fixture: DarkwebEvaluationFixture,
): DarkwebRawResultRecord {
  const normalized = normalizeRawIngestionInput(fixture.rawResult)

  return {
    id: `${fixture.id}-raw`,
    run_id: EVALUATION_RUN_ID,
    seed_id: normalized.seedId ?? null,
    assessment_id: EVALUATION_ASSESSMENT_ID,
    organization_id: EVALUATION_ORGANIZATION_ID,
    source_type: normalized.sourceType,
    source_name: normalized.sourceName ?? null,
    raw_reference: normalized.rawReference ?? null,
    raw_payload: normalized.rawPayload ?? {},
    normalized_text: normalized.normalizedText ?? null,
    raw_hash: normalized.rawHash ?? null,
    status: 'normalized',
    error_message: null,
    observed_at: normalized.observedAt ?? null,
    collected_at: EVALUATION_TIMESTAMP,
    created_at: EVALUATION_TIMESTAMP,
    updated_at: EVALUATION_TIMESTAMP,
  }
}

function scorableFinding(finding: DarkwebFindingInput) {
  return {
    category: finding.category,
    severity: finding.severity,
    confidence: finding.confidence,
    matched_entity_type: finding.matchedEntityType,
    requires_review: finding.requiresReview ?? true,
    metadata: finding.metadata,
  }
}

function hasAtLeastRiskLevel(actual: DarkwebRiskLevel, expected: DarkwebRiskLevel) {
  const rank: Record<DarkwebRiskLevel, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  }

  return rank[actual] >= rank[expected]
}

function evaluateExpectation(params: {
  fixture: DarkwebEvaluationFixture
  findings: DarkwebFindingInput[]
  score: DarkwebScoreSummary
}) {
  const { fixture, findings, score } = params
  const expected = fixture.expected
  const failures: string[] = []
  const primary = findings[0]

  if (findings.length !== expected.findingCount) {
    failures.push(
      `expected ${expected.findingCount} finding(s), got ${findings.length}`,
    )
  }

  if (expected.category && primary?.category !== expected.category) {
    failures.push(`expected category ${expected.category}, got ${primary?.category ?? 'none'}`)
  }

  if (expected.severity && primary?.severity !== expected.severity) {
    failures.push(`expected severity ${expected.severity}, got ${primary?.severity ?? 'none'}`)
  }

  if (
    typeof expected.minConfidence === 'number' &&
    (!primary || primary.confidence < expected.minConfidence)
  ) {
    failures.push(
      `expected confidence >= ${expected.minConfidence}, got ${primary?.confidence ?? 'none'}`,
    )
  }

  if (
    typeof expected.maxConfidence === 'number' &&
    primary &&
    primary.confidence > expected.maxConfidence
  ) {
    failures.push(
      `expected confidence <= ${expected.maxConfidence}, got ${primary.confidence}`,
    )
  }

  if (
    typeof expected.requiresReview === 'boolean' &&
    (primary?.requiresReview ?? true) !== expected.requiresReview
  ) {
    failures.push(
      `expected requiresReview ${expected.requiresReview}, got ${primary?.requiresReview ?? true}`,
    )
  }

  if (typeof expected.maxScore === 'number' && score.score > expected.maxScore) {
    failures.push(`expected score <= ${expected.maxScore}, got ${score.score}`)
  }

  if (typeof expected.minScore === 'number' && score.score < expected.minScore) {
    failures.push(`expected score >= ${expected.minScore}, got ${score.score}`)
  }

  return failures
}

export const DARKWEB_EVALUATION_SEEDS: DarkwebSeedRecord[] = [
  seedRecord({
    id: 'seed-email-alice',
    seedType: 'email',
    term: 'alice@humansurface.test',
    confidence: 0.95,
    criticality: 'critical',
  }),
  seedRecord({
    id: 'seed-brand-humansurface',
    seedType: 'brand',
    term: 'HumanSurface',
    confidence: 0.7,
  }),
  seedRecord({
    id: 'seed-domain-humansurface',
    seedType: 'domain',
    term: 'humansurface.test',
    confidence: 0.8,
  }),
  seedRecord({
    id: 'seed-fraud-username',
    seedType: 'username',
    term: 'humansurface-payroll',
    confidence: 0.85,
    criticality: 'high',
  }),
  seedRecord({
    id: 'seed-document-payroll',
    seedType: 'document_name',
    term: 'Board Payroll Forecast.xlsx',
    confidence: 0.85,
    criticality: 'high',
  }),
  seedRecord({
    id: 'seed-key-role-cfo',
    seedType: 'key_role',
    term: 'Chief Financial Officer',
    confidence: 0.9,
    criticality: 'high',
  }),
]

export const DARKWEB_EVALUATION_FIXTURES: DarkwebEvaluationFixture[] = [
  {
    id: 'credential-exposure',
    label: 'Credential exposure with password evidence',
    rawResult: {
      sourceType: 'credential_combo',
      sourceName: 'Internal fixture credential dump',
      rawReference: 'fixture:credential:alice',
      rawPayload: {
        event_type: 'credential_leak',
        breach_name: 'Example Stealer Logs',
        email: 'alice@humansurface.test',
        password: 'example-password',
        confidence: 0.95,
        snippet: 'alice@humansurface.test password: example-password',
      },
      observedAt: EVALUATION_TIMESTAMP,
    },
    expected: {
      findingCount: 1,
      category: 'credential_exposure',
      severity: 'critical',
      minConfidence: 0.9,
      requiresReview: false,
      minScore: 45,
      notes:
        'Exact email plus password evidence should create a high-confidence critical credential finding.',
    },
  },
  {
    id: 'weak-brand-mention',
    label: 'Weak brand mention without exposure context',
    rawResult: {
      sourceType: 'forum_post',
      sourceName: 'Internal fixture forum mention',
      rawReference: 'fixture:brand:weak',
      rawPayload: {
        title: 'Vendor discussion',
        snippet: 'Someone mentioned HumanSurface in a generic thread.',
        confidence: 0.6,
      },
      observedAt: EVALUATION_TIMESTAMP,
    },
    expected: {
      findingCount: 0,
      maxScore: 3,
      notes:
        'A plain brand mention without credential, fraud, or document context should be ignored.',
    },
  },
  {
    id: 'fraud-enabling-mention',
    label: 'Fraud-enabling marketplace signal',
    rawResult: {
      sourceType: 'marketplace_listing',
      sourceName: 'Internal fixture fraud marketplace',
      rawReference: 'fixture:fraud:payroll',
      rawPayload: {
        event_type: 'fraud_marketplace_listing',
        username: 'humansurface-payroll',
        confidence: 0.9,
        snippet:
          'Marketplace seller advertises invoice and payroll account takeover for humansurface-payroll.',
      },
      observedAt: EVALUATION_TIMESTAMP,
    },
    expected: {
      findingCount: 1,
      category: 'fraud_enabling_exposure',
      severity: 'high',
      minConfidence: 0.8,
      requiresReview: true,
      minScore: 20,
      notes:
        'A structured username match in marketplace/fraud context should materially affect risk.',
    },
  },
  {
    id: 'document-exposure',
    label: 'Sensitive document exposure',
    rawResult: {
      sourceType: 'document_index',
      sourceName: 'Internal fixture document cache',
      rawReference: 'fixture:document:payroll',
      rawPayload: {
        event_type: 'document_exposure',
        document_name: 'Board Payroll Forecast.xlsx',
        confidence: 0.82,
        snippet:
          'Confidential payroll spreadsheet Board Payroll Forecast.xlsx referenced in exposed cache.',
      },
      observedAt: EVALUATION_TIMESTAMP,
    },
    expected: {
      findingCount: 1,
      category: 'sensitive_document_exposure',
      severity: 'high',
      minConfidence: 0.8,
      requiresReview: true,
      minScore: 15,
      notes:
        'A distinctive document name in document context should become a reviewed high-severity finding.',
    },
  },
  {
    id: 'employee-linked-exposure',
    label: 'Employee-linked key role exposure',
    rawResult: {
      sourceType: 'employee_directory',
      sourceName: 'Internal fixture people exposure',
      rawReference: 'fixture:employee:cfo',
      rawPayload: {
        event_type: 'employee_exposure',
        person: 'Jordan Lee',
        role: 'Chief Financial Officer',
        confidence: 0.86,
        snippet:
          'Employee profile lists Jordan Lee, Chief Financial Officer, with contact instructions.',
      },
      observedAt: EVALUATION_TIMESTAMP,
    },
    expected: {
      findingCount: 1,
      category: 'employee_exposure',
      severity: 'high',
      minConfidence: 0.8,
      requiresReview: true,
      minScore: 12,
      notes:
        'A structured key-role match should be visible to admins but still require analyst review.',
    },
  },
]

export function evaluateDarkwebQualityFixtures(params?: {
  seeds?: DarkwebSeedRecord[]
  fixtures?: DarkwebEvaluationFixture[]
}): DarkwebEvaluationResult {
  const seeds = params?.seeds ?? DARKWEB_EVALUATION_SEEDS
  const fixtures = params?.fixtures ?? DARKWEB_EVALUATION_FIXTURES
  const results = fixtures.map((fixture): DarkwebEvaluationFixtureResult => {
    const rawResult = rawResultRecord(fixture)
    const { findings } = normalizeDarkwebFindingsFromRawResults({
      rawResults: [rawResult],
      seeds,
    })
    const score = calculateDarkwebScore(findings.map(scorableFinding))
    const failures = evaluateExpectation({ fixture, findings, score })

    return {
      fixture,
      findings,
      score,
      passed: failures.length === 0,
      failures,
    }
  })
  const aggregateRawResults = fixtures.map(rawResultRecord)
  const aggregateFindings = normalizeDarkwebFindingsFromRawResults({
    rawResults: aggregateRawResults,
    seeds,
  }).findings
  const aggregateScore = calculateDarkwebScore(aggregateFindings.map(scorableFinding))
  const weakBrandScore =
    results.find((result) => result.fixture.id === 'weak-brand-mention')?.score.score ?? 0
  const strongCredentialFraudFindings = results
    .filter((result) =>
      ['credential-exposure', 'fraud-enabling-mention'].includes(result.fixture.id),
    )
    .flatMap((result) => result.findings)
  const strongCredentialFraudScore = calculateDarkwebScore(
    strongCredentialFraudFindings.map(scorableFinding),
  ).score
  const weakSignalPassed = weakBrandScore <= 3
  const strongSignalPassed =
    strongCredentialFraudScore >= 60 &&
    hasAtLeastRiskLevel(
      calculateDarkwebScore(strongCredentialFraudFindings.map(scorableFinding)).riskLevel,
      'high',
    )

  return {
    seeds,
    fixtures: results,
    aggregate: {
      findings: aggregateFindings,
      score: aggregateScore,
    },
    guards: {
      weakSignalPassed,
      strongSignalPassed,
      weakBrandScore,
      strongCredentialFraudScore,
    },
    passed:
      results.every((result) => result.passed) &&
      weakSignalPassed &&
      strongSignalPassed,
  }
}

export function assertDarkwebQualityFixtures() {
  const evaluation = evaluateDarkwebQualityFixtures()
  const failures = [
    ...evaluation.fixtures.flatMap((result) =>
      result.failures.map((failure) => `${result.fixture.id}: ${failure}`),
    ),
    ...(evaluation.guards.weakSignalPassed
      ? []
      : [
          `weak-brand guard failed: score ${evaluation.guards.weakBrandScore} should stay <= 3`,
        ]),
    ...(evaluation.guards.strongSignalPassed
      ? []
      : [
          `strong-signal guard failed: credential+fraud score ${evaluation.guards.strongCredentialFraudScore} should be high-risk material`,
        ]),
  ]

  if (failures.length > 0) {
    throw new Error(`Dark web quality fixture evaluation failed:\n${failures.join('\n')}`)
  }

  return evaluation
}

import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  calculateAssessmentScores,
  calculatePersonScores,
  calculateCombinedScores,
} from '@/lib/scoring'
import { searchExternalPublicSources } from './external-search'
import { extractExternalSignals } from './external-extract'

type OrganizationRow = {
  id: string
  name: string
  domain: string
  industry: string | null
}

type InsertedPersonRow = {
  id: string
  email: string | null
  full_name: string | null
  role_title: string
}

type ScannerPerson = {
  fullName: string | null
  roleTitle: string
  department: string | null
  email: string | null
  isKeyPerson: boolean
}

type ExternalFindingRow = {
  id: string
  person_id: string | null
  title: string
  description: string | null
  severity: string
  category: string
}

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? null
}

function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ''
}

function buildScannerPersonSignature(person: ScannerPerson) {
  return `${normalizeText(person.fullName)}|${normalizeText(person.roleTitle)}|${normalizeEmail(person.email) ?? ''}`
}

function buildLooseScannerPersonSignature(person: ScannerPerson) {
  return `${normalizeText(person.fullName)}|${normalizeText(person.roleTitle)}`
}

function buildInsertedPersonSignature(person: InsertedPersonRow) {
  return `${normalizeText(person.full_name)}|${normalizeText(person.role_title)}|${normalizeEmail(person.email) ?? ''}`
}

function buildLooseInsertedPersonSignature(person: InsertedPersonRow) {
  return `${normalizeText(person.full_name)}|${normalizeText(person.role_title)}`
}

function riskFromOverall(score: number): 'low' | 'medium' | 'high' {
  if (score >= 70) return 'high'
  if (score >= 35) return 'medium'
  return 'low'
}

function dedupeScannedPeopleAgainstExisting(
  scannedPeople: ScannerPerson[],
  existingPeople: InsertedPersonRow[],
) {
  const existingBySignature = new Map<string, InsertedPersonRow>()
  const existingByLooseSignature = new Map<string, InsertedPersonRow>()
  const existingByEmail = new Map<string, InsertedPersonRow>()

  for (const person of existingPeople) {
    existingBySignature.set(buildInsertedPersonSignature(person), person)
    existingByLooseSignature.set(buildLooseInsertedPersonSignature(person), person)

    const email = normalizeEmail(person.email)
    if (email) {
      existingByEmail.set(email, person)
    }
  }

  const uniqueToInsert: ScannerPerson[] = []
  const matchedExisting: InsertedPersonRow[] = []
  const matchedIds = new Set<string>()

  for (const person of scannedPeople) {
    const signature = buildScannerPersonSignature(person)
    const looseSignature = buildLooseScannerPersonSignature(person)
    const email = normalizeEmail(person.email)

    const match =
      (email ? existingByEmail.get(email) ?? null : null) ||
      existingBySignature.get(signature) ||
      existingByLooseSignature.get(looseSignature) ||
      null

    if (match) {
      if (!matchedIds.has(match.id)) {
        matchedIds.add(match.id)
        matchedExisting.push(match)
      }
    } else {
      uniqueToInsert.push(person)
    }
  }

  return {
    uniqueToInsert,
    matchedExisting,
  }
}

export async function runExternalPublicScanForAssessment(
  assessmentId: string,
  organizationId: string,
) {
  const { data: orgData, error: orgError } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .maybeSingle()

  if (orgError) {
    throw new Error(`organizations read failed: ${orgError.message}`)
  }

  if (!orgData) {
    throw new Error('Organization not found.')
  }

  const organization = orgData as OrganizationRow

  const { data: existingPeopleData, error: existingPeopleError } = await supabaseAdmin
    .from('people')
    .select('id, email, full_name, role_title')
    .eq('organization_id', organization.id)

  if (existingPeopleError) {
    throw new Error(`existing people read failed: ${existingPeopleError.message}`)
  }

  const existingPeople = (existingPeopleData ?? []) as InsertedPersonRow[]

  const externalSearch = await searchExternalPublicSources({
    organizationId: organization.id,
    organizationName: organization.name,
    domain: organization.domain,
  })

  const externalResults = externalSearch.results
  const extracted = await extractExternalSignals(externalResults)

  const { uniqueToInsert, matchedExisting } = dedupeScannedPeopleAgainstExisting(
    extracted.people,
    existingPeople,
  )

  let insertedPeople: InsertedPersonRow[] = []

  if (uniqueToInsert.length > 0) {
    const { data: peopleData, error: peopleError } = await supabaseAdmin
      .from('people')
      .insert(
        uniqueToInsert.map((person) => ({
          organization_id: organization.id,
          full_name: person.fullName,
          role_title: person.roleTitle,
          department: person.department,
          email: person.email,
          is_key_person: person.isKeyPerson,
          evidence_origin: 'external',
          source_url: null,
          confidence: 0.7,
        })),
      )
      .select('id, email, full_name, role_title')

    if (peopleError) {
      throw new Error(`external people insert failed: ${peopleError.message}`)
    }

    insertedPeople = (peopleData ?? []) as InsertedPersonRow[]
  }

  const allKnownPeople = [...existingPeople, ...matchedExisting, ...insertedPeople]

  const personIdByEmail = new Map<string, string>()
  const personIdBySignature = new Map<string, string>()
  const personIdByLooseSignature = new Map<string, string>()

  for (const person of allKnownPeople) {
    const email = normalizeEmail(person.email)
    if (email) {
      personIdByEmail.set(email, person.id)
    }

    personIdBySignature.set(buildInsertedPersonSignature(person), person.id)
    personIdByLooseSignature.set(buildLooseInsertedPersonSignature(person), person.id)
  }

  let insertedFindings: ExternalFindingRow[] = []

  if (extracted.findings.length > 0) {
    const findingsPayload = extracted.findings.map((finding) => {
      const normalizedLinkedEmail = normalizeEmail(finding.linkedPersonEmail)
      const normalizedLinkedSignature = finding.linkedPersonSignature
        ? finding.linkedPersonSignature
            .split('|')
            .map((part) => part.trim().toLowerCase())
            .join('|')
        : null

      let personId =
        (normalizedLinkedEmail
          ? personIdByEmail.get(normalizedLinkedEmail) ?? null
          : null) ||
        (normalizedLinkedSignature
          ? personIdBySignature.get(normalizedLinkedSignature) ?? null
          : null)

      if (!personId && normalizedLinkedSignature) {
        const parts = normalizedLinkedSignature.split('|')
        const looseSignature = `${parts[0] ?? ''}|${parts[1] ?? ''}`
        personId = personIdByLooseSignature.get(looseSignature) ?? null
      }

      let sourceDomain: string | null = null
      try {
        sourceDomain = finding.sourceUrl ? new URL(finding.sourceUrl).hostname : null
      } catch {
        sourceDomain = null
      }

      return {
        assessment_id: assessmentId,
        person_id: personId,
        title: finding.title,
        description: finding.description,
        severity: finding.severity,
        category: finding.category,
        source_url: finding.sourceUrl,
        source_title: finding.sourceTitle,
        source_type: finding.sourceType,
        evidence_origin: 'external',
        source_domain: sourceDomain,
        confidence: 0.7,
      }
    })

    const { data: findingsData, error: findingsError } = await supabaseAdmin
      .from('findings')
      .insert(findingsPayload)
      .select('id, person_id, title, description, severity, category')

    if (findingsError) {
      throw new Error(`external findings insert failed: ${findingsError.message}`)
    }

    insertedFindings = (findingsData ?? []) as ExternalFindingRow[]
  }

  const externalScores = calculateAssessmentScores(insertedFindings)
  const personScores = calculatePersonScores(insertedFindings)

  const { data: existingWebsiteScoresData, error: existingWebsiteScoresError } =
    await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('assessment_id', assessmentId)
      .is('person_id', null)

  if (existingWebsiteScoresError) {
    throw new Error(`website scores read failed: ${existingWebsiteScoresError.message}`)
  }

  const existingWebsiteScores = (existingWebsiteScoresData ?? []) as Array<{
    score_type: string
    score_value: number
    risk_level: string
    score_scope?: string | null
  }>

  const websiteScoresOnly = existingWebsiteScores.filter(
    (score) =>
      (score.score_scope ?? 'website') !== 'external' &&
      (score.score_scope ?? 'website') !== 'combined',
  )

  function pickScore(type: string) {
    return websiteScoresOnly.find((s) => s.score_type === type)?.score_value ?? 0
  }

  function pickRisk(type: string): 'low' | 'medium' | 'high' {
    const value = websiteScoresOnly.find((s) => s.score_type === type)?.risk_level
    return value === 'high' || value === 'medium' ? value : 'low'
  }

  const websiteScoreSummary = {
    impersonationScore: pickScore('impersonation_risk'),
    impersonationRiskLevel: pickRisk('impersonation_risk'),
    financeScore: pickScore('finance_fraud_risk'),
    financeRiskLevel: pickRisk('finance_fraud_risk'),
    hrScore: pickScore('hr_social_engineering_risk'),
    hrRiskLevel: pickRisk('hr_social_engineering_risk'),
    overallScore: pickScore('overall'),
    overallRiskLevel: pickRisk('overall'),
  }

  const combinedScores = calculateCombinedScores({
    website: websiteScoreSummary,
    external: externalScores,
  })

  const scoresPayload = [
    {
      assessment_id: assessmentId,
      person_id: null,
      score_type: 'impersonation_risk',
      score_value: externalScores.impersonationScore,
      risk_level: externalScores.impersonationRiskLevel,
      reason_summary: 'Calculated from external public exposure findings.',
      score_scope: 'external',
    },
    {
      assessment_id: assessmentId,
      person_id: null,
      score_type: 'finance_fraud_risk',
      score_value: externalScores.financeScore,
      risk_level: externalScores.financeRiskLevel,
      reason_summary: 'Calculated from external public exposure findings.',
      score_scope: 'external',
    },
    {
      assessment_id: assessmentId,
      person_id: null,
      score_type: 'hr_social_engineering_risk',
      score_value: externalScores.hrScore,
      risk_level: externalScores.hrRiskLevel,
      reason_summary: 'Calculated from external public exposure findings.',
      score_scope: 'external',
    },
    {
      assessment_id: assessmentId,
      person_id: null,
      score_type: 'overall',
      score_value: externalScores.overallScore,
      risk_level: externalScores.overallRiskLevel,
      reason_summary: 'Average of the three primary external score dimensions.',
      score_scope: 'external',
    },

    {
      assessment_id: assessmentId,
      person_id: null,
      score_type: 'impersonation_risk',
      score_value: combinedScores.impersonationScore,
      risk_level: combinedScores.impersonationRiskLevel,
      reason_summary: 'Weighted combination of website and external exposure scores.',
      score_scope: 'combined',
    },
    {
      assessment_id: assessmentId,
      person_id: null,
      score_type: 'finance_fraud_risk',
      score_value: combinedScores.financeScore,
      risk_level: combinedScores.financeRiskLevel,
      reason_summary: 'Weighted combination of website and external exposure scores.',
      score_scope: 'combined',
    },
    {
      assessment_id: assessmentId,
      person_id: null,
      score_type: 'hr_social_engineering_risk',
      score_value: combinedScores.hrScore,
      risk_level: combinedScores.hrRiskLevel,
      reason_summary: 'Weighted combination of website and external exposure scores.',
      score_scope: 'combined',
    },
    {
      assessment_id: assessmentId,
      person_id: null,
      score_type: 'overall',
      score_value: combinedScores.overallScore,
      risk_level: combinedScores.overallRiskLevel,
      reason_summary: 'Weighted combination of website and external exposure scores.',
      score_scope: 'combined',
    },

    ...personScores.map((item) => ({
      assessment_id: assessmentId,
      person_id: item.personId,
      score_type: 'person_overall_risk',
      score_value: item.overallScore,
      risk_level: item.overallRiskLevel,
      reason_summary: item.reasonSummary,
      score_scope: 'external',
    })),
  ]

  const { error: scoreInsertError } = await supabaseAdmin
    .from('scores')
    .insert(scoresPayload)

  if (scoreInsertError) {
    throw new Error(`external scores insert failed: ${scoreInsertError.message}`)
  }

  const { data: assessmentRow } = await supabaseAdmin
    .from('assessments')
    .select('scan_diagnostics')
    .eq('id', assessmentId)
    .maybeSingle()

  const previousDiagnostics =
    (assessmentRow?.scan_diagnostics as Record<string, unknown> | null) ?? {}

  const externalDiagnostics: Record<string, unknown> = {
    ...previousDiagnostics,
    externalSourcesScanned: externalResults.length,
    externalSignalsAccepted: extracted.signals.length,
    externalPeopleDetected: extracted.people.length,
    externalPeopleInserted: insertedPeople.length,
    externalPeopleMatchedExisting: matchedExisting.length,
    externalFindingsInserted: insertedFindings.length,
    externalFindingsLinkedToPeople: insertedFindings.filter((f) => !!f.person_id).length,
    externalPersonScoresGenerated: personScores.length,
    externalCompletedAt: new Date().toISOString(),
    externalSearchDebug: externalSearch.debug,
  }

  const { error: updateAssessmentError } = await supabaseAdmin
    .from('assessments')
    .update({
      scan_diagnostics: externalDiagnostics,
    })
    .eq('id', assessmentId)

  if (updateAssessmentError) {
    throw new Error(`assessment external diagnostics update failed: ${updateAssessmentError.message}`)
  }

  return {
    assessmentId,
    organizationId: organization.id,
    externalSourcesScanned: externalResults.length,
    externalSignalsAccepted: extracted.signals.length,
    externalPeopleDetected: extracted.people.length,
    externalPeopleInserted: insertedPeople.length,
    externalPeopleMatchedExisting: matchedExisting.length,
    externalFindingsInserted: insertedFindings.length,
    externalFindingsLinkedToPeople: insertedFindings.filter((f) => !!f.person_id).length,
    externalPersonScoresGenerated: personScores.length,
    externalOverallScore: externalScores.overallScore,
    externalOverallRiskLevel: riskFromOverall(externalScores.overallScore),
    combinedOverallScore: combinedScores.overallScore,
    combinedOverallRiskLevel: riskFromOverall(combinedScores.overallScore),
  }
}
import { supabaseAdmin } from '@/lib/supabase-admin'
import { discoverRelevantUrls } from './discovery'
import { extractSignalsAttempt } from './extract'
import { extractSignalsFromPdfUrl } from './pdf'
import { classifySignals } from './classify'
import { calculateAssessmentScores, calculatePersonScores } from '@/lib/scoring'
import { syncDiscoveredAssets } from '@/lib/exposure/sync-discovered-assets'

type OrganizationRow = {
  id: string
  name: string
  domain: string
  industry: string | null
}

type FindingRow = {
  id: string
  person_id: string | null
  title: string
  description: string | null
  severity: string
  category: string
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

type ScannerFinding = {
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  category:
    | 'general'
    | 'email_exposure'
    | 'org_visibility'
    | 'role_visibility'
    | 'social_engineering_context'
    | 'impersonation'
  linkedPersonEmail?: string | null
  linkedPersonSignature?: string | null
  sourceUrl: string | null
  sourceTitle: string | null
  sourceType: 'html' | 'pdf' | 'fallback'
}

const HTML_SIGNAL_TIMEOUT_MS = 18_000
const PDF_SIGNAL_TIMEOUT_MS = 25_000
const DISCOVERY_TIMEOUT_MS = 25_000
const SCAN_FAILSAFE_TIMEOUT_MS = 180_000

function riskFromOverall(score: number): 'low' | 'medium' | 'high' {
  if (score >= 70) return 'high'
  if (score >= 35) return 'medium'
  return 'low'
}

function isPdfUrl(url: string) {
  return url.toLowerCase().endsWith('.pdf')
}

function isLikelyValidUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function isSpamLikeUrl(url: string) {
  const lower = url.toLowerCase()

  return [
    'bonus',
    'casino',
    'deposito',
    'slot',
    'bet',
    'scommesse',
    'free-spin',
    'free-spins',
    'apk',
    'volna',
    'luckyadda',
    'gnbet',
    'intellectbet',
    'bucuresti',
    'palaces',
    'play-your-bet',
    'hyper-frais',
    'dg-bonus',
    'site-bonus',
    'tsi-bonus',
    'porn',
    'levitra',
  ].some((term) => lower.includes(term))
}

function isLikelyIrrelevantArticle(url: string) {
  const lower = url.toLowerCase()

  const isNewsLike =
    lower.includes('/news') ||
    lower.includes('/media') ||
    lower.includes('/press') ||
    lower.includes('/blog')

  const hasCorporateSignals =
    lower.includes('about') ||
    lower.includes('chi-siamo') ||
    lower.includes('team') ||
    lower.includes('leadership') ||
    lower.includes('management') ||
    lower.includes('company') ||
    lower.includes('contact') ||
    lower.includes('contacts') ||
    lower.includes('contatti') ||
    lower.includes('careers') ||
    lower.includes('jobs') ||
    lower.includes('people') ||
    lower.includes('staff') ||
    lower.includes('board') ||
    lower.includes('investors') ||
    lower.includes('governance') ||
    lower.includes('organization') ||
    lower.includes('organizzazione') ||
    lower.includes('certificazioni') ||
    lower.includes('certifications') ||
    lower.includes('private-label')

  return isNewsLike && !hasCorporateSignals
}

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? null
}

function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ''
}

function buildPersonSignature(person: ScannerPerson) {
  return `${normalizeText(person.fullName)}|${normalizeText(person.roleTitle)}|${normalizeEmail(person.email) ?? ''}`
}

function buildInsertedPersonSignature(person: InsertedPersonRow) {
  return `${normalizeText(person.full_name)}|${normalizeText(person.role_title)}|${normalizeEmail(person.email) ?? ''}`
}

function buildLooseInsertedPersonSignature(person: InsertedPersonRow) {
  return `${normalizeText(person.full_name)}|${normalizeText(person.role_title)}`
}

function buildLooseScannerPersonSignature(person: ScannerPerson) {
  return `${normalizeText(person.fullName)}|${normalizeText(person.roleTitle)}`
}

function normalizeSignature(signature: string) {
  return signature
    .split('|')
    .map((part) => part.trim().toLowerCase())
    .join('|')
}

function buildPersonFirstFallbackFindings(
  people: ScannerPerson[],
  extractedSignals: Array<{ url: string; title: string }>,
): ScannerFinding[] {
  const seen = new Set<string>()
  const firstSource = extractedSignals[0]
  const personFindings: ScannerFinding[] = []

  for (const person of people) {
    const signature = buildPersonSignature(person)

    const finding: ScannerFinding = {
      title: `Public role visibility: ${person.roleTitle}`,
      description: `${person.fullName ?? 'A publicly visible person'} is associated with the role "${person.roleTitle}". Visible role attribution can support impersonation or targeted social engineering.`,
      severity:
        person.isKeyPerson ||
        /ceo|cfo|coo|cto|founder|director|managing director|president|board/i.test(person.roleTitle)
          ? 'high'
          : 'medium',
      category:
        person.department === 'HR'
          ? 'social_engineering_context'
          : person.department === 'Finance'
            ? 'impersonation'
            : 'role_visibility',
      linkedPersonEmail: person.email ?? null,
      linkedPersonSignature: signature,
      sourceUrl: firstSource?.url ?? null,
      sourceTitle: firstSource?.title ?? null,
      sourceType: 'fallback',
    }

    const key = `${finding.title}|${finding.category}|${finding.linkedPersonSignature ?? ''}`
    if (!seen.has(key)) {
      seen.add(key)
      personFindings.push(finding)
    }
  }

  return personFindings
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
    const signature = buildPersonSignature(person)
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

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`))
    }, ms)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle)
  }
}

export async function runPublicScanForOrganization(organizationId: string) {
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

  const { data: existingRunningAssessment, error: runningError } = await supabaseAdmin
    .from('assessments')
    .select('id')
    .eq('organization_id', organization.id)
    .eq('status', 'running')
    .maybeSingle()

  if (runningError) {
    throw new Error(`running assessment check failed: ${runningError.message}`)
  }

  if (existingRunningAssessment) {
    throw new Error('A scan is already running for this organization.')
  }

  const { data: assessmentData, error: assessmentError } = await supabaseAdmin
    .from('assessments')
    .insert({
      organization_id: organization.id,
      status: 'running',
      overall_score: 0,
      overall_risk_level: 'low',
    })
    .select('*')
    .maybeSingle()

  if (assessmentError || !assessmentData) {
    throw new Error(assessmentError?.message || 'Failed to create assessment.')
  }

  const assessmentId = assessmentData.id as string

  try {
    const scanOutcome = await withTimeout(
      (async () => {
        const discoveredUrls = await withTimeout(
          discoverRelevantUrls(organization.domain),
          DISCOVERY_TIMEOUT_MS,
          `Discovery for ${organization.domain}`,
        )

        const urls = discoveredUrls.filter(
          (url) =>
            isLikelyValidUrl(url) &&
            !isSpamLikeUrl(url) &&
            !isLikelyIrrelevantArticle(url),
        )

        const extractedSignals: Array<{
          url: string
          title: string
          text: string
          emails: string[]
          hasLeadershipSignals: boolean
          hasFinanceSignals: boolean
          hasHrSignals: boolean
          hasContactSignals: boolean
          detectedPeople: Array<{
            fullName: string | null
            roleTitle: string
            department: string | null
            email: string | null
            isKeyPerson: boolean
          }>
        }> = []

        const failedUrls: Array<{ url: string; error: string }> = []

        for (const url of urls) {
          if (isSpamLikeUrl(url) || isLikelyIrrelevantArticle(url)) {
            failedUrls.push({
              url,
              error: 'Skipped non-corporate or spam-like URL',
            })
            continue
          }

          try {
            if (isPdfUrl(url)) {
              const pdfSignal = await withTimeout(
                extractSignalsFromPdfUrl(url),
                PDF_SIGNAL_TIMEOUT_MS,
                `PDF scan for ${url}`,
              )

              if (pdfSignal) {
                extractedSignals.push({
                  ...pdfSignal,
                  detectedPeople: [],
                })
              } else {
                failedUrls.push({
                  url,
                  error: 'No usable PDF signals extracted',
                })
              }

              continue
            }

            const attempt = await withTimeout(
              extractSignalsAttempt(url),
              HTML_SIGNAL_TIMEOUT_MS,
              `HTML scan for ${url}`,
            )

            if (attempt.ok) {
              extractedSignals.push(attempt.signal)
            } else {
              failedUrls.push({
                url,
                error: attempt.reason,
              })
            }
          } catch (error) {
            failedUrls.push({
              url,
              error:
                error instanceof Error && error.name === 'AbortError'
                  ? 'Request timed out'
                  : error instanceof Error
                    ? error.message
                    : 'Unknown extraction error',
            })
          }
        }

        const classified = classifySignals(extractedSignals)

        const hasPersonLinkedFindings = classified.findings.some(
          (finding) => !!finding.linkedPersonEmail || !!finding.linkedPersonSignature,
        )

        let finalClassified = classified

        if (classified.people.length > 0 && !hasPersonLinkedFindings) {
          const personFallbackFindings = buildPersonFirstFallbackFindings(
            classified.people,
            extractedSignals,
          )

          finalClassified = {
            ...classified,
            findings: [...classified.findings, ...personFallbackFindings],
          }
        } else if (classified.findings.length === 0 && extractedSignals.length > 0) {
          finalClassified = {
            ...classified,
            findings: [
              {
                title: 'Public organizational visibility detected',
                description: `The scan identified ${extractedSignals.length} publicly reachable page(s) relevant to exposure analysis. This indicates publicly accessible organizational context that may support targeted social engineering.`,
                severity: extractedSignals.length >= 4 ? 'medium' : 'low',
                category: 'org_visibility',
                linkedPersonEmail: null,
                linkedPersonSignature: null,
                sourceUrl: extractedSignals[0]?.url ?? null,
                sourceTitle: extractedSignals[0]?.title ?? null,
                sourceType: 'fallback',
              },
            ],
          }
        }

        const { uniqueToInsert, matchedExisting } = dedupeScannedPeopleAgainstExisting(
          finalClassified.people,
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
              })),
            )
            .select('id, email, full_name, role_title')

          if (peopleError) {
            throw new Error(`people insert failed: ${peopleError.message}`)
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

        let insertedFindings: FindingRow[] = []

        if (finalClassified.findings.length > 0) {
          const findingsPayload = finalClassified.findings.map((finding) => {
            const normalizedLinkedEmail = normalizeEmail(finding.linkedPersonEmail)
            const normalizedLinkedSignature = finding.linkedPersonSignature
              ? normalizeSignature(finding.linkedPersonSignature)
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
            }
          })

          const { data: findingsData, error: findingsError } = await supabaseAdmin
            .from('findings')
            .insert(findingsPayload)
            .select('id, person_id, title, description, severity, category')

          if (findingsError) {
            throw new Error(`findings insert failed: ${findingsError.message}`)
          }

          insertedFindings = (findingsData ?? []) as FindingRow[]
        }

        const assessmentScores = calculateAssessmentScores(insertedFindings)
        const personScores = calculatePersonScores(insertedFindings)

        const scoresPayload = [
          {
            assessment_id: assessmentId,
            person_id: null,
            score_type: 'impersonation_risk',
            score_value: assessmentScores.impersonationScore,
            risk_level: assessmentScores.impersonationRiskLevel,
            reason_summary: 'Calculated from publicly discovered findings and category weights.',
          },
          {
            assessment_id: assessmentId,
            person_id: null,
            score_type: 'finance_fraud_risk',
            score_value: assessmentScores.financeScore,
            risk_level: assessmentScores.financeRiskLevel,
            reason_summary: 'Calculated from publicly discovered findings and category weights.',
          },
          {
            assessment_id: assessmentId,
            person_id: null,
            score_type: 'hr_social_engineering_risk',
            score_value: assessmentScores.hrScore,
            risk_level: assessmentScores.hrRiskLevel,
            reason_summary: 'Calculated from publicly discovered findings and category weights.',
          },
          {
            assessment_id: assessmentId,
            person_id: null,
            score_type: 'overall',
            score_value: assessmentScores.overallScore,
            risk_level: assessmentScores.overallRiskLevel,
            reason_summary: 'Average of the three primary score dimensions.',
          },
          ...personScores.map((item) => ({
            assessment_id: assessmentId,
            person_id: item.personId,
            score_type: 'person_overall_risk',
            score_value: item.overallScore,
            risk_level: item.overallRiskLevel,
            reason_summary: item.reasonSummary,
          })),
        ]

        const { error: scoreInsertError } = await supabaseAdmin
          .from('scores')
          .insert(scoresPayload)

        if (scoreInsertError) {
          throw new Error(`scores insert failed: ${scoreInsertError.message}`)
        }

        const remediationSeed = [
          {
            title: 'Reduce direct public exposure of corporate email addresses',
            priority: 'high',
            effort: 'low',
            impact: 'high',
            status: 'open',
          },
          {
            title: 'Review leadership and team pages for unnecessary role visibility',
            priority: 'medium',
            effort: 'low',
            impact: 'medium',
            status: 'open',
          },
          {
            title: 'Introduce verification controls for finance-related requests',
            priority: 'high',
            effort: 'medium',
            impact: 'high',
            status: 'open',
          },
        ]

        const { error: remediationError } = await supabaseAdmin
          .from('remediation_tasks')
          .insert(
            remediationSeed.map((task) => ({
              assessment_id: assessmentId,
              ...task,
            })),
          )

        if (remediationError) {
          throw new Error(`remediation insert failed: ${remediationError.message}`)
        }

        const scanDiagnostics: Record<string, unknown> = {
          scannedUrls: urls,
          failedUrls,
          scannedPages: extractedSignals.length,
          completedAt: new Date().toISOString(),
          peopleDetected: finalClassified.people.length,
          peopleInserted: insertedPeople.length,
          peopleMatchedExisting: matchedExisting.length,
          findingsInserted: insertedFindings.length,
          findingsLinkedToPeople: insertedFindings.filter((f) => !!f.person_id).length,
          personScoresGenerated: personScores.length,
        }

        const { error: updateAssessmentError } = await supabaseAdmin
          .from('assessments')
          .update({
            status: 'completed',
            overall_score: assessmentScores.overallScore,
            overall_risk_level: riskFromOverall(assessmentScores.overallScore),
            scan_diagnostics: scanDiagnostics,
          })
          .eq('id', assessmentId)

        if (updateAssessmentError) {
          throw new Error(`assessment update failed: ${updateAssessmentError.message}`)
        }

        return {
          classifiedPeople: finalClassified.people,
          extractedSignals,
          result: {
            assessmentId,
            organizationId: organization.id,
            scannedUrls: urls,
            failedUrls,
            scannedPages: extractedSignals.length,
            insertedPeople: insertedPeople.length,
            matchedPeople: matchedExisting.length,
            totalKnownPeople: allKnownPeople.length,
            insertedFindings: insertedFindings.length,
            personScoresGenerated: personScores.length,
            overallScore: assessmentScores.overallScore,
            overallRiskLevel: assessmentScores.overallRiskLevel,
            summary: {
              ...finalClassified.summary,
              fallbackUsed: finalClassified.findings.length > classified.findings.length,
            },
          },
        }
      })(),
      SCAN_FAILSAFE_TIMEOUT_MS,
      `Scan for organization ${organization.id}`,
    )

    await syncDiscoveredAssets({
      organization,
      classifiedPeople: scanOutcome.classifiedPeople,
      extractedSignals: scanOutcome.extractedSignals,
      brandNames: [organization.name],
    })

    return scanOutcome.result
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown scan error'

    const failedScanDiagnostics: Record<string, unknown> = {
      scannedUrls: [],
      failedUrls: [],
      scannedPages: 0,
      failedAt: new Date().toISOString(),
      error: message,
      phase: message.toLowerCase().includes('discovery')
        ? 'discovery'
        : message.toLowerCase().includes('pdf')
          ? 'pdf'
          : message.toLowerCase().includes('html')
            ? 'html'
            : 'scan',
    }

    await supabaseAdmin
      .from('assessments')
      .update({
        status: 'failed',
        scan_diagnostics: failedScanDiagnostics,
      })
      .eq('id', assessmentId)

    throw error
  }
}

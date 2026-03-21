import * as cheerio from 'cheerio'
import type { ScannerFinding, ScannerPerson } from '@/lib/types'
import type { ExternalSearchResult } from './external-search-types'

export type ExternalExtractedSignal = {
  url: string
  title: string
  snippet: string
  sourceType: ExternalSearchResult['sourceType']
  sourceDomain: string | null
  emails: string[]
  hasLeadershipSignals: boolean
  hasFinanceSignals: boolean
  hasHrSignals: boolean
  hasContactSignals: boolean
  detectedPeople: ScannerPerson[]
}

export type ExternalExtractionResult = {
  signals: ExternalExtractedSignal[]
  findings: ScannerFinding[]
  people: ScannerPerson[]
}

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
const FETCH_TIMEOUT_MS = 12000
const MAX_HTML_CHARS = 250_000
const MAX_TEXT_CHARS = 20_000

const ROLE_PATTERNS = [
  { regex: /\bCEO\b/i, role: 'CEO', department: 'Executive', key: true },
  {
    regex: /\bChief Executive Officer\b/i,
    role: 'CEO',
    department: 'Executive',
    key: true,
  },
  {
    regex: /\bAmministratore Delegato\b/i,
    role: 'CEO',
    department: 'Executive',
    key: true,
  },

  { regex: /\bCFO\b/i, role: 'CFO', department: 'Finance', key: true },
  {
    regex: /\bChief Financial Officer\b/i,
    role: 'CFO',
    department: 'Finance',
    key: true,
  },
  {
    regex: /\bDirettore Finanziario\b/i,
    role: 'CFO',
    department: 'Finance',
    key: true,
  },

  { regex: /\bCOO\b/i, role: 'COO', department: 'Operations', key: true },
  { regex: /\bCTO\b/i, role: 'CTO', department: 'Technology', key: true },
  { regex: /\bFounder\b/i, role: 'Founder', department: 'Executive', key: true },
  { regex: /\bFondatore\b/i, role: 'Founder', department: 'Executive', key: true },
  {
    regex: /\bManaging Director\b/i,
    role: 'Managing Director',
    department: 'Executive',
    key: true,
  },
  { regex: /\bPresident\b/i, role: 'President', department: 'Executive', key: true },
  { regex: /\bPresidente\b/i, role: 'President', department: 'Executive', key: true },
  { regex: /\bBoard\b/i, role: 'Board Member', department: 'Executive', key: true },

  { regex: /\bHR Manager\b/i, role: 'HR Manager', department: 'HR', key: true },
  { regex: /\bHead of HR\b/i, role: 'Head of HR', department: 'HR', key: true },
  { regex: /\bRisorse Umane\b/i, role: 'HR Contact', department: 'HR', key: false },
  { regex: /\bRecruiter\b/i, role: 'Recruiter', department: 'HR', key: false },
  {
    regex: /\bTalent Acquisition\b/i,
    role: 'Talent Acquisition',
    department: 'HR',
    key: false,
  },

  {
    regex: /\bFinance Manager\b/i,
    role: 'Finance Manager',
    department: 'Finance',
    key: true,
  },
  {
    regex: /\bAmministrazione\b/i,
    role: 'Administration Contact',
    department: 'Finance',
    key: false,
  },
  {
    regex: /\bContabilità\b/i,
    role: 'Accounting Contact',
    department: 'Finance',
    key: false,
  },
  {
    regex: /\bAccounting\b/i,
    role: 'Accounting Contact',
    department: 'Finance',
    key: false,
  },
  {
    regex: /\bProcurement\b/i,
    role: 'Procurement Contact',
    department: 'Finance',
    key: false,
  },
] as const

function cleanText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items))
}

function clampText(text: string, maxChars = MAX_TEXT_CHARS) {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars)
}

function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ''
}

function buildPersonSignature(person: ScannerPerson) {
  return `${normalizeText(person.fullName)}|${normalizeText(person.roleTitle)}|${normalizeText(person.email)}`
}

function dedupePeople(people: ScannerPerson[]) {
  const map = new Map<string, ScannerPerson>()

  for (const person of people) {
    const key = buildPersonSignature(person)
    if (!map.has(key)) {
      map.set(key, person)
    }
  }

  return Array.from(map.values())
}

function severityRank(severity: string) {
  if (severity === 'high') return 3
  if (severity === 'medium') return 2
  return 1
}

function findingSpecificityRank(finding: ScannerFinding) {
  let score = 0
  const title = finding.title.toLowerCase()

  if (finding.linkedPersonEmail || finding.linkedPersonSignature) score += 3
  if (finding.sourceUrl) score += 1

  if (
    title.includes('executive visibility') ||
    title.includes('finance role visibility') ||
    title.includes('hr role visibility') ||
    title.includes('external role visibility')
  ) {
    score += 2
  }

  if (
    title.includes('public email addresses') ||
    title.includes('leadership visibility detected') ||
    title.includes('finance-related external public context') ||
    title.includes('hr / careers exposure detected')
  ) {
    score += 1
  }

  return score
}

function findingDedupKey(finding: ScannerFinding) {
  const personKey = finding.linkedPersonSignature || finding.linkedPersonEmail || ''
  const sourceKey = normalizeText(finding.sourceUrl)
  const title = finding.title.toLowerCase()

  let cluster: string = finding.category

  if (title.includes('email')) {
    cluster = `${finding.category}:email`
  } else if (
    title.includes('leadership') ||
    title.includes('executive') ||
    title.includes('role visibility')
  ) {
    cluster = `${finding.category}:role`
  } else if (title.includes('finance')) {
    cluster = `${finding.category}:finance`
  } else if (
    title.includes('hr') ||
    title.includes('careers') ||
    title.includes('recruit')
  ) {
    cluster = `${finding.category}:hr`
  }

  if (personKey) {
    return `person|${cluster}|${normalizeText(personKey)}`
  }

  return `source|${cluster}|${sourceKey}`
}

function dedupeFindings(findings: ScannerFinding[]) {
  const map = new Map<string, ScannerFinding>()

  for (const finding of findings) {
    const key = findingDedupKey(finding)
    const existing = map.get(key)

    if (!existing) {
      map.set(key, finding)
      continue
    }

    const currentSeverity = severityRank(finding.severity)
    const existingSeverity = severityRank(existing.severity)

    if (currentSeverity > existingSeverity) {
      map.set(key, finding)
      continue
    }

    if (currentSeverity === existingSeverity) {
      const currentSpecificity = findingSpecificityRank(finding)
      const existingSpecificity = findingSpecificityRank(existing)

      if (currentSpecificity > existingSpecificity) {
        map.set(key, finding)
      }
    }
  }

  return Array.from(map.values())
}

function looksLikePersonName(value: string) {
  return /\b[A-ZÀ-Ý][a-zà-ÿ'’-]+(?:\s+[A-ZÀ-Ý][a-zà-ÿ'’-]+){1,2}\b/.test(value)
}

function extractNameFromChunk(chunk: string) {
  const patterns = [
    /\b([A-ZÀ-Ý][a-zà-ÿ'’-]+(?:\s+[A-ZÀ-Ý][a-zà-ÿ'’-]+){1,2})\b/,
    /\b([A-ZÀ-Ý][A-ZÀ-Ýa-zà-ÿ'’-]+,\s*[A-ZÀ-Ý][A-ZÀ-Ýa-zà-ÿ'’-]+)\b/,
  ]

  for (const pattern of patterns) {
    const match = chunk.match(pattern)
    if (match?.[1] && looksLikePersonName(match[1].replace(',', ' '))) {
      return match[1].replace(',', ' ')
    }
  }

  return null
}

function extractEmailsFromText(text: string) {
  return unique((text.match(EMAIL_REGEX) || []).map((e) => e.toLowerCase())).filter(
    (email) => !email.endsWith('.png') && !email.endsWith('.jpg'),
  )
}

function extractLikelyPeople(text: string, emails: string[]) {
  const matches: ScannerPerson[] = []

  const chunks = text
    .split(/[\n\r.;•|]/)
    .map((line) => cleanText(line))
    .filter(Boolean)
    .slice(0, 350)

  for (const chunk of chunks) {
    if (chunk.length < 3) continue
    if (chunk.length > 220) continue

    for (const pattern of ROLE_PATTERNS) {
      if (!pattern.regex.test(chunk)) continue

      const fullName = extractNameFromChunk(chunk)
      const email =
        emails.find((e) => chunk.toLowerCase().includes(e.toLowerCase())) ?? null

      matches.push({
        fullName,
        roleTitle: pattern.role,
        department: pattern.department,
        email,
        isKeyPerson: pattern.key,
      })
    }
  }

  for (const email of emails) {
    const lower = email.toLowerCase()

    if (
      lower.startsWith('hr@') ||
      lower.startsWith('careers@') ||
      lower.startsWith('jobs@')
    ) {
      matches.push({
        fullName: null,
        roleTitle: 'HR Contact',
        department: 'HR',
        email,
        isKeyPerson: false,
      })
    }

    if (
      lower.startsWith('finance@') ||
      lower.startsWith('billing@') ||
      lower.startsWith('accounts@') ||
      lower.startsWith('amministrazione@') ||
      lower.startsWith('pagamenti@')
    ) {
      matches.push({
        fullName: null,
        roleTitle: 'Finance Contact',
        department: 'Finance',
        email,
        isKeyPerson: false,
      })
    }
  }

  return dedupePeople(matches).slice(0, 30)
}

function severityFromEmailCount(count: number): 'low' | 'medium' | 'high' {
  if (count >= 4) return 'high'
  if (count >= 1) return 'medium'
  return 'low'
}

function buildExternalFindings(signal: ExternalExtractedSignal) {
  const findings: ScannerFinding[] = []

  if (signal.emails.length > 0) {
    findings.push({
      title: 'Public email addresses found on external sources',
      description: `${signal.emails.length} public email address(es) detected on ${signal.url}. External public contact visibility can increase phishing reach and spoofing credibility.`,
      severity: severityFromEmailCount(signal.emails.length),
      category: 'email_exposure',
      sourceUrl: signal.url,
      sourceTitle: signal.title,
      sourceType: 'html',
    })
  }

  if (signal.hasLeadershipSignals) {
    findings.push({
      title: 'Leadership visibility detected on external public sources',
      description: `Leadership or executive signals were detected on ${signal.url}, increasing impersonation credibility beyond the corporate website.`,
      severity: 'high',
      category: 'role_visibility',
      sourceUrl: signal.url,
      sourceTitle: signal.title,
      sourceType: 'html',
    })
  }

  if (signal.hasFinanceSignals) {
    findings.push({
      title: 'Finance-related external public context detected',
      description: `Finance-related context was detected on ${signal.url}, which can support invoice fraud or payment diversion scenarios.`,
      severity: 'medium',
      category: 'impersonation',
      sourceUrl: signal.url,
      sourceTitle: signal.title,
      sourceType: 'html',
    })
  }

  if (signal.hasHrSignals) {
    findings.push({
      title: 'HR / careers exposure detected on external sources',
      description: `HR, recruiting, or careers-related external exposure was detected on ${signal.url}, which may support candidate phishing or HR-targeted social engineering.`,
      severity: 'medium',
      category: 'social_engineering_context',
      sourceUrl: signal.url,
      sourceTitle: signal.title,
      sourceType: 'html',
    })
  }

  for (const person of signal.detectedPeople) {
    const signature = buildPersonSignature(person)

    findings.push({
      title: `External role visibility: ${person.roleTitle}`,
      description: `${person.fullName ?? 'A publicly visible person'} is associated with the role "${person.roleTitle}" on ${signal.url}. External visibility can support impersonation and targeted social engineering.`,
      severity: person.isKeyPerson ? 'high' : 'medium',
      category:
        person.department === 'Finance'
          ? 'impersonation'
          : person.department === 'HR'
            ? 'social_engineering_context'
            : 'role_visibility',
      linkedPersonEmail: person.email ?? null,
      linkedPersonSignature: signature,
      sourceUrl: signal.url,
      sourceTitle: signal.title,
      sourceType: 'html',
    })
  }

  return findings
}

async function fetchWithTimeout(input: string, init?: RequestInit) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchPageText(url: string) {
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 HumanSurfaceExternalScanner/1.0',
      },
      cache: 'no-store',
      redirect: 'follow',
    })

    if (!response.ok) return null

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) return null

    const html = await response.text()
    if (!html) return null

    const safeHtml = html.slice(0, MAX_HTML_CHARS)
    const $ = cheerio.load(safeHtml)

    $('script, style, noscript, svg, canvas, iframe').remove()

    const title = cleanText($('title').first().text())
    const text = clampText(cleanText($('body').text()))

    return {
      title,
      text,
    }
  } catch {
    return null
  }
}

export async function extractExternalSignals(
  results: ExternalSearchResult[],
): Promise<ExternalExtractionResult> {
  const signals: ExternalExtractedSignal[] = []
  const allPeople: ScannerPerson[] = []
  const allFindings: ScannerFinding[] = []

  for (const result of results) {
    let mergedText = cleanText(`${result.title}. ${result.snippet}`)
    let finalTitle = result.title

    const pageData = await fetchPageText(result.url)
    if (pageData?.text) {
      mergedText = cleanText(`${result.title}. ${result.snippet}. ${pageData.text}`)
      finalTitle = pageData.title || result.title
    }

    if (!mergedText || mergedText.length < 20) continue

    const emails = extractEmailsFromText(mergedText)
    const detectedPeople = extractLikelyPeople(mergedText, emails)

    const lower = mergedText.toLowerCase()
    const urlLower = result.url.toLowerCase()

    const signal: ExternalExtractedSignal = {
      url: result.url,
      title: finalTitle,
      snippet: result.snippet,
      sourceType: result.sourceType,
      sourceDomain: result.sourceDomain,
      emails,
      hasLeadershipSignals:
        /ceo|cfo|coo|cto|founder|leadership|management|board|executive|director|amministratore delegato|presidente/.test(
          lower,
        ) || /leadership|management|team|board/.test(urlLower),
      hasFinanceSignals:
        /finance|billing|invoice|accounts payable|accounts receivable|payments|procurement|amministrazione|contabilità/.test(
          lower,
        ),
      hasHrSignals:
        /hr|human resources|recruiting|recruitment|careers|jobs|talent|candidate|risorse umane|lavora con noi/.test(
          lower,
        ),
      hasContactSignals:
        /contact|contacts|contatti|email|reach us|get in touch|contattaci/.test(lower),
      detectedPeople,
    }

    signals.push(signal)
    allPeople.push(...detectedPeople)
    allFindings.push(...buildExternalFindings(signal))
  }

  return {
    signals,
    findings: dedupeFindings(allFindings),
    people: dedupePeople(allPeople),
  }
}
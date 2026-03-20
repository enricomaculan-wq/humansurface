import * as cheerio from 'cheerio'

export type ExtractedSignal = {
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
}

export type ExtractAttempt =
  | { ok: true; signal: ExtractedSignal }
  | { ok: false; reason: string }

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi

const FETCH_TIMEOUT_MS = 8000
const MAX_HTML_CHARS = 400_000
const MAX_TEXT_CHARS = 30_000
const MIN_USEFUL_TEXT_CHARS = 30

const ROLE_PATTERNS = [
  { regex: /\bCEO\b/i, role: 'CEO', department: 'Executive', key: true },
  { regex: /\bCFO\b/i, role: 'CFO', department: 'Finance', key: true },
  { regex: /\bCOO\b/i, role: 'COO', department: 'Operations', key: true },
  { regex: /\bCTO\b/i, role: 'CTO', department: 'Technology', key: true },
  { regex: /\bFounder\b/i, role: 'Founder', department: 'Executive', key: true },
  { regex: /\bManaging Director\b/i, role: 'Managing Director', department: 'Executive', key: true },
  { regex: /\bHR Manager\b/i, role: 'HR Manager', department: 'HR', key: true },
  { regex: /\bHead of HR\b/i, role: 'Head of HR', department: 'HR', key: true },
  { regex: /\bPeople Manager\b/i, role: 'People Manager', department: 'HR', key: true },
  { regex: /\bFinance Manager\b/i, role: 'Finance Manager', department: 'Finance', key: true },
  { regex: /\bAccounts Payable\b/i, role: 'Accounts Payable', department: 'Finance', key: false },
  { regex: /\bAccounts Receivable\b/i, role: 'Accounts Receivable', department: 'Finance', key: false },
  { regex: /\bRecruiter\b/i, role: 'Recruiter', department: 'HR', key: false },
]

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

function looksLikeBoilerplate(url: string, text: string) {
  const lower = text.toLowerCase()
  const urlLower = url.toLowerCase()

  const irrelevantPath =
    /privacy|cookie|terms|legal|gdpr/.test(urlLower)

  const veryShortAndCookieHeavy =
    text.length < 120 &&
    /cookie|privacy preferences|consent preferences|accept all|reject all/.test(lower)

  return irrelevantPath || veryShortAndCookieHeavy
}

function extractLikelyPeople(text: string, emails: string[]) {
  const matches: ExtractedSignal['detectedPeople'] = []
  const chunks = text
    .split(/[\n\r.]/)
    .map((line) => cleanText(line))
    .filter(Boolean)
    .slice(0, 250)

  for (const chunk of chunks) {
    for (const pattern of ROLE_PATTERNS) {
      if (!pattern.regex.test(chunk)) continue

      const nameMatch = chunk.match(
        /\b([A-Z][a-zà-ÿ'-]+(?:\s+[A-Z][a-zà-ÿ'-]+){1,2})\b/,
      )

      const email =
        emails.find((e) => chunk.toLowerCase().includes(e.toLowerCase())) ?? null

      matches.push({
        fullName: nameMatch?.[1] ?? null,
        roleTitle: pattern.role,
        department: pattern.department,
        email,
        isKeyPerson: pattern.key,
      })
    }
  }

  const deduped = new Map<string, ExtractedSignal['detectedPeople'][number]>()

  for (const item of matches) {
    const key = `${item.fullName ?? ''}|${item.roleTitle}|${item.email ?? ''}`
    if (!deduped.has(key)) deduped.set(key, item)
  }

  return Array.from(deduped.values()).slice(0, 25)
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

export async function extractSignalsAttempt(url: string): Promise<ExtractAttempt> {
  try {
    const response = await fetchWithTimeout(url, {
      headers: { 'user-agent': 'HumanSurfaceScanner/1.0' },
      cache: 'no-store',
      redirect: 'follow',
    })

    if (!response.ok) {
      return { ok: false, reason: `HTTP ${response.status}` }
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      return { ok: false, reason: `Unsupported content-type: ${contentType || 'unknown'}` }
    }

    const html = await response.text()
    if (!html) {
      return { ok: false, reason: 'Empty HTML response' }
    }

    const safeHtml = html.slice(0, MAX_HTML_CHARS)
    const $ = cheerio.load(safeHtml)

    $('script, style, noscript, svg, canvas, iframe').remove()

    const title = cleanText($('title').first().text()) || url
    const rawText = cleanText($('body').text())
    const text = clampText(rawText, MAX_TEXT_CHARS)

    if (text.length < MIN_USEFUL_TEXT_CHARS) {
      return { ok: false, reason: `Text too short (${text.length} chars)` }
    }

    if (looksLikeBoilerplate(url, text)) {
      return { ok: false, reason: 'Boilerplate or legal/cookie page' }
    }

    const rawEmails = unique(
      (text.match(EMAIL_REGEX) || []).map((e) => e.toLowerCase()),
    )

    const emails = rawEmails
      .filter((email) => !email.endsWith('.png') && !email.endsWith('.jpg'))
      .slice(0, 20)

    const lower = text.toLowerCase()
    const urlLower = url.toLowerCase()

    const hasLeadershipSignals =
      /ceo|cfo|coo|cto|founder|leadership|management|board|executive|director/.test(lower) ||
      /leadership|management|team|board/.test(urlLower)

    const hasFinanceSignals =
      /finance|billing|invoice|accounts payable|accounts receivable|payments|procurement|bank detail|supplier/.test(lower)

    const hasHrSignals =
      /hr|human resources|recruiting|recruitment|careers|jobs|talent|candidate/.test(lower) ||
      /careers|career|jobs|job/.test(urlLower)

    const hasContactSignals =
      /contact us|contact|reach us|get in touch|email us/.test(lower) ||
      /contact|contacts|contatti/.test(urlLower)

    const detectedPeople = extractLikelyPeople(text, emails)

    return {
      ok: true,
      signal: {
        url,
        title,
        text,
        emails,
        hasLeadershipSignals,
        hasFinanceSignals,
        hasHrSignals,
        hasContactSignals,
        detectedPeople,
      },
    }
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'Unknown extraction error',
    }
  }
}

export async function extractSignalsFromUrl(url: string): Promise<ExtractedSignal | null> {
  const result = await extractSignalsAttempt(url)
  return result.ok ? result.signal : null
}
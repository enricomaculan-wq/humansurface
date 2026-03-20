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

const FETCH_TIMEOUT_MS = 15000
const MAX_HTML_CHARS = 400_000
const MAX_TEXT_CHARS = 30_000
const MIN_USEFUL_TEXT_CHARS = 30

const ROLE_PATTERNS = [
  { regex: /\bCEO\b/i, role: 'CEO', department: 'Executive', key: true },
  { regex: /\bChief Executive Officer\b/i, role: 'CEO', department: 'Executive', key: true },
  { regex: /\bAmministratore Delegato\b/i, role: 'CEO', department: 'Executive', key: true },

  { regex: /\bCFO\b/i, role: 'CFO', department: 'Finance', key: true },
  { regex: /\bChief Financial Officer\b/i, role: 'CFO', department: 'Finance', key: true },
  { regex: /\bDirettore Finanziario\b/i, role: 'CFO', department: 'Finance', key: true },

  { regex: /\bCOO\b/i, role: 'COO', department: 'Operations', key: true },
  { regex: /\bChief Operating Officer\b/i, role: 'COO', department: 'Operations', key: true },
  { regex: /\bDirettore Operativo\b/i, role: 'COO', department: 'Operations', key: true },

  { regex: /\bCTO\b/i, role: 'CTO', department: 'Technology', key: true },
  { regex: /\bChief Technology Officer\b/i, role: 'CTO', department: 'Technology', key: true },
  { regex: /\bDirettore Tecnico\b/i, role: 'CTO', department: 'Technology', key: true },

  { regex: /\bFounder\b/i, role: 'Founder', department: 'Executive', key: true },
  { regex: /\bCo[- ]Founder\b/i, role: 'Founder', department: 'Executive', key: true },
  { regex: /\bFondatore\b/i, role: 'Founder', department: 'Executive', key: true },

  { regex: /\bManaging Director\b/i, role: 'Managing Director', department: 'Executive', key: true },
  { regex: /\bGeneral Manager\b/i, role: 'General Manager', department: 'Executive', key: true },
  { regex: /\bDirettore Generale\b/i, role: 'General Manager', department: 'Executive', key: true },
  { regex: /\bPresident\b/i, role: 'President', department: 'Executive', key: true },
  { regex: /\bPresidente\b/i, role: 'President', department: 'Executive', key: true },

  { regex: /\bBoard\b/i, role: 'Board Member', department: 'Executive', key: true },
  { regex: /\bConsiglio di Amministrazione\b/i, role: 'Board Member', department: 'Executive', key: true },

  { regex: /\bHR Manager\b/i, role: 'HR Manager', department: 'HR', key: true },
  { regex: /\bHead of HR\b/i, role: 'Head of HR', department: 'HR', key: true },
  { regex: /\bPeople Manager\b/i, role: 'People Manager', department: 'HR', key: true },
  { regex: /\bHuman Resources Manager\b/i, role: 'HR Manager', department: 'HR', key: true },
  { regex: /\bResponsabile HR\b/i, role: 'HR Manager', department: 'HR', key: true },
  { regex: /\bResponsabile Risorse Umane\b/i, role: 'HR Manager', department: 'HR', key: true },
  { regex: /\bRisorse Umane\b/i, role: 'HR Contact', department: 'HR', key: false },

  { regex: /\bFinance Manager\b/i, role: 'Finance Manager', department: 'Finance', key: true },
  { regex: /\bAccounts Payable\b/i, role: 'Accounts Payable', department: 'Finance', key: false },
  { regex: /\bAccounts Receivable\b/i, role: 'Accounts Receivable', department: 'Finance', key: false },
  { regex: /\bAmministrazione\b/i, role: 'Administration Contact', department: 'Finance', key: false },
  { regex: /\bContabilità\b/i, role: 'Accounting Contact', department: 'Finance', key: false },
  { regex: /\bAccounting\b/i, role: 'Accounting Contact', department: 'Finance', key: false },
  { regex: /\bFinance\b/i, role: 'Finance Contact', department: 'Finance', key: false },
  { regex: /\bUfficio Acquisti\b/i, role: 'Procurement Contact', department: 'Finance', key: false },
  { regex: /\bProcurement\b/i, role: 'Procurement Contact', department: 'Finance', key: false },

  { regex: /\bRecruiter\b/i, role: 'Recruiter', department: 'HR', key: false },
  { regex: /\bTalent Acquisition\b/i, role: 'Talent Acquisition', department: 'HR', key: false },
  { regex: /\bCareers\b/i, role: 'Careers Contact', department: 'HR', key: false },
  { regex: /\bLavora con noi\b/i, role: 'Careers Contact', department: 'HR', key: false },

  { regex: /\bSales Manager\b/i, role: 'Sales Manager', department: 'Sales', key: false },
  { regex: /\bCommerciale\b/i, role: 'Sales Contact', department: 'Sales', key: false },
  { regex: /\bMarketing Manager\b/i, role: 'Marketing Manager', department: 'Marketing', key: false },
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

  const irrelevantPath = /privacy|cookie|terms|legal|gdpr/.test(urlLower)

  const veryShortAndCookieHeavy =
    text.length < 120 &&
    /cookie|privacy preferences|consent preferences|accept all|reject all/.test(lower)

  return irrelevantPath || veryShortAndCookieHeavy
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

function findEmailForChunk(chunk: string, emails: string[]) {
  return emails.find((e) => chunk.toLowerCase().includes(e.toLowerCase())) ?? null
}

function extractLikelyPeople(text: string, emails: string[]) {
  const matches: ExtractedSignal['detectedPeople'] = []

  const chunks = text
    .split(/[\n\r.;•|]/)
    .map((line) => cleanText(line))
    .filter(Boolean)
    .slice(0, 400)

  for (const chunk of chunks) {
    if (chunk.length < 3) continue
    if (chunk.length > 220) continue

    for (const pattern of ROLE_PATTERNS) {
      if (!pattern.regex.test(chunk)) continue

      const fullName = extractNameFromChunk(chunk)
      const email = findEmailForChunk(chunk, emails)

      matches.push({
        fullName,
        roleTitle: pattern.role,
        department: pattern.department,
        email,
        isKeyPerson: pattern.key,
      })
    }

    if (
      /\b(ceo|cfo|coo|cto|founder|managing director|general manager|direttore generale|amministratore delegato|presidente)\b/i.test(
        chunk,
      )
    ) {
      const fullName = extractNameFromChunk(chunk)
      const email = findEmailForChunk(chunk, emails)

      if (fullName || email) {
        matches.push({
          fullName,
          roleTitle: /cfo/i.test(chunk)
            ? 'CFO'
            : /cto/i.test(chunk)
              ? 'CTO'
              : /coo/i.test(chunk)
                ? 'COO'
                : /ceo|chief executive officer|amministratore delegato/i.test(chunk)
                  ? 'CEO'
                  : /founder|fondatore/i.test(chunk)
                    ? 'Founder'
                    : /presidente/i.test(chunk)
                      ? 'President'
                      : /general manager|direttore generale/i.test(chunk)
                        ? 'General Manager'
                        : 'Executive',
          department: 'Executive',
          email,
          isKeyPerson: true,
        })
      }
    }
  }

  for (const email of emails) {
    const lower = email.toLowerCase()

    if (lower.startsWith('hr@') || lower.startsWith('careers@') || lower.startsWith('jobs@')) {
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

    if (lower.startsWith('info@') || lower.startsWith('contact@') || lower.startsWith('contatti@')) {
      matches.push({
        fullName: null,
        roleTitle: 'Public Contact',
        department: null,
        email,
        isKeyPerson: false,
      })
    }
  }

  const deduped = new Map<string, ExtractedSignal['detectedPeople'][number]>()

  for (const item of matches) {
    const key = `${item.fullName ?? ''}|${item.roleTitle}|${item.email ?? ''}`
    if (!deduped.has(key)) {
      deduped.set(key, item)
    }
  }

  return Array.from(deduped.values()).slice(0, 40)
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

    const rawEmails = unique((text.match(EMAIL_REGEX) || []).map((e) => e.toLowerCase()))

    const emails = rawEmails
      .filter((email) => !email.endsWith('.png') && !email.endsWith('.jpg'))
      .slice(0, 20)

    const lower = text.toLowerCase()
    const urlLower = url.toLowerCase()

    const hasLeadershipSignals =
      /ceo|cfo|coo|cto|founder|leadership|management|board|executive|director|amministratore delegato|direttore generale|presidente/.test(
        lower,
      ) || /leadership|management|team|board/.test(urlLower)

    const hasFinanceSignals =
      /finance|billing|invoice|accounts payable|accounts receivable|payments|procurement|bank detail|supplier|amministrazione|contabilità|ufficio acquisti/.test(
        lower,
      )

    const hasHrSignals =
      /hr|human resources|recruiting|recruitment|careers|jobs|talent|candidate|risorse umane|lavora con noi/.test(
        lower,
      ) || /careers|career|jobs|job/.test(urlLower)

    const hasContactSignals =
      /contact us|contact|reach us|get in touch|email us|contatti|contattaci/.test(lower) ||
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
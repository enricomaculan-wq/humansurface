import * as cheerio from 'cheerio'

export type ExternalSearchSeed = {
  organizationId: string
  organizationName: string
  domain: string
}

export type ExternalSearchResult = {
  query: string
  title: string
  url: string
  snippet: string
  sourceType:
    | 'linkedin'
    | 'press'
    | 'directory'
    | 'job_board'
    | 'news'
    | 'company_page'
    | 'other'
  sourceDomain: string | null
}

export type ExternalSearchDebug = {
  query: string
  ok: boolean
  resultCount: number
  error?: string
}

export type ExternalSearchResponse = {
  results: ExternalSearchResult[]
  debug: ExternalSearchDebug[]
}

const FETCH_TIMEOUT_MS = 12000
const MAX_RESULTS_PER_QUERY = 5
const MAX_TOTAL_RESULTS = 20

function cleanText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function cleanDomain(domain: string) {
  return domain
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '')
    .toLowerCase()
}

function tryParseUrl(value: string) {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

function normalizeUrl(url: string) {
  return url
    .replace(/#.*$/, '')
    .replace(/\/+$/, '')
    .trim()
}

function decodeDuckDuckGoRedirect(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl)
    if (
      parsed.hostname.includes('duckduckgo.com') &&
      parsed.pathname.startsWith('/l/')
    ) {
      const uddg = parsed.searchParams.get('uddg')
      if (uddg) return decodeURIComponent(uddg)
    }
    return rawUrl
  } catch {
    return rawUrl
  }
}

function isSpamLikeText(value: string) {
  const lower = value.toLowerCase()

  return [
    'bonus',
    'casino',
    'slot',
    'bet',
    'scommesse',
    'free-spin',
    'free spins',
    'apk',
    'porn',
    'levitra',
    'gambling',
  ].some((term) => lower.includes(term))
}

function isLikelyUsefulResult(
  url: string,
  title: string,
  snippet: string,
  companyDomain: string,
) {
  const lower = `${url} ${title} ${snippet}`.toLowerCase()

  if (isSpamLikeText(lower)) return false

  const parsed = tryParseUrl(url)
  if (!parsed) return false

  const host = parsed.hostname.toLowerCase()

  // buttiamo fuori solo social molto rumorosi
  if (
    host.includes('facebook.com') ||
    host.includes('instagram.com') ||
    host.includes('tiktok.com')
  ) {
    return false
  }

  // accettiamo risultati che menzionano chiaramente l'azienda o ruoli sensibili
  if (
    host.includes(companyDomain) ||
    lower.includes(companyDomain) ||
    /ceo|cfo|coo|cto|founder|president|director|leadership|team|management|human resources|hr|finance|amministrazione|risorse umane|recruiting|careers|jobs|linkedin/.test(
      lower,
    )
  ) {
    return true
  }

  return false
}

function classifySourceType(url: string): ExternalSearchResult['sourceType'] {
  const lower = url.toLowerCase()

  if (lower.includes('linkedin.com')) return 'linkedin'
  if (
    lower.includes('indeed.') ||
    lower.includes('glassdoor.') ||
    lower.includes('/jobs') ||
    lower.includes('/careers')
  ) {
    return 'job_board'
  }
  if (
    lower.includes('/press') ||
    lower.includes('/news') ||
    lower.includes('/media')
  ) {
    return 'press'
  }
  if (
    lower.includes('crunchbase.com') ||
    lower.includes('rocketreach.co') ||
    lower.includes('signalhire.com') ||
    lower.includes('theorg.com')
  ) {
    return 'directory'
  }
  if (lower.includes('/company') || lower.includes('/about')) return 'company_page'
  return 'other'
}

function buildQueries(seed: ExternalSearchSeed) {
  const name = cleanText(seed.organizationName)
  const domain = cleanDomain(seed.domain)

  return Array.from(
    new Set([
      `"${name}" CEO`,
      `"${name}" CFO`,
      `"${name}" HR`,
      `"${name}" amministrazione`,
      `"${name}" finance`,
      `"${name}" recruiting`,
      `"${name}" LinkedIn`,
      `"${name}" team`,
      `"${name}" management`,
      `"${name}" site:linkedin.com`,
      `"${name}" site:${domain}`,
    ]),
  )
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

async function searchDuckDuckGoHtml(query: string) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`

  const response = await fetchWithTimeout(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 HumanSurfaceExternalScanner/1.0',
      accept: 'text/html,application/xhtml+xml',
      'accept-language': 'en-US,en;q=0.9,it;q=0.8',
    },
    cache: 'no-store',
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`DuckDuckGo search failed with HTTP ${response.status}`)
  }

  return await response.text()
}

function parseSearchResults(
  html: string,
  query: string,
  companyDomain: string,
): ExternalSearchResult[] {
  const $ = cheerio.load(html)
  const results: ExternalSearchResult[] = []
  const seen = new Set<string>()

  const candidates = [
    '.result',
    '.result.results_links',
    '.web-result',
    '.links_main',
  ]

  for (const selector of candidates) {
    $(selector).each((_, el) => {
      if (results.length >= MAX_RESULTS_PER_QUERY) return

      const linkEl =
        $(el).find('.result__title a').first().length > 0
          ? $(el).find('.result__title a').first()
          : $(el).find('a').first()

      const snippetEl =
        $(el).find('.result__snippet').first().length > 0
          ? $(el).find('.result__snippet').first()
          : $(el).find('.snippet').first()

      const rawHref = linkEl.attr('href') || ''
      const decodedHref = normalizeUrl(decodeDuckDuckGoRedirect(rawHref))
      const title = cleanText(linkEl.text())
      const snippet = cleanText(snippetEl.text())

      if (!decodedHref || !title) return
      if (seen.has(decodedHref)) return

      const parsed = tryParseUrl(decodedHref)
      if (!parsed) return

      if (!isLikelyUsefulResult(decodedHref, title, snippet, companyDomain)) return

      seen.add(decodedHref)

      results.push({
        query,
        title,
        url: decodedHref,
        snippet,
        sourceType: classifySourceType(decodedHref),
        sourceDomain: parsed.hostname || null,
      })
    })

    if (results.length > 0) break
  }

  return results
}

function dedupeResults(results: ExternalSearchResult[]) {
  const map = new Map<string, ExternalSearchResult>()

  for (const result of results) {
    const key = normalizeUrl(result.url).toLowerCase()
    if (!map.has(key)) {
      map.set(key, result)
    }
  }

  return Array.from(map.values())
}

export async function searchExternalPublicSources(
  seed: ExternalSearchSeed,
): Promise<ExternalSearchResponse> {
  const queries = buildQueries(seed)
  const companyDomain = cleanDomain(seed.domain)
  const collected: ExternalSearchResult[] = []
  const debug: ExternalSearchDebug[] = []

  for (const query of queries) {
    try {
      const html = await searchDuckDuckGoHtml(query)
      const parsed = parseSearchResults(html, query, companyDomain)

      collected.push(...parsed)

      debug.push({
        query,
        ok: true,
        resultCount: parsed.length,
      })
    } catch (error) {
      debug.push({
        query,
        ok: false,
        resultCount: 0,
        error: error instanceof Error ? error.message : 'Unknown search error',
      })
    }

    if (collected.length >= MAX_TOTAL_RESULTS) break
  }

  return {
    results: dedupeResults(collected).slice(0, MAX_TOTAL_RESULTS),
    debug,
  }
}
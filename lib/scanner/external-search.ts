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

function isLikelyUsefulResult(url: string, title: string, snippet: string, companyDomain: string) {
  const lower = `${url} ${title} ${snippet}`.toLowerCase()

  if (isSpamLikeText(lower)) return false

  const parsed = tryParseUrl(url)
  if (!parsed) return false

  const host = parsed.hostname.toLowerCase()

  if (
    host.includes('facebook.com') ||
    host.includes('instagram.com') ||
    host.includes('youtube.com') ||
    host.includes('tiktok.com')
  ) {
    return false
  }

  if (
    host.includes('linkedin.com') ||
    host.includes('crunchbase.com') ||
    host.includes('bloomberg.com') ||
    host.includes('rocketreach.co') ||
    host.includes('signalhire.com') ||
    host.includes('theorg.com') ||
    host.includes('indeed.') ||
    host.includes('glassdoor.') ||
    host.includes('welcome to the jungle')
  ) {
    return true
  }

  if (host.includes(companyDomain)) return true

  if (
    /ceo|cfo|coo|cto|founder|president|director|leadership|team|management|human resources|hr|finance|amministrazione|risorse umane|recruiting|careers|jobs|press|news|company/.test(
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

  const queries = [
    `"${name}" CEO`,
    `"${name}" CFO`,
    `"${name}" HR`,
    `"${name}" amministrazione`,
    `"${name}" finance`,
    `"${name}" recruiting`,
    `"${name}" LinkedIn`,
    `"${name}" site:linkedin.com/in`,
    `"${name}" site:${domain}`,
  ]

  return Array.from(new Set(queries))
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

  $('.result').each((_, el) => {
    if (results.length >= MAX_RESULTS_PER_QUERY) return

    const linkEl = $(el).find('.result__title a').first()
    const snippetEl = $(el).find('.result__snippet').first()

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

export async function searchExternalPublicSources(seed: ExternalSearchSeed) {
  const queries = buildQueries(seed)
  const companyDomain = cleanDomain(seed.domain)
  const collected: ExternalSearchResult[] = []

  for (const query of queries) {
    try {
      const html = await searchDuckDuckGoHtml(query)
      const parsed = parseSearchResults(html, query, companyDomain)
      collected.push(...parsed)
    } catch {
      // ignore single-query failures for now
    }

    if (collected.length >= MAX_TOTAL_RESULTS) break
  }

  return dedupeResults(collected).slice(0, MAX_TOTAL_RESULTS)
}
import type {
  ExternalSearchResult,
  ExternalSearchSeed,
  ExternalSearchResponse,
  ExternalSearchDebug,
} from './external-search-types'

const FETCH_TIMEOUT_MS = 12000
const MAX_RESULTS_PER_QUERY = 5
const MAX_TOTAL_RESULTS = 20

type BraveSearchPayload = {
  web?: {
    results?: Array<{
      url?: string
      title?: string
      description?: string
      snippet?: string
    }>
  }
}

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

function normalizeUrl(url: string) {
  return url.replace(/#.*$/, '').replace(/\/+$/, '').trim()
}

function tryParseUrl(value: string) {
  try {
    return new URL(value)
  } catch {
    return null
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
  companyName: string,
) {
  const lower = `${url} ${title} ${snippet}`.toLowerCase()

  if (isSpamLikeText(lower)) return false

  const parsed = tryParseUrl(url)
  if (!parsed) return false

  const host = parsed.hostname.toLowerCase()

  if (
    host.includes('facebook.com') ||
    host.includes('instagram.com') ||
    host.includes('tiktok.com')
  ) {
    return false
  }

  if (
    host.includes(companyDomain) ||
    lower.includes(companyDomain) ||
    lower.includes(companyName.toLowerCase()) ||
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
  if (lower.includes('news')) return 'news'
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

async function searchBraveWeb(query: string) {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY

  if (!apiKey) {
    throw new Error('Missing BRAVE_SEARCH_API_KEY')
  }

  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${MAX_RESULTS_PER_QUERY}`

  const response = await fetchWithTimeout(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': apiKey,
    },
    cache: 'no-store',
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`Brave search failed with HTTP ${response.status}`)
  }

  return (await response.json()) as BraveSearchPayload
}

function parseBraveResults(
  payload: BraveSearchPayload,
  query: string,
  companyDomain: string,
  companyName: string,
): ExternalSearchResult[] {
  const rawResults = Array.isArray(payload?.web?.results) ? payload.web.results : []
  const results: ExternalSearchResult[] = []
  const seen = new Set<string>()

  for (const item of rawResults) {
    if (results.length >= MAX_RESULTS_PER_QUERY) break

    const url = normalizeUrl(String(item?.url || ''))
    const title = cleanText(String(item?.title || ''))
    const snippet = cleanText(String(item?.description || item?.snippet || ''))

    if (!url || !title) continue
    if (seen.has(url)) continue

    const parsed = tryParseUrl(url)
    if (!parsed) continue

    if (!isLikelyUsefulResult(url, title, snippet, companyDomain, companyName)) {
      continue
    }

    seen.add(url)

    results.push({
      query,
      title,
      url,
      snippet,
      sourceType: classifySourceType(url),
      sourceDomain: parsed.hostname || null,
    })
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
      const payload = await searchBraveWeb(query)
      const parsed = parseBraveResults(
        payload,
        query,
        companyDomain,
        seed.organizationName,
      )

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

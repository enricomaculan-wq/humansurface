import * as cheerio from 'cheerio'

const KEYWORDS = [
  'about',
  'about-us',
  'chi-siamo',
  'team',
  'leadership',
  'management',
  'company',
  'contact',
  'contacts',
  'contatti',
  'careers',
  'career',
  'jobs',
  'job',
  'lavora-con-noi',
  'work-with-us',
  'join-us',
  'people',
  'staff',
  'board',
  'press',
  'news',
  'media',
  'investors',
  'governance',
  'sustainability',
  'organization',
  'organizzazione',
  'certificazioni',
  'certifications',
  'private-label',
]

const COMMON_PATHS = [
  '/',
  '/contact',
  '/contacts',
  '/contatti',
  '/about',
  '/about-us',
  '/chi-siamo',
  '/company',
  '/team',
  '/leadership',
  '/management',
  '/people',
  '/board',
  '/certificazioni',
  '/certifications',
  '/careers',
  '/jobs',
  '/investors',
  '/governance',
  '/brochure.pdf',
  '/company-profile.pdf',
  '/profile.pdf',
]

const FETCH_TIMEOUT_MS = 4000
const MAX_FINAL_URLS = 12
const MAX_SUBPAGES_TO_EXPLORE = 3
const MAX_LINKS_PER_SUBPAGE = 10

function cleanDomain(domain: string) {
  return domain
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '')
}

function normalizeUrl(url: string) {
  return url
    .replace(/#.*$/, '')
    .replace(/\?.*$/, '')
    .replace(/\/+$/, '')
}

function isSameHost(base: URL, target: URL) {
  return (
    base.hostname === target.hostname ||
    target.hostname === `www.${base.hostname}` ||
    `www.${target.hostname}` === base.hostname
  )
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
    KEYWORDS.some((keyword) => lower.includes(keyword)) ||
    lower.includes('certificazioni') ||
    lower.includes('certifications') ||
    lower.includes('private-label')

  return isNewsLike && !hasCorporateSignals
}

function isRelevant(url: string) {
  const lower = url.toLowerCase()

  if (isSpamLikeUrl(lower)) return false
  if (isLikelyIrrelevantArticle(lower)) return false

  return KEYWORDS.some((keyword) => lower.includes(keyword)) || lower.endsWith('.pdf')
}

function isMaybeUseful(url: string) {
  const lower = url.toLowerCase()

  if (isSpamLikeUrl(lower)) return false
  if (isLikelyIrrelevantArticle(lower)) return false

  return isRelevant(lower) || lower.split('/').filter(Boolean).length <= 2
}

function isSkippableHref(href: string) {
  const lower = href.toLowerCase().trim()

  return (
    !lower ||
    lower.startsWith('#') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:') ||
    lower.startsWith('javascript:') ||
    lower.startsWith('data:')
  )
}

function tryBuildUrl(raw: string, base?: string) {
  try {
    const cleaned = raw.trim()
    if (!cleaned) return null
    return base ? new URL(cleaned, base) : new URL(cleaned)
  } catch {
    return null
  }
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

async function tryFetchText(url: string) {
  try {
    const response = await fetchWithTimeout(url, {
      headers: { 'user-agent': 'HumanSurfaceScanner/1.0' },
      cache: 'no-store',
      redirect: 'follow',
    })

    if (!response.ok) return null

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) return null

    return await response.text()
  } catch {
    return null
  }
}

async function resolveHomepage(domain: string) {
  const cleaned = cleanDomain(domain)
  const candidates = [
    `https://${cleaned}`,
    `https://www.${cleaned}`,
    `http://${cleaned}`,
    `http://www.${cleaned}`,
  ]

  const attempts = await Promise.all(
    candidates.map(async (candidate) => ({
      candidate,
      html: await tryFetchText(candidate),
    })),
  )

  const success = attempts.find((item) => item.html)
  if (success?.html) {
    return { homepage: success.candidate, html: success.html }
  }

  return { homepage: `https://${cleaned}`, html: '' }
}

async function collectLinksFromPage(
  pageUrl: string,
  baseUrl: URL,
  maxLinks = MAX_LINKS_PER_SUBPAGE,
) {
  const html = await tryFetchText(pageUrl)
  if (!html) return []

  const $ = cheerio.load(html)
  const urls = new Set<string>()

  $('a[href]').each((_, el) => {
    if (urls.size >= maxLinks) return

    const href = $(el).attr('href')
    if (!href || isSkippableHref(href)) return

    const resolved = tryBuildUrl(href, pageUrl)
    if (!resolved) return
    if (!isSameHost(baseUrl, resolved)) return

    const normalized = normalizeUrl(resolved.toString())
    if (!normalized) return
    if (isSpamLikeUrl(normalized)) return
    if (isLikelyIrrelevantArticle(normalized)) return

    if (isMaybeUseful(normalized)) {
      urls.add(normalized)
    }
  })

  return Array.from(urls)
}

function rankUrls(urls: string[]) {
  return [...urls].sort((a, b) => {
    const aRelevant = isRelevant(a) ? 1 : 0
    const bRelevant = isRelevant(b) ? 1 : 0

    if (aRelevant !== bRelevant) return bRelevant - aRelevant
    if (a.endsWith('.pdf') !== b.endsWith('.pdf')) return a.endsWith('.pdf') ? 1 : -1

    const aDepth = a.split('/').filter(Boolean).length
    const bDepth = b.split('/').filter(Boolean).length
    return aDepth - bDepth
  })
}

export async function discoverRelevantUrls(domain: string) {
  const { homepage, html } = await resolveHomepage(domain)
  const baseUrl = new URL(homepage)

  const priorityUrls = new Set<string>()
  const secondaryUrls = new Set<string>()

  priorityUrls.add(normalizeUrl(homepage))

  for (const path of COMMON_PATHS) {
    const resolved = tryBuildUrl(path, homepage)
    if (!resolved) continue

    const normalized = normalizeUrl(resolved.toString())
    if (!normalized) continue
    if (isSpamLikeUrl(normalized)) continue
    if (isLikelyIrrelevantArticle(normalized)) continue

    if (isRelevant(normalized)) {
      priorityUrls.add(normalized)
    } else if (isMaybeUseful(normalized)) {
      secondaryUrls.add(normalized)
    }
  }

  if (html) {
    const $ = cheerio.load(html)

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')
      if (!href || isSkippableHref(href)) return

      const resolved = tryBuildUrl(href, homepage)
      if (!resolved) return
      if (!isSameHost(baseUrl, resolved)) return

      const normalized = normalizeUrl(resolved.toString())
      if (!normalized) return
      if (isSpamLikeUrl(normalized)) return
      if (isLikelyIrrelevantArticle(normalized)) return

      if (isRelevant(normalized)) {
        priorityUrls.add(normalized)
      } else if (isMaybeUseful(normalized)) {
        secondaryUrls.add(normalized)
      }
    })
  }

  const firstPass = rankUrls([
    ...new Set([...priorityUrls, ...secondaryUrls]),
  ]).slice(0, MAX_SUBPAGES_TO_EXPLORE)

  const discoveredFromSubpages = new Set<string>()

  const subpageResults = await Promise.all(
    firstPass
      .filter((url) => !url.toLowerCase().endsWith('.pdf'))
      .map((url) => collectLinksFromPage(url, baseUrl, MAX_LINKS_PER_SUBPAGE)),
  )

  for (const links of subpageResults) {
    for (const subUrl of links) {
      if (isRelevant(subUrl)) {
        discoveredFromSubpages.add(subUrl)
      }
    }
  }

  const finalUrls = rankUrls([
    ...new Set([
      ...priorityUrls,
      ...discoveredFromSubpages,
      ...secondaryUrls,
    ]),
  ])

  return finalUrls.slice(0, MAX_FINAL_URLS)
}
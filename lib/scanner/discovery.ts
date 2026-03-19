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
]

const COMMON_PATHS = [
  '/',
  '/about',
  '/about-us',
  '/chi-siamo',
  '/team',
  '/leadership',
  '/management',
  '/company',
  '/contact',
  '/contacts',
  '/contatti',
  '/careers',
  '/career',
  '/jobs',
  '/job',
  '/lavora-con-noi',
  '/lavora-con-noi',
  '/work-with-us',
  '/join-us',
  '/people',
  '/staff',
  '/board',
  '/press',
  '/news',
  '/media',
  '/investors',
  '/governance',
  '/sustainability',
  '/organization',
  '/organizzazione',
  '/brochure.pdf',
  '/company-profile.pdf',
  '/profile.pdf',
  '/media-kit.pdf',
  '/press-kit.pdf',
  '/about/company-profile.pdf',
]

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

function isRelevant(url: string) {
  const lower = url.toLowerCase()
  return KEYWORDS.some((keyword) => lower.includes(keyword)) || lower.endsWith('.pdf')
}

function isMaybeUseful(url: string) {
  const lower = url.toLowerCase()

  return (
    isRelevant(lower) ||
    lower.split('/').filter(Boolean).length <= 2
  )
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

async function tryFetchText(url: string) {
  try {
    const response = await fetch(url, {
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

async function exists(url: string) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 'user-agent': 'HumanSurfaceScanner/1.0' },
      cache: 'no-store',
      redirect: 'follow',
    })

    return response.ok
  } catch {
    return false
  }
}

async function resolveHomepage(domain: string) {
  const cleaned = cleanDomain(domain)
  const candidates = [`https://${cleaned}`, `http://${cleaned}`]

  for (const candidate of candidates) {
    const html = await tryFetchText(candidate)
    if (html) {
      return { homepage: candidate, html }
    }
  }

  throw new Error(`Unable to load homepage for domain: ${domain}`)
}

async function collectLinksFromPage(
  pageUrl: string,
  baseUrl: URL,
  maxLinks = 30,
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

    if (isMaybeUseful(normalized)) {
      urls.add(normalized)
    }
  })

  return Array.from(urls)
}

export async function discoverRelevantUrls(domain: string) {
  const { homepage, html } = await resolveHomepage(domain)
  const baseUrl = new URL(homepage)
  const $ = cheerio.load(html)

  const priorityUrls = new Set<string>()
  const secondaryUrls = new Set<string>()

  priorityUrls.add(normalizeUrl(homepage))

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')
    if (!href || isSkippableHref(href)) return

    const resolved = tryBuildUrl(href, homepage)
    if (!resolved) return
    if (!isSameHost(baseUrl, resolved)) return

    const normalized = normalizeUrl(resolved.toString())
    if (!normalized) return

    if (isRelevant(normalized)) {
      priorityUrls.add(normalized)
    } else if (isMaybeUseful(normalized)) {
      secondaryUrls.add(normalized)
    }
  })

  for (const path of COMMON_PATHS) {
    const resolved = tryBuildUrl(path, homepage)
    if (!resolved) continue

    const normalized = normalizeUrl(resolved.toString())
    if (!normalized) continue

    if (await exists(normalized)) {
      if (isRelevant(normalized)) {
        priorityUrls.add(normalized)
      } else {
        secondaryUrls.add(normalized)
      }
    }
  }

  const firstPass = Array.from(
    new Set([...priorityUrls, ...secondaryUrls].slice(0, 12))
  )

  const discoveredFromSubpages = new Set<string>()

  for (const url of firstPass) {
    const subLinks = await collectLinksFromPage(url, baseUrl, 20)

    for (const subUrl of subLinks) {
      if (isRelevant(subUrl)) {
        discoveredFromSubpages.add(subUrl)
      }
    }
  }

  const finalUrls = Array.from(
    new Set([
      ...priorityUrls,
      ...discoveredFromSubpages,
      ...secondaryUrls,
    ])
  )

  return finalUrls.slice(0, 30)
}
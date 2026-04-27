import { NextResponse } from 'next/server'

type MockItem = {
  id: string
  source_type: string
  source_name: string
  event_type: string
  title: string
  email?: string
  domain?: string
  brand?: string
  username?: string
  snippet?: string
  url?: string
  confidence?: number
  observed_at: string
}

const ALL_ITEMS: MockItem[] = [
  {
    id: 'mock-001',
    source_type: 'stealer_log',
    source_name: 'Mock Dark Web Feed',
    event_type: 'credential_exposure',
    title: 'Credential exposure detected for admin@humansurface.demo',
    email: 'admin@humansurface.demo',
    domain: 'humansurface.demo',
    snippet: 'Matched asset admin@humansurface.demo in credential context',
    url: 'https://mock-source.local/item/mock-001',
    confidence: 0.95,
    observed_at: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 'mock-002',
    source_type: 'forum_post',
    source_name: 'Mock Dark Web Feed',
    event_type: 'brand_mention',
    title: 'Brand mention detected in phishing kit discussion',
    domain: 'humansurface.demo',
    brand: 'HumanSurface',
    snippet: 'HumanSurface brand assets referenced in phishing discussion',
    confidence: 0.82,
    observed_at: '2026-04-01T10:05:00.000Z',
  },
  {
    id: 'mock-003',
    source_type: 'marketplace',
    source_name: 'Mock Dark Web Feed',
    event_type: 'access_mention',
    title: 'Possible admin access mention for humansurface.demo',
    domain: 'humansurface.demo',
    username: 'admin.panel',
    snippet: 'Access brokerage post references admin.panel and humansurface.demo',
    confidence: 0.78,
    observed_at: '2026-04-01T10:10:00.000Z',
  },
  {
    id: 'mock-004',
    source_type: 'stealer_log',
    source_name: 'Mock Dark Web Feed',
    event_type: 'credential_exposure',
    title: 'Credential exposure detected for support@humansurface.demo',
    email: 'support@humansurface.demo',
    domain: 'humansurface.demo',
    snippet: 'Support mailbox seen in exposed dataset',
    confidence: 0.9,
    observed_at: '2026-04-01T10:15:00.000Z',
  },
]

function indexFromCursor(cursor: string | null) {
  if (!cursor) return 0
  const parsed = Number(cursor)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const cursor = searchParams.get('cursor')
  const since = searchParams.get('since')
  const limitParam = Number(searchParams.get('limit') ?? '2')
  const limit = Number.isFinite(limitParam)
    ? Math.max(1, Math.min(50, limitParam))
    : 2

  let items = [...ALL_ITEMS]

  if (since) {
    const sinceTs = new Date(since).getTime()
    if (!Number.isNaN(sinceTs)) {
      items = items.filter((item) => new Date(item.observed_at).getTime() > sinceTs)
    }
  }

  const startIndex = indexFromCursor(cursor)
  const slice = items.slice(startIndex, startIndex + limit)
  const nextIndex = startIndex + slice.length
  const nextCursor = nextIndex < items.length ? String(nextIndex) : null

  return NextResponse.json({
    items: slice,
    next_cursor: nextCursor,
    total_available: items.length,
  })
}
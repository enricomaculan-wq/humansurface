import { NextRequest, NextResponse } from 'next/server'
import { runAllActiveDarkwebConnectors } from '@/lib/darkweb/connectors/run-all'

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null

  return !!process.env.DARKWEB_CRON_SECRET && bearer === process.env.DARKWEB_CRON_SECRET
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const results = await runAllActiveDarkwebConnectors()

    return NextResponse.json({
      ok: true,
      results,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
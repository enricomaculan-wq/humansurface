import { NextResponse } from 'next/server'
import { processDarkwebRawEvent } from '@/lib/darkweb/matcher'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const rawEventId = body?.rawEventId

    if (!rawEventId || typeof rawEventId !== 'string') {
      return NextResponse.json({ error: 'rawEventId is required' }, { status: 400 })
    }

    const result = await processDarkwebRawEvent(rawEventId)

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    console.error('POST /api/darkweb/process failed:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          stack: error.stack,
        },
        { status: 500 }
      )
    }

    if (error && typeof error === 'object') {
      return NextResponse.json(
        {
          ok: false,
          error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        ok: false,
        error: String(error),
      },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { runAllActiveDarkwebConnectors } from '@/lib/darkweb/connectors/run-all'

export async function POST() {
  try {
    const result = await runAllActiveDarkwebConnectors({
      triggerType: 'cron',
      limit: 100,
    })
    const { ok, ...summary } = result

    return NextResponse.json({
      ok,
      mode: 'cron',
      ...summary,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected cron error',
      },
      { status: 500 }
    )
  }
}

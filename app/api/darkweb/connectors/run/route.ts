import { NextResponse } from 'next/server'
import { runAllActiveDarkwebConnectors } from '@/lib/darkweb/connectors/run-all'
import { runDarkwebConnector } from '@/lib/darkweb/connectors/run-connector'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const connectorId =
      typeof body?.connectorId === 'string' ? body.connectorId.trim() : ''
    const organizationId =
      typeof body?.organizationId === 'string' ? body.organizationId.trim() : ''
    const includePaused = body?.includePaused === true
    const limit =
      typeof body?.limit === 'number' && Number.isFinite(body.limit)
        ? Math.max(1, Math.min(100, body.limit))
        : 50

    if (connectorId) {
      const result = await runDarkwebConnector(connectorId)

      return NextResponse.json({
        ok: true,
        mode: 'single',
        result,
      })
    }

    const result = await runAllActiveDarkwebConnectors({
      organizationId: organizationId || undefined,
      triggerType: 'system',
      includePaused,
      limit,
    })

    return NextResponse.json({
      mode: 'bulk',
      ...result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      },
      { status: 500 }
    )
  }
}
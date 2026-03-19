import { NextResponse } from 'next/server'
import { requireAuthenticatedUser } from '@/lib/auth'
import { runPublicScanForOrganization } from '@/lib/scanner/run-scan'

export async function POST(req: Request) {
  try {
    await requireAuthenticatedUser()

    const body = await req.json()
    const organizationId = body?.organizationId as string | undefined

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 },
      )
    }

    const result = await runPublicScanForOrganization(organizationId)

    return NextResponse.json({
      ok: true,
      result,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected scanner error.'

    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
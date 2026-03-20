import { NextRequest, NextResponse } from 'next/server'
import { runExternalPublicScanForAssessment } from '@/lib/scanner/run-external-scan'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const assessmentId =
      typeof body?.assessmentId === 'string' ? body.assessmentId.trim() : ''
    const organizationId =
      typeof body?.organizationId === 'string' ? body.organizationId.trim() : ''

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'assessmentId is required.' },
        { status: 400 },
      )
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required.' },
        { status: 400 },
      )
    }

    const result = await runExternalPublicScanForAssessment(
      assessmentId,
      organizationId,
    )

    return NextResponse.json({
      ok: true,
      result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unknown external scan error',
      },
      { status: 500 },
    )
  }
}
import { NextResponse } from 'next/server'

const DISABLED_CHECKOUT_MESSAGE =
  'Direct online checkout is currently unavailable. Please request a consultation first.'

export async function POST() {
  return NextResponse.json(
    {
      error: DISABLED_CHECKOUT_MESSAGE,
      consultationUrl: '/buy',
    },
    { status: 410 },
  )
}

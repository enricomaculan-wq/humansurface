import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const rawStripeSecretKey = process.env.STRIPE_SECRET_KEY
const rawStripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

if (!rawStripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

if (!rawStripeWebhookSecret) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET')
}

const stripeSecretKey: string = rawStripeSecretKey
const stripeWebhookSecret: string = rawStripeWebhookSecret

const stripe = new Stripe(stripeSecretKey)

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Invalid webhook signature',
      },
      { status: 400 },
    )
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId
      const paymentStatus = session.payment_status

      if (orderId) {
        const updatePayload: Record<string, unknown> = {
          status: paymentStatus === 'paid' ? 'paid' : 'payment_received',
          stripe_payment_status: paymentStatus,
        }

        if (paymentStatus === 'paid') {
          updatePayload.paid_at = new Date().toISOString()
        }

        const { error } = await supabaseAdmin
          .from('assessment_orders')
          .update(updatePayload)
          .eq('id', orderId)

        if (error) {
          return NextResponse.json(
            { error: `Supabase update failed: ${error.message}` },
            { status: 500 },
          )
        }
      }
    }

    if (event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (orderId) {
        const { error } = await supabaseAdmin
          .from('assessment_orders')
          .update({
            status: 'paid',
            stripe_payment_status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('id', orderId)

        if (error) {
          return NextResponse.json(
            { error: `Supabase update failed: ${error.message}` },
            { status: 500 },
          )
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (orderId) {
        const { error } = await supabaseAdmin
          .from('assessment_orders')
          .update({
            status: 'expired',
            stripe_payment_status: 'expired',
          })
          .eq('id', orderId)

        if (error) {
          return NextResponse.json(
            { error: `Supabase update failed: ${error.message}` },
            { status: 500 },
          )
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Webhook handler failed',
      },
      { status: 500 },
    )
  }
}
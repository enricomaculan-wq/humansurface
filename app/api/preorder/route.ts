import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

const stripe = new Stripe(stripeSecretKey)

const PRODUCT_NAME = 'HumanSurface Assessment'
const UNIT_AMOUNT = 19000

function normalizeDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidDomain(domain: string) {
  return /^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)
}

function getBaseUrl(req: Request) {
  const url = new URL(req.url)
  return `${url.protocol}//${url.host}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const companyName = (body.companyName ?? '').trim()
    const email = (body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '').trim()
    const notes = (body.notes ?? '').trim()
    const domain = normalizeDomain(body.domain ?? '')

    if (!companyName) {
      return NextResponse.json({ error: 'Inserisci il nome azienda.' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Inserisci un indirizzo email valido.' }, { status: 400 })
    }

    if (!isValidDomain(domain)) {
      return NextResponse.json({ error: 'Inserisci un dominio valido.' }, { status: 400 })
    }

    if (password.length < 8) {
        return NextResponse.json(
            { error: 'Password must be at least 8 characters long.' },
            { status: 400 },
        )
}

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('assessment_orders')
      .insert({
        company_name: companyName,
        domain,
        email,
        password_hash: password,
        billing_status: 'pending',
        notes: notes || null,
        status: 'pending_payment',
        stripe_payment_status: 'unpaid',
      })
      .select('id')
      .single()

    if (orderError || !orderData) {
      return NextResponse.json(
        { error: `Errore salvataggio ordine: ${orderError?.message || 'unknown'}` },
        { status: 500 },
      )
    }

    const orderId = orderData.id as string
    const baseUrl = getBaseUrl(req)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      billing_address_collection: 'auto',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: UNIT_AMOUNT,
            product_data: {
              name: PRODUCT_NAME,
              description:
                'Website scan, external exposure analysis, people and role visibility, website/external/combined scoring, and executive-ready reporting.',
            },
          },
        },
      ],
      metadata: {
        orderId,
        companyName,
        domain,
        email,
      },
      success_url: `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/buy?canceled=1`,
    })

    const { error: updateError } = await supabaseAdmin
      .from('assessment_orders')
      .update({
        stripe_session_id: session.id,
        stripe_payment_status: 'pending',
      })
      .eq('id', orderId)

    if (updateError) {
      return NextResponse.json(
        { error: `Errore aggiornamento ordine: ${updateError.message}` },
        { status: 500 },
      )
    }

    if (!session.url) {
      return NextResponse.json(
        { error: 'Checkout Stripe non disponibile.' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      checkoutUrl: session.url,
      orderId,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Errore imprevisto.',
      },
      { status: 500 },
    )
  }
}
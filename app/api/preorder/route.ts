import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

const stripe = new Stripe(stripeSecretKey)

const PRODUCT_NAME = 'HumanSurface Assessment'
const UNIT_AMOUNT = 100

function normalizeDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
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

type ExistingCompanyRow = {
  id: string
}

type ExistingCompanyUserRow = {
  id: string
  email: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const companyName = (body.companyName ?? '').trim()
    const email = normalizeEmail(body.email ?? '')
    const notes = (body.notes ?? '').trim()
    const domain = normalizeDomain(body.domain ?? '')
    const fullName = (body.fullName ?? '').trim()

    if (!companyName) {
      return NextResponse.json({ error: 'Inserisci il nome azienda.' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Inserisci un indirizzo email valido.' },
        { status: 400 },
      )
    }

    if (!isValidDomain(domain)) {
      return NextResponse.json({ error: 'Inserisci un dominio valido.' }, { status: 400 })
    }

    let companyId: string

    const { data: existingCompanyData, error: existingCompanyError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('domain', domain)
      .maybeSingle()

    if (existingCompanyError) {
      return NextResponse.json(
        { error: `Errore lettura company: ${existingCompanyError.message}` },
        { status: 500 },
      )
    }

    const existingCompany = existingCompanyData as ExistingCompanyRow | null

    if (existingCompany?.id) {
      companyId = existingCompany.id
    } else {
      const { data: companyData, error: companyError } = await supabaseAdmin
        .from('companies')
        .insert({
          name: companyName,
          domain,
        })
        .select('id')
        .single()

      if (companyError || !companyData) {
        return NextResponse.json(
          { error: `Errore creazione company: ${companyError?.message || 'unknown'}` },
          { status: 500 },
        )
      }

      companyId = companyData.id as string
    }

    let companyUserId: string

    const { data: existingCompanyUserData, error: existingCompanyUserError } =
      await supabaseAdmin
        .from('company_users')
        .select('id, email')
        .eq('email', email)
        .maybeSingle()

    if (existingCompanyUserError) {
      return NextResponse.json(
        {
          error: `Errore lettura utente company: ${existingCompanyUserError.message}`,
        },
        { status: 500 },
      )
    }

    const existingCompanyUser =
      existingCompanyUserData as ExistingCompanyUserRow | null

    if (existingCompanyUser?.id) {
      companyUserId = existingCompanyUser.id
    } else {
      const { data: insertedCompanyUserData, error: insertedCompanyUserError } =
        await supabaseAdmin
          .from('company_users')
          .insert({
            company_id: companyId,
            email,
            full_name: fullName || null,
            role: 'owner',
          })
          .select('id')
          .single()

      if (insertedCompanyUserError || !insertedCompanyUserData) {
        return NextResponse.json(
          {
            error: `Errore creazione utente company: ${
              insertedCompanyUserError?.message || 'unknown'
            }`,
          },
          { status: 500 },
        )
      }

      companyUserId = insertedCompanyUserData.id as string
    }

    const { data: billingData, error: billingCheckError } = await supabaseAdmin
      .from('billing_profiles')
      .select('id')
      .eq('company_id', companyId)
      .maybeSingle()

    if (billingCheckError) {
      return NextResponse.json(
        { error: `Errore controllo billing profile: ${billingCheckError.message}` },
        { status: 500 },
      )
    }

    if (!billingData?.id) {
      const { error: billingInsertError } = await supabaseAdmin
        .from('billing_profiles')
        .insert({
          company_id: companyId,
          status: 'pending',
        })

      if (billingInsertError) {
        return NextResponse.json(
          {
            error: `Errore creazione billing profile: ${billingInsertError.message}`,
          },
          { status: 500 },
        )
      }
    }

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('assessment_orders')
      .insert({
        company_name: companyName,
        domain,
        email,
        notes: notes || null,
        status: 'pending_payment',
        stripe_payment_status: 'unpaid',
        billing_status: 'pending',
        company_id: companyId,
        company_user_id: companyUserId,
      })
      .select('id')
      .single()

    if (orderError || !orderData) {
      return NextResponse.json(
        {
          error: `Errore salvataggio ordine: ${orderError?.message || 'unknown'}`,
        },
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
        companyId,
        companyUserId,
        companyName,
        domain,
        email,
      },
      success_url: `${baseUrl}/billing/complete?session_id={CHECKOUT_SESSION_ID}`,
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
      companyId,
      companyUserId,
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
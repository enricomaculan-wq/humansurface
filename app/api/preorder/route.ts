import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const STRIPE_PAYMENT_LINK =
  'https://buy.stripe.com/4gM6oH5K02SDbSC5DE0RG04'

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

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const companyName = (body.companyName ?? '').trim()
    const email = (body.email ?? '').trim().toLowerCase()
    const notes = (body.notes ?? '').trim()
    const domain = normalizeDomain(body.domain ?? '')

    if (!companyName) {
      return NextResponse.json(
        { error: 'Inserisci il nome azienda.' },
        { status: 400 },
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Inserisci un indirizzo email valido.' },
        { status: 400 },
      )
    }

    if (!isValidDomain(domain)) {
      return NextResponse.json(
        { error: 'Inserisci un dominio valido.' },
        { status: 400 },
      )
    }

    const { error } = await supabaseAdmin.from('assessment_orders').insert({
      company_name: companyName,
      domain,
      email,
      notes: notes || null,
      status: 'pending_payment',
      stripe_payment_link: STRIPE_PAYMENT_LINK,
    })

    if (error) {
      return NextResponse.json(
        { error: `Errore salvataggio ordine: ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      checkoutUrl: STRIPE_PAYMENT_LINK,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Errore imprevisto.',
      },
      { status: 500 },
    )
  }
}
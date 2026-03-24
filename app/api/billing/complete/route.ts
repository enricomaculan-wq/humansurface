import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

type OrderRow = {
  id: string
  company_id: string | null
  company_name: string
  domain: string
  email: string
  organization_id: string | null
  assessment_id: string | null
}

type OrganizationRow = {
  id: string
  name: string
  domain: string
}

async function triggerAssessmentScan(baseUrl: string, assessmentId: string) {
  try {
    const response = await fetch(`${baseUrl}/api/external-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assessmentId,
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Scan trigger failed: ${response.status} ${text}`)
    }
  } catch (error) {
    console.error('Failed to trigger assessment scan', error)
  }
}

function getBaseUrl(req: Request) {
  const url = new URL(req.url)
  return `${url.protocol}//${url.host}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const sessionId = String(body.sessionId ?? '').trim()
    const legalName = String(body.legalName ?? '').trim()
    const vatNumber = String(body.vatNumber ?? '').trim()
    const taxCode = String(body.taxCode ?? '').trim()
    const addressLine1 = String(body.addressLine1 ?? '').trim()
    const city = String(body.city ?? '').trim()
    const postalCode = String(body.postalCode ?? '').trim()
    const country = String(body.country ?? '').trim()
    const sdiCode = String(body.sdiCode ?? '').trim()
    const pec = String(body.pec ?? '').trim()

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID.' }, { status: 400 })
    }

    if (!legalName || !addressLine1 || !city || !postalCode || !country) {
      return NextResponse.json(
        { error: 'Please fill in all required billing fields.' },
        { status: 400 },
      )
    }

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('assessment_orders')
      .select('id, company_id, company_name, domain, organization_id, assessment_id, email')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    if (orderError) {
      return NextResponse.json(
        { error: `Order lookup failed: ${orderError.message}` },
        { status: 500 },
      )
    }

    if (!orderData) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    }

    const order = orderData as OrderRow

    if (!order.company_id) {
      return NextResponse.json(
        { error: 'Associated company not found for this payment.' },
        { status: 404 },
      )
    }

    const { error: billingError } = await supabaseAdmin
      .from('billing_profiles')
      .update({
        legal_name: legalName,
        vat_number: vatNumber || null,
        tax_code: taxCode || null,
        address_line_1: addressLine1,
        city,
        postal_code: postalCode,
        country,
        sdi_code: sdiCode || null,
        pec: pec || null,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', order.company_id)

    if (billingError) {
      return NextResponse.json(
        { error: `Billing update failed: ${billingError.message}` },
        { status: 500 },
      )
    }

    let organizationId = order.organization_id
    let assessmentId = order.assessment_id

    if (!organizationId) {
      const { data: existingOrganization, error: existingOrganizationError } =
        await supabaseAdmin
          .from('organizations')
          .select('id, name, domain')
          .eq('domain', order.domain)
          .maybeSingle()

      if (existingOrganizationError) {
        return NextResponse.json(
          { error: `Organization lookup failed: ${existingOrganizationError.message}` },
          { status: 500 },
        )
      }

      if (existingOrganization?.id) {
        organizationId = (existingOrganization as OrganizationRow).id
      } else {
        const { data: organizationData, error: organizationError } =
          await supabaseAdmin
            .from('organizations')
            .insert({
              name: order.company_name,
              domain: order.domain,
              industry: null,
            })
            .select('id')
            .single()

        if (organizationError || !organizationData) {
          return NextResponse.json(
            {
              error: `Organization creation failed: ${
                organizationError?.message || 'unknown'
              }`,
            },
            { status: 500 },
          )
        }

        organizationId = organizationData.id as string
      }
    }

    if (!assessmentId) {
      const { data: assessmentData, error: assessmentError } = await supabaseAdmin
        .from('assessments')
        .insert({
          organization_id: organizationId,
          status: 'processing',
          overall_score: 0,
          overall_risk_level: 'low',
          scan_diagnostics: {
            source: 'post_payment_billing_completion',
            createdAt: new Date().toISOString(),
            customerVisibility: 'hidden_until_ready',
          },
        })
        .select('id')
        .single()

      if (assessmentError || !assessmentData) {
        return NextResponse.json(
          {
            error: `Assessment creation failed: ${
              assessmentError?.message || 'unknown'
            }`,
          },
          { status: 500 },
        )
      }

      assessmentId = assessmentData.id as string
    }

    const baseUrl = getBaseUrl(req)
    void triggerAssessmentScan(baseUrl, assessmentId)

    const { error: orderUpdateError } = await supabaseAdmin
      .from('assessment_orders')
      .update({
        billing_status: 'completed',
        organization_id: organizationId,
        assessment_id: assessmentId,
        fulfillment_status: 'created',
      })
      .eq('id', order.id)

    if (orderUpdateError) {
      return NextResponse.json(
        { error: `Order update failed: ${orderUpdateError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      organizationId,
      assessmentId,
      email: order.email,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected error',
      },
      { status: 500 },
    )
  }
}
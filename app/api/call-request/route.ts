import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const resendApiKey = process.env.RESEND_API_KEY
const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL
const notificationFromEmail = process.env.NOTIFICATION_FROM_EMAIL

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

async function sendAdminCallRequestNotification(input: {
  fullName: string
  companyName: string
  domain: string
  email: string
  role: string
  companySize: string
  notes: string
}) {
  if (!resendApiKey || !adminNotificationEmail || !notificationFromEmail) {
    console.warn(
      'Call request notification skipped: missing RESEND_API_KEY, ADMIN_NOTIFICATION_EMAIL, or NOTIFICATION_FROM_EMAIL',
    )
    return
  }

  const subject = `New HumanSurface call request - ${input.companyName}`

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 16px;">New HumanSurface call request</h2>

      <table style="border-collapse: collapse; margin-top: 16px;">
        <tr>
          <td style="padding: 6px 12px 6px 0;"><strong>Full name</strong></td>
          <td style="padding: 6px 0;">${input.fullName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0;"><strong>Company</strong></td>
          <td style="padding: 6px 0;">${input.companyName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0;"><strong>Domain</strong></td>
          <td style="padding: 6px 0;">${input.domain}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0;"><strong>Email</strong></td>
          <td style="padding: 6px 0;">${input.email}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0;"><strong>Role</strong></td>
          <td style="padding: 6px 0;">${input.role || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0;"><strong>Company size</strong></td>
          <td style="padding: 6px 0;">${input.companySize || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0; vertical-align: top;"><strong>Notes</strong></td>
          <td style="padding: 6px 0;">${input.notes || '—'}</td>
        </tr>
      </table>

      <p style="margin-top: 24px;">
        Open Supabase or your admin workflow to follow up with this lead.
      </p>
    </div>
  `

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: notificationFromEmail,
      to: [adminNotificationEmail],
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('Call request admin email failed', text)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const fullName = String(body.fullName ?? '').trim()
    const companyName = String(body.companyName ?? '').trim()
    const domain = normalizeDomain(String(body.domain ?? ''))
    const email = normalizeEmail(String(body.email ?? ''))
    const role = String(body.role ?? '').trim()
    const companySize = String(body.companySize ?? '').trim()
    const notes = String(body.notes ?? '').trim()

    if (!fullName) {
      return NextResponse.json(
        { error: 'Please enter your full name.' },
        { status: 400 },
      )
    }

    if (!companyName) {
      return NextResponse.json(
        { error: 'Please enter your company name.' },
        { status: 400 },
      )
    }

    if (!isValidDomain(domain)) {
      return NextResponse.json(
        { error: 'Please enter a valid company domain.' },
        { status: 400 },
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid work email.' },
        { status: 400 },
      )
    }

    const { error } = await supabaseAdmin.from('call_requests').insert({
      full_name: fullName,
      company_name: companyName,
      domain,
      email,
      role: role || null,
      company_size: companySize || null,
      notes: notes || null,
      status: 'new',
    })

    if (error) {
      return NextResponse.json(
        { error: `Failed to save request: ${error.message}` },
        { status: 500 },
      )
    }

    await sendAdminCallRequestNotification({
      fullName,
      companyName,
      domain,
      email,
      role,
      companySize,
      notes,
    })

    return NextResponse.json({
      ok: true,
      message: 'Call request submitted successfully.',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unexpected server error.',
      },
      { status: 500 },
    )
  }
}
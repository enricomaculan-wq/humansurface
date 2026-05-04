import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const resendApiKey = process.env.RESEND_API_KEY
const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL
const notificationFromEmail = process.env.NOTIFICATION_FROM_EMAIL
const rateLimitWindowMs = 10 * 60 * 1000
const maxRequestsPerWindow = 3
const callRequestAttempts = new Map<string, { count: number; resetAt: number }>()
let lastRateLimitSweepAt = 0

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  const firstForwardedIp = forwardedFor?.split(',')[0]?.trim()

  return firstForwardedIp || req.headers.get('x-real-ip')?.trim() || 'unknown'
}

function checkRateLimit(key: string, now = Date.now()) {
  if (now - lastRateLimitSweepAt > rateLimitWindowMs) {
    lastRateLimitSweepAt = now

    for (const [attemptKey, attempt] of callRequestAttempts) {
      if (attempt.resetAt <= now) {
        callRequestAttempts.delete(attemptKey)
      }
    }
  }

  const attempt = callRequestAttempts.get(key)

  if (!attempt || attempt.resetAt <= now) {
    callRequestAttempts.set(key, {
      count: 1,
      resetAt: now + rateLimitWindowMs,
    })

    return { allowed: true, retryAfter: 0 }
  }

  if (attempt.count >= maxRequestsPerWindow) {
    return {
      allowed: false,
      retryAfter: Math.ceil((attempt.resetAt - now) / 1000),
    }
  }

  attempt.count += 1
  return { allowed: true, retryAfter: 0 }
}

function abuseResponse(retryAfter?: number) {
  const headers = retryAfter
    ? {
        'Retry-After': String(retryAfter),
      }
    : undefined

  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers,
    },
  )
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
  const fullName = escapeHtml(input.fullName)
  const companyName = escapeHtml(input.companyName)
  const domain = escapeHtml(input.domain)
  const email = escapeHtml(input.email)
  const role = input.role ? escapeHtml(input.role) : '—'
  const companySize = input.companySize ? escapeHtml(input.companySize) : '—'
  const notes = input.notes ? escapeHtml(input.notes) : '—'

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 16px;">New HumanSurface call request</h2>

      <table style="border-collapse: collapse; margin-top: 16px;">
        <tr>
          <td style="padding: 6px 12px 6px 0;"><strong>Full name</strong></td>
          <td style="padding: 6px 0;">${fullName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0;"><strong>Company</strong></td>
          <td style="padding: 6px 0;">${companyName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0;"><strong>Domain</strong></td>
          <td style="padding: 6px 0;">${domain}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0;"><strong>Email</strong></td>
          <td style="padding: 6px 0;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0;"><strong>Role</strong></td>
          <td style="padding: 6px 0;">${role}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0;"><strong>Company size</strong></td>
          <td style="padding: 6px 0;">${companySize}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0; vertical-align: top;"><strong>Notes</strong></td>
          <td style="padding: 6px 0;">${notes}</td>
        </tr>
      </table>

      <p style="margin-top: 24px;">
        Open Supabase or your admin workflow to follow up with this lead.
      </p>
    </div>
  `

  try {
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
      console.error('Call request admin email failed', {
        status: response.status,
        statusText: response.statusText,
        body: text,
      })
    }
  } catch (error) {
    console.error('Call request admin email failed', error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(getClientIp(req))

    if (!rateLimit.allowed) {
      return abuseResponse(rateLimit.retryAfter)
    }

    const body = await req.json()

    if (String(body.website ?? '').trim()) {
      return abuseResponse()
    }

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
      console.error('Call request insert failed', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })

      return NextResponse.json(
        {
          error: 'Failed to save request.',
          code: 'CALL_REQUEST_SAVE_FAILED',
        },
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
    console.error('Call request route failed', error)

    return NextResponse.json(
      {
        error: 'Unexpected server error.',
        code: 'CALL_REQUEST_UNEXPECTED_ERROR',
      },
      { status: 500 },
    )
  }
}

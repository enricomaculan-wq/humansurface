'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/app/components/i18n-provider'
import { createSupabaseAuthBrowserClient } from '@/lib/supabase-auth-browser'

export default function AuthForm({
  mode,
  initialEmail = '',
}: {
  mode: 'login' | 'signup'
  initialEmail?: string
}) {
  const { dictionary } = useI18n()
  const t = dictionary.auth.form
  const router = useRouter()
  const supabase = createSupabaseAuthBrowserClient()

  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function getAuthErrorMessage(authError: {
    code?: string
    message: string
    name?: string
    status?: number
  }) {
    const code = authError.code?.toLowerCase()
    const name = authError.name?.toLowerCase()
    const message = authError.message.toLowerCase()

    if (
      code === 'invalid_credentials' ||
      name === 'authinvalidcredentialserror' ||
      message.includes('invalid login credentials') ||
      message.includes('invalid credentials') ||
      message.includes('email or password')
    ) {
      return t.invalidCredentials
    }

    if (
      code === 'email_not_confirmed' ||
      message.includes('email not confirmed')
    ) {
      return t.emailNotConfirmed
    }

    if (
      code === 'user_already_exists' ||
      code === 'email_exists' ||
      message.includes('user already registered') ||
      message.includes('already registered') ||
      message.includes('already exists') ||
      message.includes('already been registered')
    ) {
      return t.emailAlreadyRegistered
    }

    if (
      code === 'weak_password' ||
      name === 'authweakpassworderror' ||
      (message.includes('password') &&
        (message.includes('weak') ||
          message.includes('at least') ||
          message.includes('characters')))
    ) {
      return t.weakPassword
    }

    if (
      authError.status === 429 ||
      code === 'over_request_rate_limit' ||
      code === 'over_email_send_rate_limit' ||
      code === 'over_sms_send_rate_limit' ||
      code?.includes('rate_limit') ||
      message.includes('rate limit') ||
      message.includes('too many') ||
      message.includes('security purposes')
    ) {
      return t.tooManyAttempts
    }

    return t.authFailed
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result =
        mode === 'login'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password })

      if (result.error) {
        setError(getAuthErrorMessage(result.error))
        setLoading(false)
        return
      }

      await fetch('/api/auth/sync-user', {
        method: 'POST',
      })

      router.push('/client')
      router.refresh()
    } catch {
      setError(t.authFailed)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm text-slate-300">{t.emailLabel}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
          placeholder={t.emailPlaceholder}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">{t.passwordLabel}</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
          placeholder={t.passwordPlaceholder}
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950"
      >
        {loading
          ? t.pleaseWait
          : mode === 'login'
            ? t.loginSubmit
            : t.signupSubmit}
      </button>
    </form>
  )
}

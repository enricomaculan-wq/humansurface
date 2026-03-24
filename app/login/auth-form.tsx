'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseAuthBrowserClient } from '@/lib/supabase-auth-browser'

export default function AuthForm({
  mode,
  initialEmail = '',
}: {
  mode: 'login' | 'signup'
  initialEmail?: string
}) {
  const router = useRouter()
  const supabase = createSupabaseAuthBrowserClient()

  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        setError(result.error.message)
        setLoading(false)
        return
      }

      await fetch('/api/auth/sync-user', {
        method: 'POST',
      })

      router.push('/client')
      router.refresh()
    } catch {
      setError('Authentication failed.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm text-slate-300">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
          placeholder="name@company.com"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
          placeholder="Your password"
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
          ? 'Please wait...'
          : mode === 'login'
            ? 'Login'
            : 'Create account'}
      </button>
    </form>
  )
}
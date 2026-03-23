'use client'

import { useState } from 'react'

export default function BuyForm() {
  const [companyName, setCompanyName] = useState('')
  const [domain, setDomain] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/preorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          domain,
          email,
          password,
          notes,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result?.error || 'Error while creating the order.')
        setLoading(false)
        return
      }

      const checkoutUrl = String(result?.checkoutUrl ?? '').trim()

      if (!checkoutUrl) {
        setError('Payment link not available.')
        setLoading(false)
        return
      }

      window.location.assign(checkoutUrl)
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm text-slate-300">Company name</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
          placeholder="Example: HumanSurface Srl"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Company domain</label>
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
          placeholder="example.com"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Work email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
          placeholder="name@company.com"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
          placeholder="Create a password"
          required
          minLength={8}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Optional notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
          placeholder="Priorities, urgency, context..."
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
        className="w-full rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
      >
        {loading ? 'Redirecting to payment...' : 'Create account and continue to payment'}
      </button>
    </form>
  )
}
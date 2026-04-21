'use client'

import { useState } from 'react'

export default function BuyForm() {
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [domain, setDomain] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/call-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          companyName,
          domain,
          email,
          role,
          companySize,
          notes,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result?.error || 'Error while sending the request.')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)

      setFullName('')
      setCompanyName('')
      setDomain('')
      setEmail('')
      setRole('')
      setCompanySize('')
      setNotes('')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm text-slate-300">Full name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
          placeholder="Example: Mario Rossi"
          required
        />
      </div>

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
        <label className="mb-2 block text-sm text-slate-300">Role</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
          placeholder="Example: CEO, IT Manager, CFO"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Company size</label>
        <select
          value={companySize}
          onChange={(e) => setCompanySize(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
        >
          <option value="" className="bg-slate-900">
            Select company size
          </option>
          <option value="1-10" className="bg-slate-900">
            1-10
          </option>
          <option value="11-50" className="bg-slate-900">
            11-50
          </option>
          <option value="51-200" className="bg-slate-900">
            51-200
          </option>
          <option value="201-500" className="bg-slate-900">
            201-500
          </option>
          <option value="500+" className="bg-slate-900">
            500+
          </option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">
          What would you like to assess?
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
          placeholder="Priorities, concerns, urgency, business context..."
        />
      </div>

      <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-3 text-sm text-slate-200">
        We review each request manually and usually reply within 1 business day to
        arrange a short intro call.
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          Thanks — your request has been received. We will get back to you shortly
          to arrange a call.
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
      >
        {loading ? 'Sending request...' : 'Request a call'}
      </button>
    </form>
  )
}
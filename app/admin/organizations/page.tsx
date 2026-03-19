'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewOrganizationPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/admin/organizations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          domain,
          industry,
        }),
      })

      const result = await response.json()

      setLoading(false)

      if (!response.ok) {
        setError(result?.error || 'Failed to create organization.')
        return
      }

      setMessage('Organization created successfully.')
      setName('')
      setDomain('')
      setIndustry('')
      router.refresh()
    } catch {
      setLoading(false)
      setError('Network error while creating organization.')
    }
  }

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Admin
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            New Organization
          </h1>
          <p className="mt-3 text-slate-400">
            Create a new company profile to start a HumanSurface assessment.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Company name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Rossi Industriali S.r.l."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Domain
              </label>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
                placeholder="rossi-industriali.it"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Industry
              </label>
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Manufacturing"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Create organization'}
            </button>

            {message ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </main>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createSupabaseBrowserClient } from '@/lib/supabase'
const supabase = createSupabaseBrowserClient()
type OrganizationEditorProps = {
  id: string
  initialName: string
  initialDomain: string
  initialIndustry: string
}

export default function OrganizationEditor({
  id,
  initialName,
  initialDomain,
  initialIndustry,
}: OrganizationEditorProps) {
  const router = useRouter()

  const [name, setName] = useState(initialName)
  const [domain, setDomain] = useState(initialDomain)
  const [industry, setIndustry] = useState(initialIndustry)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    const { error } = await supabase
      .from('organizations')
      .update({
        name,
        domain,
        industry: industry || null,
      })
      .eq('id', id)

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Organization updated successfully.')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Company name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Domain</label>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            required
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Industry</label>
        <input
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl border border-cyan-300/30 bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
      >
        {loading ? 'Saving...' : 'Save changes'}
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
  )
}
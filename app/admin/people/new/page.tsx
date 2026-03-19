'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
const supabase = createSupabaseBrowserClient()

type Organization = {
  id: string
  name: string
  domain: string
}

export default function NewPersonPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [organizationId, setOrganizationId] = useState('')
  const [fullName, setFullName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [email, setEmail] = useState('')
  const [isKeyPerson, setIsKeyPerson] = useState(false)

  const [loading, setLoading] = useState(false)
  const [loadingOrganizations, setLoadingOrganizations] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrganizations() {
      setLoadingOrganizations(true)
      setError(null)

      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, domain')
        .order('created_at', { ascending: false })

      setLoadingOrganizations(false)

      if (error) {
        setError(error.message)
        return
      }

      const rows = (data ?? []) as Organization[]
      setOrganizations(rows)

      if (rows.length > 0) {
        setOrganizationId(rows[0].id)
      }
    }

    loadOrganizations()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    const { error } = await supabase.from('people').insert({
      organization_id: organizationId,
      full_name: fullName || null,
      role_title: roleTitle,
      department: department || null,
      email: email || null,
      is_key_person: isKeyPerson,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Person / role created successfully.')
    setFullName('')
    setRoleTitle('')
    setDepartment('')
    setEmail('')
    setIsKeyPerson(false)
  }

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Admin
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            New Person / Role
          </h1>
          <p className="mt-3 text-slate-400">
            Add a monitored person or role to an organization.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Organization
              </label>

              {loadingOrganizations ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-slate-400">
                  Loading organizations...
                </div>
              ) : organizations.length === 0 ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-amber-200">
                  No organizations found. Create one first.
                </div>
              ) : (
                <select
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id} className="bg-slate-900">
                      {org.name} — {org.domain}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Full name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Laura Bianchi"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Role title
              </label>
              <input
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                required
                placeholder="CFO"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Department
              </label>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Finance"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="laura.bianchi@company.com"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={isKeyPerson}
                onChange={(e) => setIsKeyPerson(e.target.checked)}
                className="h-4 w-4"
              />
              Mark as key person
            </label>

            <button
              type="submit"
              disabled={loading || organizations.length === 0}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Create person / role'}
            </button>

            {message && (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}
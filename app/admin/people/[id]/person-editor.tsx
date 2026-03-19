'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type PersonEditorProps = {
  id: string
  initialFullName: string
  initialRoleTitle: string
  initialDepartment: string
  initialEmail: string
  initialIsKeyPerson: boolean
}

export default function PersonEditor({
  id,
  initialFullName,
  initialRoleTitle,
  initialDepartment,
  initialEmail,
  initialIsKeyPerson,
}: PersonEditorProps) {
  const router = useRouter()

  const [fullName, setFullName] = useState(initialFullName)
  const [roleTitle, setRoleTitle] = useState(initialRoleTitle)
  const [department, setDepartment] = useState(initialDepartment)
  const [email, setEmail] = useState(initialEmail)
  const [isKeyPerson, setIsKeyPerson] = useState(initialIsKeyPerson)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    const { error } = await supabase
      .from('people')
      .update({
        full_name: fullName || null,
        role_title: roleTitle,
        department: department || null,
        email: email || null,
        is_key_person: isKeyPerson,
      })
      .eq('id', id)

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Person / role updated successfully.')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Laura Bianchi"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Role title</label>
          <input
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            required
            placeholder="CFO"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Department</label>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Finance"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="laura.bianchi@company.com"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
          />
        </div>
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
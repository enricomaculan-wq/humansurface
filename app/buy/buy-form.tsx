'use client'

import { useState } from 'react'
import { useI18n } from '@/app/components/i18n-provider'
import type { Locale } from '@/lib/i18n/config'

const formCopy: Record<
  Locale,
  {
    fullNameLabel: string
    fullNamePlaceholder: string
    companyNameLabel: string
    companyNamePlaceholder: string
    domainLabel: string
    domainPlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    roleLabel: string
    rolePlaceholder: string
    companySizeLabel: string
    companySizePlaceholder: string
    notesLabel: string
    notesPlaceholder: string
    reviewNotice: string
    successMessage: string
    submit: string
    submitting: string
    selectedPlanPrefix: string
    selectedPlanNotice: string
  }
> = {
  en: {
    fullNameLabel: 'Full name',
    fullNamePlaceholder: 'Example: Mario Rossi',
    companyNameLabel: 'Company name',
    companyNamePlaceholder: 'Example: HumanSurface Srl',
    domainLabel: 'Primary company domain to review',
    domainPlaceholder: 'example.com',
    emailLabel: 'Work email',
    emailPlaceholder: 'name@company.com',
    roleLabel: 'Your role in the assessment',
    rolePlaceholder: 'Example: CEO, CFO, IT Manager, consultant',
    companySizeLabel: 'Company size',
    companySizePlaceholder: 'Select company size',
    notesLabel: 'Assessment context',
    notesPlaceholder:
      'What prompted this request? Example: visible team pages, finance fraud concerns, executive exposure, client/audit requirement, or recent phishing activity.',
    reviewNotice:
      'We use this intake to prepare the intro call. No credentials, inbox access, or internal system access are needed to confirm fit and scope.',
    successMessage:
      'Thanks — your intake has been received. We will review the context and reply within 1-2 business days to arrange the assessment call.',
    submit: 'Book a call',
    submitting: 'Sending intake...',
    selectedPlanPrefix: 'Selected plan',
    selectedPlanNotice:
      'We will include this scope in the intake and confirm it on the call.',
  },
  it: {
    fullNameLabel: 'Nome e cognome',
    fullNamePlaceholder: 'Esempio: Mario Rossi',
    companyNameLabel: 'Nome azienda',
    companyNamePlaceholder: 'Esempio: HumanSurface Srl',
    domainLabel: 'Dominio aziendale principale da rivedere',
    domainPlaceholder: 'esempio.com',
    emailLabel: 'Email di lavoro',
    emailPlaceholder: 'nome@azienda.com',
    roleLabel: 'Il tuo ruolo nell’assessment',
    rolePlaceholder: 'Esempio: CEO, CFO, IT Manager, consulente',
    companySizeLabel: 'Dimensione azienda',
    companySizePlaceholder: 'Seleziona la dimensione aziendale',
    notesLabel: 'Contesto dell’assessment',
    notesPlaceholder:
      'Cosa ha motivato la richiesta? Esempio: team page visibili, dubbi su frodi finance, esposizione executive, requisito cliente/audit o phishing recente.',
    reviewNotice:
      'Usiamo questo intake per preparare la call introduttiva. Non servono credenziali, accesso alle inbox o accesso ai sistemi interni per confermare aderenza e scope.',
    successMessage:
      'Grazie: abbiamo ricevuto il tuo intake. Rivedremo il contesto e risponderemo entro 1-2 giorni lavorativi per organizzare la call assessment.',
    submit: 'Prenota una call',
    submitting: 'Invio intake...',
    selectedPlanPrefix: 'Piano selezionato',
    selectedPlanNotice:
      'Inseriremo questo scope nell’intake e lo confermeremo durante la call.',
  },
}

export default function BuyForm({
  selectedPlanLabel,
}: {
  selectedPlanLabel?: string | null
}) {
  const { dictionary, locale } = useI18n()
  const t = dictionary.buy.form
  const c = formCopy[locale]

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

  function getCallRequestErrorMessage(status: number, message: unknown) {
    if (status === 429) {
      return t.tooManyRequests
    }

    const normalizedMessage =
      typeof message === 'string' ? message.trim().toLowerCase() : ''

    if (status === 400) {
      if (normalizedMessage.includes('full name')) {
        return t.fullNameRequired
      }

      if (normalizedMessage.includes('company name')) {
        return t.companyNameRequired
      }

      if (
        normalizedMessage.includes('company domain') ||
        normalizedMessage.includes('valid domain')
      ) {
        return t.domainInvalid
      }

      if (
        normalizedMessage.includes('work email') ||
        normalizedMessage.includes('valid email')
      ) {
        return t.emailInvalid
      }
    }

    return t.errorFallback
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData(e.currentTarget)
      const website = String(formData.get('website') ?? '')

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
          notes: selectedPlanLabel
            ? `${c.selectedPlanPrefix}: ${selectedPlanLabel}${
                notes.trim() ? `\n${notes.trim()}` : ''
              }`
            : notes,
          website,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(getCallRequestErrorMessage(response.status, result?.error))
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
      setError(t.networkError)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-10000px] h-px w-px opacity-0"
      />

      {selectedPlanLabel ? (
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] px-4 py-3 text-sm leading-6 text-cyan-50">
          <strong>{c.selectedPlanPrefix}:</strong> {selectedPlanLabel}.{' '}
          {c.selectedPlanNotice}
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm text-slate-300">{c.fullNameLabel}</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
          placeholder={c.fullNamePlaceholder}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">{c.companyNameLabel}</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
          placeholder={c.companyNamePlaceholder}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">{c.domainLabel}</label>
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
          placeholder={c.domainPlaceholder}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">{c.emailLabel}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
          placeholder={c.emailPlaceholder}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">{c.roleLabel}</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
          placeholder={c.rolePlaceholder}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">{c.companySizeLabel}</label>
        <select
          value={companySize}
          onChange={(e) => setCompanySize(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
        >
          <option value="" className="bg-slate-900">
            {c.companySizePlaceholder}
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
          {c.notesLabel}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
          placeholder={c.notesPlaceholder}
        />
      </div>

      <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-3 text-sm text-slate-200">
        {c.reviewNotice}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {c.successMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
      >
        {loading ? c.submitting : c.submit}
      </button>
    </form>
  )
}

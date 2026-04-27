import LanguageToggle from '@/app/components/language-toggle'
import type { Locale } from '@/lib/i18n/config'
import { getRequestLocale } from '@/lib/i18n/server'
import BuyForm from './buy-form'

const buyPageCopy: Record<
  Locale,
  {
    eyebrow: string
    title: string
    description: string
    expectationTitle: string
    expectationText: string
    focusTitle: string
    focusItems: string[]
    reasonsTitle: string
    reasonItems: string[]
    deliveryTitle: string
    deliveryText: string
    reviewerNoteTitle: string
    reviewerNoteText: string
    formEyebrow: string
    formTitle: string
    formDescription: string
  }
> = {
  en: {
    eyebrow: 'Reviewed launch assessment',
    title: 'Request an intro call for the HumanSurface launch assessment',
    description:
      'Use this intake to share your company context and the exposure concerns you want reviewed. We confirm fit and scope on a short call before activating the assessment.',
    expectationTitle: 'What this call is for',
    expectationText:
      'The intro call is a scope and fit conversation. We review your public-exposure priorities, confirm the right domain and decision context, and explain the expected deliverable before activation.',
    focusTitle: 'What we review',
    focusItems: [
      'Public people, role, and contact exposure',
      'Signals that can support phishing, impersonation, and invoice fraud',
      'Executive, finance, HR, sales, and operations visibility',
      'External business context that can make fake requests more believable',
    ],
    reasonsTitle: 'What happens after you submit',
    reasonItems: [
      'We review the intake before replying.',
      'You receive a response within 1-2 business days.',
      'The call confirms fit, scope, and activation path.',
      'If activated, the assessment produces a reviewed report with prioritized remediation.',
    ],
    deliveryTitle: 'Trust and scope reassurance',
    deliveryText:
      'The launch assessment uses public and externally visible information. We do not need credentials, agents, inbox access, or invasive setup to confirm fit and prepare scope.',
    reviewerNoteTitle: 'Reviewed by HumanSurface',
    reviewerNoteText:
      'Each assessment is checked by a HumanSurface reviewer before delivery so findings are business-readable, scoped, and tied to practical remediation.',
    formEyebrow: 'Assessment intake',
    formTitle: 'Prepare your assessment call',
    formDescription:
      'Share enough context for a useful first conversation: domain, role, company size, and what prompted the request.',
  },
  it: {
    eyebrow: 'Assessment lancio revisionato',
    title: 'Richiedi una call introduttiva per l’assessment lancio HumanSurface',
    description:
      'Usa questo intake per condividere il contesto aziendale e le priorità di esposizione da rivedere. Confermiamo aderenza e scope in una breve call prima di attivare l’assessment.',
    expectationTitle: 'A cosa serve questa call',
    expectationText:
      'La call introduttiva serve a definire scope e aderenza. Rivediamo le priorità di esposizione pubblica, confermiamo dominio e contesto decisionale, e spieghiamo il deliverable atteso prima dell’attivazione.',
    focusTitle: 'Cosa rivediamo',
    focusItems: [
      'Esposizione pubblica di persone, ruoli e canali di contatto',
      'Segnali che possono supportare phishing, impersonificazione e frodi su fatture',
      'Visibilità di executive, finance, HR, sales e operations',
      'Contesto aziendale esterno che può rendere più credibili richieste false',
    ],
    reasonsTitle: 'Cosa succede dopo l’invio',
    reasonItems: [
      'Rivediamo l’intake prima di rispondere.',
      'Ricevi una risposta entro 1-2 giorni lavorativi.',
      'La call conferma aderenza, scope e percorso di attivazione.',
      'Se attivato, l’assessment produce un report revisionato con remediation prioritaria.',
    ],
    deliveryTitle: 'Rassicurazione su scope e metodo',
    deliveryText:
      'L’assessment lancio usa informazioni pubbliche ed esternamente visibili. Non servono credenziali, agent, accesso alle inbox o configurazioni invasive per confermare fit e preparare lo scope.',
    reviewerNoteTitle: 'Revisionato da HumanSurface',
    reviewerNoteText:
      'Ogni assessment viene controllato da un reviewer HumanSurface prima della consegna, così i finding restano leggibili per il business, coerenti con lo scope e collegati a remediation pratiche.',
    formEyebrow: 'Intake assessment',
    formTitle: 'Prepara la tua call assessment',
    formDescription:
      'Condividi il contesto utile per una prima conversazione concreta: dominio, ruolo, dimensione aziendale e motivo della richiesta.',
  },
}

export default async function BuyPage() {
  const locale = await getRequestLocale()
  const t = buyPageCopy[locale]

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-14 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 hidden justify-end md:flex">
          <LanguageToggle />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              {t.eyebrow}
            </div>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              {t.title}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              {t.description}
            </p>

            <div className="mt-8 rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.08] p-6">
              <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">
                {t.expectationTitle}
              </div>
              <p className="mt-3 leading-7 text-slate-200">
                {t.expectationText}
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#071022] p-5">
                <div className="text-sm font-semibold text-white">
                  {t.focusTitle}
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                  {t.focusItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#071022] p-5">
                <div className="text-sm font-semibold text-white">
                  {t.reasonsTitle}
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                  {t.reasonItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm font-semibold text-white">
                {t.deliveryTitle}
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {t.deliveryText}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-5">
              <div className="text-sm font-semibold text-fuchsia-100">
                {t.reviewerNoteTitle}
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                {t.reviewerNoteText}
              </p>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
            <div className="mb-6">
              <div className="text-sm uppercase tracking-[0.18em] text-cyan-300">
                {t.formEyebrow}
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {t.formTitle}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {t.formDescription}
              </p>
            </div>

            <BuyForm />
          </section>
        </div>
      </div>
    </main>
  )
}

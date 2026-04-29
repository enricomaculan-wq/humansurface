import Link from 'next/link'
import LanguageToggle from '@/app/components/language-toggle'
import type { Locale } from '@/lib/i18n/config'
import { getRequestLocale } from '@/lib/i18n/server'
import BuyForm from './buy-form'

type PlanKey = 'base' | 'dark-web'

type BuyPlan = {
  key: PlanKey
  name: string
  price: string
  description: string
  href: string
}

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
    plansTitle: string
    planHint: string
    backHome: string
    choosePlan: string
    selectedPlan: string
    plans: BuyPlan[]
  }
> = {
  en: {
    eyebrow: 'Reviewed assessment scope',
    title: 'Request an intro call for your HumanSurface assessment',
    description:
      'Use this intake to share your company context and the exposure concerns you want reviewed. We confirm whether Assessment Base or Assessment + Dark Web is the right scope before activation.',
    expectationTitle: 'What this call is for',
    expectationText:
      'The intro call is a scope and fit conversation. We review your public-exposure priorities, confirm the right domain and decision context, and explain the expected deliverable before activation.',
    focusTitle: 'What we review',
    focusItems: [
      'Public people, role, and contact exposure',
      'Signals that can support phishing, impersonation, and invoice fraud',
      'Available leak/dark web signals linked to company domains or emails when that scope is selected',
      'Executive, finance, HR, sales, and operations visibility',
      'External business context that can make fake requests more believable',
    ],
    reasonsTitle: 'What happens after you submit',
    reasonItems: [
      'We review the intake before replying.',
      'You receive a response within 1-2 business days.',
      'The call confirms fit, scope, and activation path.',
      'If activated, the selected assessment produces a reviewed report with prioritized remediation.',
    ],
    deliveryTitle: 'Trust and scope reassurance',
    deliveryText:
      'The assessment uses public and externally visible information, plus available leak/dark web signals only when that scope is selected. We do not need credentials, agents, inbox access, or invasive setup to confirm fit and prepare scope.',
    reviewerNoteTitle: 'Reviewed by HumanSurface',
    reviewerNoteText:
      'Each assessment is checked by a HumanSurface reviewer before delivery so findings are business-readable, scoped, and tied to practical remediation.',
    formEyebrow: 'Assessment intake',
    formTitle: 'Prepare your assessment call',
    formDescription:
      'Share enough context for a useful first conversation: domain, role, company size, and what prompted the request.',
    plansTitle: 'Assessment scope',
    planHint:
      'Choose a scope now or leave it open and we will confirm the right option on the call.',
    backHome: '← Back to home',
    choosePlan: 'Choose scope',
    selectedPlan: 'Selected',
    plans: [
      {
        key: 'base',
        name: 'Assessment Base',
        price: '€190 + VAT',
        description:
          'Public exposure, AI-assisted impersonation risk, visible surface, priorities, synthetic report, and scope call.',
        href: '/buy?plan=base',
      },
      {
        key: 'dark-web',
        name: 'Assessment + Dark Web',
        price: '€390 + VAT',
        description:
          'Everything in Base plus available leak/dark web signals linked to domains, emails, and company references.',
        href: '/buy?plan=dark-web',
      },
    ],
  },
  it: {
    eyebrow: 'Scope assessment revisionato',
    title: 'Richiedi una call introduttiva per il tuo assessment HumanSurface',
    description:
      'Usa questo intake per condividere il contesto aziendale e le priorità di esposizione da rivedere. Confermiamo se Assessment Base o Assessment + Dark Web è lo scope corretto prima dell’attivazione.',
    expectationTitle: 'A cosa serve questa call',
    expectationText:
      'La call introduttiva serve a definire scope e aderenza. Rivediamo le priorità di esposizione pubblica, confermiamo dominio e contesto decisionale, e spieghiamo il deliverable atteso prima dell’attivazione.',
    focusTitle: 'Cosa rivediamo',
    focusItems: [
      'Esposizione pubblica di persone, ruoli e canali di contatto',
      'Segnali che possono supportare phishing, impersonificazione e frodi su fatture',
      'Segnali leak/dark web disponibili collegati a domini o email aziendali quando quello scope viene scelto',
      'Visibilità di executive, finance, HR, sales e operations',
      'Contesto aziendale esterno che può rendere più credibili richieste false',
    ],
    reasonsTitle: 'Cosa succede dopo l’invio',
    reasonItems: [
      'Rivediamo l’intake prima di rispondere.',
      'Ricevi una risposta entro 1-2 giorni lavorativi.',
      'La call conferma aderenza, scope e percorso di attivazione.',
      'Se attivato, l’assessment scelto produce un report revisionato con remediation prioritaria.',
    ],
    deliveryTitle: 'Rassicurazione su scope e metodo',
    deliveryText:
      'L’assessment usa informazioni pubbliche ed esternamente visibili, più segnali leak/dark web disponibili solo quando quello scope viene scelto. Non servono credenziali, agent, accesso alle inbox o configurazioni invasive per confermare fit e preparare lo scope.',
    reviewerNoteTitle: 'Revisionato da HumanSurface',
    reviewerNoteText:
      'Ogni assessment viene controllato da un reviewer HumanSurface prima della consegna, così i finding restano leggibili per il business, coerenti con lo scope e collegati a remediation pratiche.',
    formEyebrow: 'Intake assessment',
    formTitle: 'Prepara la tua call assessment',
    formDescription:
      'Condividi il contesto utile per una prima conversazione concreta: dominio, ruolo, dimensione aziendale e motivo della richiesta.',
    plansTitle: 'Scope assessment',
    planHint:
      'Scegli uno scope ora oppure lascialo aperto: confermeremo l’opzione corretta durante la call.',
    backHome: '← Torna alla home',
    choosePlan: 'Scegli scope',
    selectedPlan: 'Selezionato',
    plans: [
      {
        key: 'base',
        name: 'Assessment Base',
        price: '€190 + IVA',
        description:
          'Esposizione pubblica, rischio impersonificazione AI-assisted, superficie visibile, priorità, report sintetico e call scope.',
        href: '/buy?plan=base',
      },
      {
        key: 'dark-web',
        name: 'Assessment + Dark Web',
        price: '€390 + IVA',
        description:
          'Tutto il Base più segnali leak/dark web disponibili collegati a dominio, email e riferimenti aziendali.',
        href: '/buy?plan=dark-web',
      },
    ],
  },
}

function normalizePlan(value: string | undefined): PlanKey | null {
  return value === 'base' || value === 'dark-web' ? value : null
}

export default async function BuyPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string }>
}) {
  const locale = await getRequestLocale()
  const t = buyPageCopy[locale]
  const params = searchParams ? await searchParams : {}
  const selectedPlanKey = normalizePlan(params.plan)
  const selectedPlan = t.plans.find((plan) => plan.key === selectedPlanKey) ?? null

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-14 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
          >
            {t.backHome}
          </Link>
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

            <div className="mt-8 rounded-[28px] border border-white/10 bg-[#071022] p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                {t.plansTitle}
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-400">{t.planHint}</p>

              <div className="mt-5 grid auto-rows-fr items-stretch gap-4 md:grid-cols-2">
                {t.plans.map((plan) => {
                  const selected = plan.key === selectedPlanKey
                  const featured = plan.key === 'dark-web'

                  return (
                    <Link
                      key={plan.key}
                      href={plan.href}
                      className={`flex h-full flex-col rounded-2xl border p-5 transition ${
                        selected
                          ? 'border-cyan-300/40 bg-cyan-300/[0.12] shadow-[0_0_36px_rgba(34,211,238,0.12)]'
                          : 'border-white/10 bg-white/[0.03] hover:border-cyan-300/20 hover:bg-cyan-300/[0.06]'
                      }`}
                    >
                      <div className="min-h-[34px]">
                        <div className="font-semibold leading-6 text-white">{plan.name}</div>
                      </div>
                      <div className="mt-3 flex min-h-[42px] items-start">
                        <div
                          className={`flex min-w-[112px] shrink-0 items-center justify-center rounded-2xl border px-3 py-2 text-center text-sm font-semibold leading-5 ${
                            featured
                              ? 'border-fuchsia-300/25 bg-fuchsia-300/[0.10] text-fuchsia-50'
                              : 'border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-50'
                          }`}
                        >
                          {plan.price}
                        </div>
                      </div>
                      <p className="mt-4 min-h-[96px] flex-1 text-sm leading-6 text-slate-300">
                        {plan.description}
                      </p>
                      <div
                        className={`mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                          featured
                            ? 'border-fuchsia-400/70 bg-fuchsia-600 text-white hover:bg-fuchsia-500'
                            : 'border-cyan-300/30 bg-cyan-300 text-slate-950 hover:bg-cyan-200'
                        }`}
                      >
                        {selected ? t.selectedPlan : t.choosePlan}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

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

            <BuyForm selectedPlanLabel={selectedPlan?.name ?? null} />
          </section>
        </div>
      </div>
    </main>
  )
}

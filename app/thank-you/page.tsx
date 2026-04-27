import Link from 'next/link'
import { CheckCircle2, ArrowLeft, ShieldCheck, Mail } from 'lucide-react'
import LanguageToggle from '@/app/components/language-toggle'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary, getRequestLocale } from '@/lib/i18n/server'

const thankYouCopy: Record<
  Locale,
  {
    eyebrow: string
    title: string
    intro: string
    nextTitle: string
    nextItems: string[]
    timingTitle: string
    timingItems: string[]
    contactPrefix: string
    importantTitle: string
    importantText: string
    backHome: string
  }
> = {
  en: {
    eyebrow: 'Assessment intake received',
    title: 'Your HumanSurface assessment call request is in review',
    intro:
      'Thanks. We received your intake for the reviewed HumanSurface launch assessment and will use it to prepare a focused intro call.',
    nextTitle: 'What happens next',
    nextItems: [
      'We review your company domain, role, and assessment context.',
      'We reply within 1-2 business days to arrange the intro call.',
      'The call confirms fit, scope, and the activation path for the assessment.',
    ],
    timingTitle: 'Before the call',
    timingItems: [
      'No credentials, inbox access, or internal system access are needed.',
      'Helpful context: primary domain, exposed teams, fraud concerns, and internal owner.',
    ],
    contactPrefix: 'For updates or corrections, contact us at',
    importantTitle: 'If the assessment is activated',
    importantText:
      'You can expect a reviewed report with exposure scores, exposed roles, likely attack scenarios, and prioritized remediation actions.',
    backHome: 'Back to homepage',
  },
  it: {
    eyebrow: 'Intake assessment ricevuto',
    title: 'La tua richiesta di call assessment HumanSurface è in revisione',
    intro:
      'Grazie. Abbiamo ricevuto il tuo intake per l’assessment lancio HumanSurface revisionato e lo useremo per preparare una call introduttiva mirata.',
    nextTitle: 'Cosa succede ora',
    nextItems: [
      'Rivediamo dominio aziendale, ruolo e contesto dell’assessment.',
      'Rispondiamo entro 1-2 giorni lavorativi per organizzare la call introduttiva.',
      'La call conferma aderenza, scope e percorso di attivazione dell’assessment.',
    ],
    timingTitle: 'Prima della call',
    timingItems: [
      'Non servono credenziali, accesso alle inbox o accesso ai sistemi interni.',
      'Contesto utile: dominio principale, team esposti, dubbi su frodi e referente interno.',
    ],
    contactPrefix: 'Per aggiornamenti o correzioni, contattaci a',
    importantTitle: 'Se l’assessment viene attivato',
    importantText:
      'Puoi aspettarti un report revisionato con score di esposizione, ruoli esposti, scenari di attacco probabili e azioni di remediation prioritarie.',
    backHome: 'Torna alla homepage',
  },
}

export default async function ThankYouPage() {
  const locale = await getRequestLocale()
  const dictionary = await getDictionary(locale)
  const t = thankYouCopy[locale]

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 hidden justify-end md:flex">
          <LanguageToggle />
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
                {t.eyebrow}
              </div>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                {t.title}
              </h1>
            </div>
          </div>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            {t.intro}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-3 text-cyan-200">
                <ShieldCheck className="h-5 w-5" />
                <div className="text-sm font-medium uppercase tracking-[0.16em]">
                  {t.nextTitle}
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                {t.nextItems.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
              <div className="flex items-center gap-3 text-cyan-100">
                <Mail className="h-5 w-5" />
                <div className="text-sm font-medium uppercase tracking-[0.16em]">
                  {t.timingTitle}
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
                {t.timingItems.map((item) => (
                  <div key={item}>{item}</div>
                ))}
                <div>
                  {t.contactPrefix}{' '}
                  <a
                    href="mailto:info@humansurface.com"
                    className="text-cyan-200 underline underline-offset-4"
                  >
                    info@humansurface.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-5">
            <div className="text-sm font-medium uppercase tracking-[0.16em] text-fuchsia-200">
              {t.importantTitle}
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              {t.importantText}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.backHome}
            </Link>

            <a
              href="mailto:info@humansurface.com?subject=HumanSurface%20Assessment%20Support"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              {dictionary.common.actions.contactSupport}
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

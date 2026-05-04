import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  FileWarning,
  Fingerprint,
  LockKeyhole,
  Radar,
  ScanSearch,
  ShieldCheck,
  TriangleAlert,
  Users,
} from 'lucide-react'
import LanguageToggle from '@/app/components/language-toggle'
import type { Locale } from '@/lib/i18n/config'
import { getRequestLocale } from '@/lib/i18n/server'

export const metadata: Metadata = {
  title: 'Metodo HumanSurface | Assessment OSINT non invasivo',
  description:
    'Come HumanSurface analizza dati pubblici e segnali OSINT per ridurre il rischio di impersonificazione, phishing mirato e social engineering.',
}

const copy: Record<
  Locale,
  {
    backHome: string
    eyebrow: string
    title: string
    intro: string
    cta: string
    example: string
    methodTitle: string
    methodText: string
    steps: Array<{
      title: string
      text: string
      icon: typeof Radar
    }>
    boundariesTitle: string
    boundariesText: string
    boundaries: Array<{
      title: string
      text: string
      icon: typeof Radar
    }>
    darkWebHandling: {
      title: string
      text: string
      items: string[]
    }
    aiTitle: string
    aiText: string
    aiItems: string[]
    goalTitle: string
    goalText: string
    goalItems: string[]
    finalTitle: string
    finalText: string
  }
> = {
  en: {
    backHome: 'Back to home',
    eyebrow: 'HumanSurface method',
    title: 'Public exposure analysis without invasive access',
    intro:
      'HumanSurface helps organizations understand which externally visible information can increase phishing, impersonation, and social engineering risk. The assessment starts from public sources and turns them into practical remediation priorities.',
    cta: 'Request preliminary review',
    example: 'View example report',
    methodTitle: 'How the analysis works',
    methodText:
      'We review public and externally visible signals, then connect them to realistic abuse scenarios. The objective is to reduce operational risk before exposure is exploited.',
    steps: [
      {
        title: 'Public data and OSINT signals',
        text: 'We analyze public web pages, indexed documents, visible contact paths, role context, technology signals, and relevant open-source exposure indicators.',
        icon: Radar,
      },
      {
        title: 'Business-context interpretation',
        text: 'We evaluate how public details about people, processes, suppliers, communications, and roles could make a fraudulent request feel credible.',
        icon: Users,
      },
      {
        title: 'Reviewed report and priorities',
        text: 'Findings are reviewed and organized into scores, likely scenarios, operational priorities, and immediate remediation actions.',
        icon: ScanSearch,
      },
    ],
    boundariesTitle: 'Trust boundaries',
    boundariesText:
      'The methodology is designed to be useful before any deeper technical activity is required.',
    boundaries: [
      {
        title: 'No invasive scanning without authorization',
        text: 'The preliminary assessment does not perform intrusive tests or unauthorized probing.',
        icon: ShieldCheck,
      },
      {
        title: 'No internal system access required',
        text: 'No credentials, agents, inbox access, VPN access, or internal system access are needed to confirm fit and prepare scope.',
        icon: LockKeyhole,
      },
      {
        title: 'No sensitive data published',
        text: 'Reports are scoped for the customer. Demo materials use synthetic data and do not expose real sensitive information.',
        icon: FileWarning,
      },
      {
        title: 'No guaranteed dark web coverage claim',
        text: 'Leak-related signals are treated as indicators to verify, not as a promise of complete dark web visibility or guaranteed results.',
        icon: Fingerprint,
      },
    ],
    darkWebHandling: {
      title: 'How we treat dark web signals',
      text:
        'Leak and dark web indicators are handled as signals to interpret, not as guaranteed proof. We work with available sources, classify confidence, and turn relevant indicators into operational priorities.',
      items: [
        'We work on available signals and indicators linked to domains, emails, and company references.',
        'We distinguish evidence, suspicion, and likely false positives before making recommendations.',
        'We do not use invasive access or internal system credentials.',
        'We do not promise total dark web coverage.',
        'We convert relevant signals into remediation and verification priorities.',
      ],
    },
    aiTitle: 'Reducing AI-assisted impersonation and social engineering risk',
    aiText:
      'With generative AI, seemingly harmless public information can be transformed into credible messages, targeted phishing, or impersonation attempts against key company figures. HumanSurface helps clarify which information is visible from the outside and which signals can increase operational risk.',
    aiItems: [
      'Public role descriptions can support convincing authority and urgency.',
      'Supplier, payment, and process references can make requests feel legitimate.',
      'Emails and communication channels can become targeting paths.',
      'The right response is not disappearing from the web, but distinguishing business-useful visibility from risk-increasing exposure.',
    ],
    goalTitle: 'The goal',
    goalText:
      'HumanSurface is built to reduce risk before it is exploited. The output is meant to help teams decide what to keep public, what to reduce, and what needs verification controls.',
    goalItems: [
      'Identify the externally visible information that matters most.',
      'Prioritize exposure by operational abuse scenario.',
      'Turn findings into practical remediation work.',
      'Support a safer public presence without blocking legitimate business visibility.',
    ],
    finalTitle: 'Start with scope, then assess',
    finalText:
      'The call confirms the domain, business context, fit, and expected deliverable before assessment activation.',
  },
  it: {
    backHome: 'Torna alla home',
    eyebrow: 'Metodo HumanSurface',
    title: 'Analisi dell’esposizione pubblica senza accessi invasivi',
    intro:
      'HumanSurface aiuta le organizzazioni a capire quali informazioni visibili dall’esterno possono aumentare il rischio di phishing, impersonificazione e social engineering. L’assessment parte da fonti pubbliche e le trasforma in priorita di remediation pratiche.',
    cta: 'Richiedi verifica preliminare',
    example: 'Vedi esempio report',
    methodTitle: 'Come funziona l’analisi',
    methodText:
      'Rivediamo segnali pubblici ed esternamente visibili, poi li colleghiamo a scenari realistici di abuso. L’obiettivo e ridurre il rischio operativo prima che l’esposizione venga sfruttata.',
    steps: [
      {
        title: 'Dati pubblici e segnali OSINT',
        text: 'Analizziamo pagine web pubbliche, documenti indicizzati, canali di contatto visibili, contesto dei ruoli, segnali tecnologici e indicatori open-source rilevanti.',
        icon: Radar,
      },
      {
        title: 'Interpretazione del contesto business',
        text: 'Valutiamo come dettagli pubblici su persone, processi, fornitori, comunicazioni e ruoli possano rendere credibile una richiesta fraudolenta.',
        icon: Users,
      },
      {
        title: 'Report revisionato e priorita',
        text: 'I finding sono revisionati e organizzati in score, scenari probabili, priorita operative e azioni immediate di remediation.',
        icon: ScanSearch,
      },
    ],
    boundariesTitle: 'Confini di fiducia',
    boundariesText:
      'La metodologia e pensata per essere utile prima che servano attivita tecniche piu profonde.',
    boundaries: [
      {
        title: 'Nessuna scansione invasiva senza autorizzazione',
        text: 'L’assessment preliminare non esegue test intrusivi o probing non autorizzato.',
        icon: ShieldCheck,
      },
      {
        title: 'Nessun accesso richiesto ai sistemi interni',
        text: 'Non servono credenziali, agent, accesso alle inbox, VPN o sistemi interni per confermare aderenza e preparare lo scope.',
        icon: LockKeyhole,
      },
      {
        title: 'Nessun dato sensibile pubblicato',
        text: 'I report sono destinati al cliente. I materiali demo usano dati sintetici e non espongono informazioni sensibili reali.',
        icon: FileWarning,
      },
      {
        title: 'Nessuna promessa di copertura dark web completa',
        text: 'I segnali collegati a leak sono trattati come indicatori da verificare, non come promessa di visibilita completa o risultati garantiti.',
        icon: Fingerprint,
      },
    ],
    darkWebHandling: {
      title: 'Come trattiamo i segnali Dark Web',
      text:
        'I segnali leak e dark web vengono trattati come indicatori da interpretare, non come prove garantite. Lavoriamo su fonti disponibili, classifichiamo il livello di confidenza e trasformiamo gli indicatori rilevanti in priorita operative.',
      items: [
        'Lavoriamo su segnali e indicatori disponibili collegati a domini, email e riferimenti aziendali.',
        'Distinguiamo evidenza, sospetto e probabile falso positivo prima di raccomandare azioni.',
        'Non usiamo accessi invasivi o credenziali dei sistemi interni.',
        'Non promettiamo copertura totale del dark web.',
        'Trasformiamo i segnali rilevanti in priorita di remediation e verifica.',
      ],
    },
    aiTitle: 'Riduzione del rischio di impersonificazione e social engineering AI-assisted',
    aiText:
      'Con l’intelligenza artificiale generativa, informazioni pubbliche apparentemente innocue possono essere trasformate in messaggi credibili, phishing mirato o tentativi di impersonificazione verso figure chiave dell’azienda. HumanSurface aiuta a capire quali informazioni sono visibili dall’esterno e quali possono aumentare il rischio operativo.',
    aiItems: [
      'Descrizioni pubbliche dei ruoli possono supportare autorita e urgenza credibili.',
      'Riferimenti a fornitori, pagamenti e processi possono rendere legittima una richiesta.',
      'Email e canali di comunicazione possono diventare percorsi di targeting.',
      'La risposta non e sparire dal web, ma distinguere visibilita utile al business da esposizione che aumenta il rischio.',
    ],
    goalTitle: 'Obiettivo',
    goalText:
      'HumanSurface nasce per ridurre il rischio prima che venga sfruttato. L’output aiuta il team a decidere cosa mantenere pubblico, cosa ridurre e dove servono controlli di verifica.',
    goalItems: [
      'Individuare le informazioni visibili dall’esterno che contano di piu.',
      'Prioritizzare l’esposizione per scenario di abuso operativo.',
      'Trasformare i finding in remediation pratica.',
      'Mantenere una presenza pubblica piu sicura senza bloccare la visibilita utile al business.',
    ],
    finalTitle: 'Prima lo scope, poi l’assessment',
    finalText:
      'La call conferma dominio, contesto business, aderenza e deliverable atteso prima dell’attivazione dell’assessment.',
  },
}

function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-[28px] border border-white/10 bg-white/[0.04] ${className}`}>
      {children}
    </div>
  )
}

export default async function MethodPage() {
  const locale = await getRequestLocale()
  const t = copy[locale]

  return (
    <main className="hs-light min-h-screen bg-[#040816] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_75%_25%,rgba(168,85,247,0.10),transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
            {t.backHome}
          </Link>
          <LanguageToggle />
        </header>

        <section className="grid gap-10 py-16 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">
              {t.eyebrow}
            </div>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              {t.intro}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/buy"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                {t.cta} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/esempio-report"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
              >
                {t.example}
              </Link>
            </div>
          </div>

          <Panel className="p-6">
            <div className="rounded-[24px] border border-cyan-300/15 bg-cyan-300/[0.06] p-6">
              <div className="mb-5 flex items-center gap-3 text-cyan-100">
                <ScanSearch className="h-5 w-5" />
                <div className="text-sm font-medium uppercase tracking-[0.18em]">
                  {t.methodTitle}
                </div>
              </div>
              <p className="text-lg leading-8 text-slate-200">{t.methodText}</p>
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {t.steps.map((step) => {
            const Icon = step.icon
            return (
              <Panel key={step.title} className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-semibold leading-8">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{step.text}</p>
              </Panel>
            )
          })}
        </section>

        <section className="py-20">
          <div className="mb-10 max-w-3xl">
            <div className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">
              {t.boundariesTitle}
            </div>
            <p className="mt-4 text-lg leading-8 text-slate-300">{t.boundariesText}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {t.boundaries.map((boundary) => {
              const Icon = boundary.icon
              return (
                <Panel key={boundary.title} className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#091226] text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold leading-7">{boundary.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {boundary.text}
                  </p>
                </Panel>
              )
            })}
          </div>
        </section>

        <section className="grid gap-8 pb-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <div className="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-fuchsia-200">
              Dark Web signals
            </div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.darkWebHandling.title}
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              {t.darkWebHandling.text}
            </p>
          </div>

          <Panel className="border-fuchsia-300/20 bg-fuchsia-300/[0.06] p-6">
            <div className="mb-5 flex items-center gap-3 text-fuchsia-100">
              <FileWarning className="h-5 w-5" />
              <div className="text-sm font-medium uppercase tracking-[0.18em]">
                Signal handling
              </div>
            </div>
            <div className="grid gap-3">
              {t.darkWebHandling.items.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-fuchsia-200/10 bg-[#030815]/50 px-4 py-3 text-sm leading-7 text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="grid gap-8 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-fuchsia-200">
              AI-assisted impersonation
            </div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.aiTitle}
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">{t.aiText}</p>
          </div>

          <Panel className="border-fuchsia-300/20 bg-fuchsia-300/[0.06] p-6">
            <div className="mb-5 flex items-center gap-3 text-fuchsia-100">
              <TriangleAlert className="h-5 w-5" />
              <div className="text-sm font-medium uppercase tracking-[0.18em]">
                Risk reduction
              </div>
            </div>
            <div className="space-y-3">
              {t.aiItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-fuchsia-200/10 bg-[#030815]/50 px-4 py-3 text-sm leading-7 text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="grid gap-8 pb-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">
              {t.goalTitle}
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.finalTitle}
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">{t.goalText}</p>
          </div>

          <Panel className="p-6">
            <div className="space-y-3">
              {t.goalItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-cyan-200/10 bg-cyan-300/[0.06] px-4 py-3 text-sm leading-7 text-cyan-50"
                >
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-7 text-slate-300">{t.finalText}</p>
            <div className="mt-6">
              <Link
                href="/buy"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                {t.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Panel>
        </section>
      </div>
    </main>
  )
}

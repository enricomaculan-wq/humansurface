import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  FileWarning,
  Fingerprint,
  Mail,
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
  title: 'Esempio report HumanSurface | Demo anonimo',
  description:
    'Report demo anonimo HumanSurface con risk score, superficie pubblica esposta, segnali leak/dark web e priorita operative.',
}

const copy: Record<
  Locale,
  {
    backHome: string
    eyebrow: string
    title: string
    intro: string
    demoNotice: string
    scoreLabel: string
    riskLevel: string
    domainLabel: string
    domainValue: string
    scopeLabel: string
    scopeValue: string
    cta: string
    method: string
    sections: Array<{
      title: string
      description: string
      icon: typeof Radar
      items: string[]
    }>
    darkWebReport: {
      title: string
      description: string
      note: string
      findingsTitle: string
      recommendationsTitle: string
      findings: string[]
      recommendations: string[]
    }
    prioritiesTitle: string
    priorities: Array<{
      label: string
      level: string
      text: string
    }>
    immediateTitle: string
    immediateItems: string[]
    finalTitle: string
    finalText: string
  }
> = {
  en: {
    backHome: 'Back to home',
    eyebrow: 'Anonymous demo report',
    title: 'What a HumanSurface assessment can return',
    intro:
      'This demo shows the shape of an assessment output: public exposure, potentially exposed contacts, visible technologies, leak signals, AI-assisted impersonation risk, and operational priorities.',
    demoNotice:
      'All data on this page is synthetic and anonymous. It does not describe a real company and does not imply complete dark web coverage or guaranteed findings.',
    scoreLabel: 'Demo risk score',
    riskLevel: 'Medium-high exposure',
    domainLabel: 'Demo domain',
    domainValue: 'azienda-demo.example',
    scopeLabel: 'Demo scope',
    scopeValue: 'Public website, indexed pages, contact paths, visible role context',
    cta: 'Request assessment',
    method: 'Read the method',
    sections: [
      {
        title: 'Exposed public surface',
        description:
          'Publicly reachable information that can help an attacker understand the organization.',
        icon: Radar,
        items: [
          'Team and leadership pages with role descriptions.',
          'Contact and supplier pages that reveal operational paths.',
          'Indexed PDFs with process references and document names.',
          'Recruiting pages with HR contacts and hiring context.',
        ],
      },
      {
        title: 'Potentially exposed emails',
        description:
          'Synthetic examples of contact exposure and predictable address patterns.',
        icon: Mail,
        items: [
          'info@azienda-demo.example visible on public contact pages.',
          'amministrazione@azienda-demo.example referenced in a demo document.',
          'careers@azienda-demo.example exposed through recruiting pages.',
          'firstname.lastname pattern inferred from public examples.',
        ],
      },
      {
        title: 'Visible technologies',
        description:
          'Externally visible or inferable technologies that can provide context, without invasive scanning.',
        icon: Fingerprint,
        items: [
          'CMS and public website framework signals.',
          'Analytics and marketing tags visible in the page source.',
          'Email protection and DNS configuration signals.',
          'Public forms and document download paths.',
        ],
      },
      {
        title: 'Dark web / leak signals',
        description:
          'Demo-only examples of how exposure signals would be summarized when relevant.',
        icon: FileWarning,
        items: [
          'No confirmed credential leak is represented in this demo.',
          'One synthetic mention of the demo domain in a breach-reference source.',
          'No password, secret, or sensitive record is shown.',
          'Signals are classified by priority and validated in the context of the agreed scope.',
        ],
      },
      {
        title: 'AI-assisted impersonation risk',
        description:
          'How public context could be combined into credible messages or pretexts.',
        icon: TriangleAlert,
        items: [
          'Visible finance and supplier context could support invoice-change pretexts.',
          'Executive role descriptions could help imitate tone, authority, and urgency.',
          'HR context could support fake candidate or attachment-based phishing.',
          'Public information should be separated into business-useful visibility and risk-increasing detail.',
        ],
      },
      {
        title: 'Key-role information that may be abused',
        description:
          'Public business context that can make targeted social engineering more believable.',
        icon: Users,
        items: [
          'Finance ownership and payment process references.',
          'Executive responsibilities and public event participation.',
          'HR recruiting workflows and candidate communication paths.',
          'Operations references to locations, suppliers, and delivery processes.',
        ],
      },
    ],
    darkWebReport: {
      title: 'Leak / dark web signals',
      description:
        'This demo section shows how available indicators could be summarized without exposing sensitive data. It does not guarantee that every exposed record can be found.',
      note:
        'Demo-only: no real company data, password, secret, or stolen record is represented here.',
      findingsTitle: 'Example findings',
      recommendationsTitle: 'Recommended actions',
      findings: [
        'Company email pattern detected in public sources.',
        'Domain / brand references detected in available sources.',
        'Possible credential exposure detected.',
      ],
      recommendations: [
        'Targeted password reset if the signal is confirmed.',
        'Mandatory MFA for exposed or high-risk accounts.',
        'Reduce exposed personal emails and direct contact paths.',
        'Anti-impersonation procedures for HR and finance teams.',
      ],
    },
    prioritiesTitle: 'Operational priorities',
    priorities: [
      {
        label: 'P1',
        level: 'High',
        text: 'Review direct public exposure of finance and HR email addresses.',
      },
      {
        label: 'P2',
        level: 'High',
        text: 'Introduce verification steps for supplier, payment, and bank-detail change requests.',
      },
      {
        label: 'P3',
        level: 'Medium',
        text: 'Reduce unnecessary role/process detail in indexed documents and public pages.',
      },
      {
        label: 'P4',
        level: 'Medium',
        text: 'Brief executives, finance, HR, and operations on AI-assisted impersonation scenarios.',
      },
    ],
    immediateTitle: 'What to do immediately',
    immediateItems: [
      'Confirm which public contacts must remain visible for business reasons.',
      'Move unnecessary direct emails behind forms or shared monitored inboxes.',
      'Add out-of-band verification for urgent payment or supplier changes.',
      'Review public documents for process, supplier, and role details that are not needed.',
    ],
    finalTitle: 'Want this view on your real public exposure?',
    finalText:
      'Start with a short call. We confirm fit and scope before activating the assessment.',
  },
  it: {
    backHome: 'Torna alla home',
    eyebrow: 'Report demo anonimo',
    title: 'Cosa puo restituire un assessment HumanSurface',
    intro:
      'Questo demo mostra la forma del deliverable: esposizione pubblica, contatti potenzialmente esposti, tecnologie visibili, segnali leak/dark web, rischio impersonificazione AI-assisted e priorita operative.',
    demoNotice:
      'Tutti i dati in questa pagina sono sintetici e anonimi. Non descrivono una vera azienda e non implicano copertura completa del dark web o risultati garantiti.',
    scoreLabel: 'Risk score demo',
    riskLevel: 'Esposizione medio-alta',
    domainLabel: 'Dominio demo',
    domainValue: 'azienda-demo.example',
    scopeLabel: 'Scope demo',
    scopeValue: 'Sito pubblico, pagine indicizzate, canali di contatto, contesto ruoli visibile',
    cta: 'Richiedi assessment',
    method: 'Leggi il metodo',
    sections: [
      {
        title: 'Superficie pubblica esposta',
        description:
          'Informazioni raggiungibili pubblicamente che possono aiutare a capire l’organizzazione.',
        icon: Radar,
        items: [
          'Pagine team e leadership con descrizioni dei ruoli.',
          'Pagine contatti e fornitori che rivelano canali operativi.',
          'PDF indicizzati con riferimenti a processi e nomi documento.',
          'Pagine recruiting con contatti HR e contesto assunzioni.',
        ],
      },
      {
        title: 'Email potenzialmente esposte',
        description:
          'Esempi sintetici di contatti visibili e pattern indirizzi prevedibili.',
        icon: Mail,
        items: [
          'info@azienda-demo.example visibile nelle pagine contatto pubbliche.',
          'amministrazione@azienda-demo.example citata in un documento demo.',
          'careers@azienda-demo.example esposta nelle pagine recruiting.',
          'Pattern nome.cognome deducibile da esempi pubblici.',
        ],
      },
      {
        title: 'Tecnologie visibili',
        description:
          'Tecnologie visibili o deducibili dall’esterno, senza scansioni invasive.',
        icon: Fingerprint,
        items: [
          'Segnali di CMS e framework del sito pubblico.',
          'Tag analytics e marketing visibili nel sorgente pagina.',
          'Segnali di protezione email e configurazione DNS.',
          'Form pubblici e percorsi di download documenti.',
        ],
      },
      {
        title: 'Segnali dark web/leak',
        description:
          'Esempi solo dimostrativi di come vengono sintetizzati segnali di esposizione quando rilevanti.',
        icon: FileWarning,
        items: [
          'Nessun leak credenziale confermato e rappresentato in questo demo.',
          'Una menzione sintetica del dominio demo in una fonte con riferimenti a breach.',
          'Nessuna password, segreto o dato sensibile viene mostrato.',
          'I segnali vengono classificati per priorità e validati nel contesto dello scope concordato.',
        ],
      },
      {
        title: 'Rischio impersonificazione AI-assisted',
        description:
          'Come il contesto pubblico puo essere combinato in messaggi o pretesti credibili.',
        icon: TriangleAlert,
        items: [
          'Contesto finance e fornitori visibile puo supportare pretesti su fatture o coordinate bancarie.',
          'Descrizioni dei ruoli executive possono aiutare a imitare tono, autorita e urgenza.',
          'Contesto HR puo supportare phishing con falso candidato o allegati malevoli.',
          'Le informazioni pubbliche vanno distinte tra visibilita utile al business e dettaglio che aumenta il rischio.',
        ],
      },
      {
        title: 'Informazioni pubbliche su ruoli chiave potenzialmente abusabili',
        description:
          'Contesto business pubblico che puo rendere piu credibile il social engineering mirato.',
        icon: Users,
        items: [
          'Responsabilita finance e riferimenti al processo pagamenti.',
          'Responsabilita executive e partecipazione a eventi pubblici.',
          'Workflow HR e canali di comunicazione con candidati.',
          'Riferimenti operations a sedi, fornitori e processi di consegna.',
        ],
      },
    ],
    darkWebReport: {
      title: 'Segnali leak/dark web',
      description:
        'Questa sezione demo mostra come sintetizziamo indicatori disponibili senza esporre dati sensibili. Nessun risultato e garantito e ogni segnale va validato.',
      note:
        'Solo demo: non contiene dati reali di aziende, password, segreti o record rubati.',
      findingsTitle: 'Esempi di finding',
      recommendationsTitle: 'Raccomandazioni',
      findings: [
        'Pattern email aziendale rilevato in fonti pubbliche.',
        'Riferimenti a dominio/brand rilevati.',
        'Possibile esposizione credenziali rilevata.',
      ],
      recommendations: [
        'Reset password mirato se il segnale viene confermato.',
        'MFA obbligatoria per account esposti o ad alto rischio.',
        'Riduzione email personali esposte e contatti diretti non necessari.',
        'Procedure anti-impersonificazione per HR/finance.',
      ],
    },
    prioritiesTitle: 'Priorita operative',
    priorities: [
      {
        label: 'P1',
        level: 'Alta',
        text: 'Rivedere l’esposizione pubblica diretta di email finance e HR.',
      },
      {
        label: 'P2',
        level: 'Alta',
        text: 'Introdurre verifiche per richieste su fornitori, pagamenti e cambio coordinate bancarie.',
      },
      {
        label: 'P3',
        level: 'Media',
        text: 'Ridurre dettagli non necessari su ruoli e processi in documenti indicizzati e pagine pubbliche.',
      },
      {
        label: 'P4',
        level: 'Media',
        text: 'Preparare executive, finance, HR e operations su scenari di impersonificazione AI-assisted.',
      },
    ],
    immediateTitle: 'Cosa fare subito',
    immediateItems: [
      'Confermare quali contatti pubblici devono restare visibili per ragioni di business.',
      'Spostare email dirette non necessarie dietro form o inbox condivise monitorate.',
      'Aggiungere verifiche fuori banda per richieste urgenti su pagamenti o fornitori.',
      'Rivedere documenti pubblici con dettagli su processi, fornitori e ruoli non necessari.',
    ],
    finalTitle: 'Vuoi questa vista sulla tua esposizione reale?',
    finalText:
      'Parti da una breve call. Confermiamo aderenza e scope prima di attivare l’assessment.',
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

export default async function ExampleReportPage() {
  const locale = await getRequestLocale()
  const t = copy[locale]

  return (
    <main className="min-h-screen bg-[#040816] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_70%_20%,rgba(168,85,247,0.12),transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
            {t.backHome}
          </Link>
          <LanguageToggle />
        </header>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
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
            <div className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-4 text-sm leading-7 text-slate-200">
              {t.demoNotice}
            </div>
          </div>

          <Panel className="p-6">
            <div className="rounded-[24px] border border-white/10 bg-[#071022] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                    {t.scoreLabel}
                  </div>
                  <div className="mt-3 text-6xl font-semibold tracking-tight">
                    67<span className="text-2xl text-slate-500">/100</span>
                  </div>
                </div>
                <div className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-4 py-2 text-sm font-semibold text-fuchsia-100">
                  {t.riskLevel}
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {t.domainLabel}
                  </div>
                  <div className="mt-2 font-mono text-lg text-white">{t.domainValue}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {t.scopeLabel}
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-200">
                    {t.scopeValue}
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {t.sections.map((section) => {
            const Icon = section.icon
            return (
              <Panel key={section.title} className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-semibold leading-8">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {section.description}
                </p>
                <div className="mt-5 space-y-3">
                  {section.items.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-[#030815]/50 px-4 py-3 text-sm leading-7 text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </Panel>
            )
          })}
        </section>

        <section className="py-20">
          <Panel className="border-fuchsia-300/20 bg-fuchsia-300/[0.05] p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100">
                  <FileWarning className="h-5 w-5" />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight">
                  {t.darkWebReport.title}
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-300">
                  {t.darkWebReport.description}
                </p>
                <div className="mt-5 rounded-2xl border border-white/10 bg-[#030815]/50 px-4 py-3 text-sm leading-7 text-slate-200">
                  {t.darkWebReport.note}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-[#071022] p-5">
                  <h3 className="text-lg font-semibold text-white">
                    {t.darkWebReport.findingsTitle}
                  </h3>
                  <div className="mt-4 grid gap-3">
                    {t.darkWebReport.findings.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-fuchsia-200/10 bg-fuchsia-300/[0.06] px-4 py-3 text-sm leading-7 text-slate-200"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-[#071022] p-5">
                  <h3 className="text-lg font-semibold text-white">
                    {t.darkWebReport.recommendationsTitle}
                  </h3>
                  <div className="mt-4 grid gap-3">
                    {t.darkWebReport.recommendations.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-cyan-200/10 bg-cyan-300/[0.06] px-4 py-3 text-sm leading-7 text-cyan-50"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-8 pb-20 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">
              {t.prioritiesTitle}
            </div>
            <div className="mt-8 grid gap-4">
              {t.priorities.map((priority) => (
                <Panel key={priority.label} className="p-5">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 text-sm font-semibold text-fuchsia-100">
                      {priority.label}
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                        {priority.level}
                      </div>
                      <p className="mt-2 leading-7 text-slate-200">{priority.text}</p>
                    </div>
                  </div>
                </Panel>
              ))}
            </div>
          </div>

          <Panel className="p-6">
            <div className="mb-5 flex items-center gap-3 text-cyan-200">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="text-2xl font-semibold text-white">{t.immediateTitle}</h2>
            </div>
            <div className="grid gap-3">
              {t.immediateItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-cyan-200/10 bg-cyan-300/[0.06] px-4 py-3 text-sm leading-7 text-cyan-50"
                >
                  {item}
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="pb-16">
          <Panel className="p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-3 text-cyan-200">
                  <ScanSearch className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-[0.18em]">
                    HumanSurface
                  </span>
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                  {t.finalTitle}
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                  {t.finalText}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href="/buy"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  {t.cta} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/metodo"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
                >
                  {t.method}
                </Link>
              </div>
            </div>
          </Panel>
        </section>
      </div>
    </main>
  )
}

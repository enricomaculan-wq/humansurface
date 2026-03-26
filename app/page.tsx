'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Radar,
  Users,
  Mail,
  Fingerprint,
  TriangleAlert,
  ArrowRight,
  Activity,
  ScanSearch,
  FileWarning,
  Building2,
  Briefcase,
  ChevronRight,
} from 'lucide-react'

type Locale = 'en' | 'it'

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

type Translation = {
  navHow: string
  navSample: string
  navDashboard: string
  navPricing: string
  login: string
  getAssessment: string
  seeSampleReport: string
  company: string
  resources: string
  privacy: string
  terms: string
  contact: string
  sampleReport: string
  dashboardPreview: string
  buyAssessment: string

  heroBadge: string
  heroTitle: string
  heroText: string
  chip1: string
  chip2: string
  chip3: string

  launchOffer: string
  launchText: string

  liveSnapshot: string
  highExposure: string
  humanSurfaceScore: string
  topFindings: string
  criticalSignals: string
  changed7: string
  orgMapped: string
  roleModeled: string
  scenariosGenerated: string

  ribbon1: string
  ribbon2: string
  ribbon3: string
  ribbon4: string

  problemEyebrow: string
  problemTitle: string
  problemText: string
  problemCard1Title: string
  problemCard1Text: string
  problemCard2Title: string
  problemCard2Text: string
  problemCard3Title: string
  problemCard3Text: string

  howEyebrow: string
  howTitle: string
  step1Title: string
  step1Text: string
  step2Title: string
  step2Text: string
  step3Title: string
  step3Text: string

  whatEyebrow: string
  whatTitle: string
  whatText: string
  executiveAssessment: string
  reportTitle: string
  immediateRemediation: string

  findingsEyebrow: string
  findingsTitle: string

  whoEyebrow: string
  whoTitle: string

  diffEyebrow: string
  diffTitle: string
  traditional: string
  humansurface: string

  dashboardEyebrow: string
  dashboardTitle: string
  dashboardText: string
  assessmentOverview: string
  peopleAtRisk: string
  exposedPeople: string
  delta7: string

  pricingEyebrow: string
  pricingTitle: string
  pricingText: string
  assessmentName: string
  pricingDescription: string
  buyFlow: string
  simpleAndFast: string
  launchCustomers: string

  finalEyebrow: string
  finalTitle: string
  finalText: string
  launchPrice: string
  securePayment: string
  assessmentFirst: string
  directPurchase: string
  buyOnline: string

  footerText: string
}

const copy: Record<Locale, Translation> = {
  en: {
    navHow: 'How it works',
    navSample: 'Sample report',
    navDashboard: 'Dashboard',
    navPricing: 'Pricing',
    login: 'Login',
    getAssessment: 'Get assessment',
    seeSampleReport: 'See sample report',
    company: 'Company',
    resources: 'Resources',
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact',
    sampleReport: 'Sample report',
    dashboardPreview: 'Dashboard preview',
    buyAssessment: 'Buy assessment',

    heroBadge: 'Cyber exposure intelligence for phishing and fraud',
    heroTitle:
      'Discover which people, roles, and public information make your company vulnerable to phishing, impersonation, and fraud.',
    heroText:
      'HumanSurface analyzes your company’s public exposure and shows where attackers could target your business through people, key roles, and email visibility.',
    chip1: 'No complex setup',
    chip2: 'Secure checkout',
    chip3: 'Built for SMEs and professional firms',

    launchOffer: 'Launch offer',
    launchText:
      'One-time HumanSurface Assessment including website scan, external exposure analysis, people and role visibility, website/external/combined scoring, and executive-ready reporting.',

    liveSnapshot: 'Live assessment snapshot',
    highExposure: 'High exposure',
    humanSurfaceScore: 'HumanSurface Score',
    topFindings: 'Top findings',
    criticalSignals: '5 critical signals',
    changed7: 'What changed in 7 days',
    orgMapped: 'Org visibility mapped',
    roleModeled: 'Role exposure modeled',
    scenariosGenerated: 'Fraud scenarios generated',

    ribbon1: 'Human-centered risk visibility',
    ribbon2: 'Executive-ready reporting',
    ribbon3: 'Focused on phishing and fraud exposure',
    ribbon4: 'Built for practical security assessments',

    problemEyebrow: 'The problem',
    problemTitle:
      'Most attacks do not start with infrastructure. They start with people.',
    problemText:
      'Many companies protect systems and email, but still expose public information that helps attackers run phishing, impersonation, and fraud attempts with higher credibility.',

    problemCard1Title: 'Public exposure',
    problemCard1Text:
      'Public emails, names, roles, and pages can increase your attack surface.',
    problemCard2Title: 'Impersonation risk',
    problemCard2Text:
      'Visible business context makes fake internal requests more believable.',
    problemCard3Title: 'Actionable remediation',
    problemCard3Text:
      'Clear findings and immediate next steps, not generic security reporting.',

    howEyebrow: 'How it works',
    howTitle: 'From company domain to action plan in a few simple steps.',
    step1Title: 'Enter your company details',
    step1Text: 'Company name, domain, business email, and any optional context.',
    step2Title: 'Continue to secure payment',
    step2Text: 'Purchase the assessment online with secure Stripe checkout.',
    step3Title: 'Receive your assessment',
    step3Text:
      'Get findings, scores, exposed roles, and immediate remediation priorities.',

    whatEyebrow: 'What you get',
    whatTitle: 'Not just data. Clear priorities.',
    whatText:
      'A HumanSurface assessment gives you an executive-ready view of how publicly exposed your organization is and how that exposure can be used against you.',
    executiveAssessment: 'Executive assessment',
    reportTitle: 'HumanSurface Report',
    immediateRemediation: 'Immediate remediation',

    findingsEyebrow: 'Example findings',
    findingsTitle: 'Examples of what HumanSurface can reveal',

    whoEyebrow: 'Who it’s for',
    whoTitle:
      'Built for organizations where people are part of the attack surface',

    diffEyebrow: 'Why it’s different',
    diffTitle:
      'Traditional tools monitor systems. HumanSurface shows how attackers can target your company through people.',
    traditional: 'Traditional security visibility',
    humansurface: 'HumanSurface',

    dashboardEyebrow: 'Internal dashboard',
    dashboardTitle:
      'A cyber-tech dashboard that feels like a real platform, not a generic brochure.',
    dashboardText:
      'This preview extends the same visual language into the actual product: high-signal cards, score-driven layouts, clear findings, and immediate remediation.',
    assessmentOverview: 'Assessment overview',
    peopleAtRisk: 'People at risk',
    exposedPeople: 'Most exposed roles and people',
    delta7: '7-day delta',

    pricingEyebrow: 'Pricing',
    pricingTitle: 'Start with a one-time assessment.',
    pricingText:
      'Simple launch pricing, direct online purchase, and secure checkout.',
    assessmentName: 'HumanSurface Assessment',
    pricingDescription:
      'A one-time assessment designed to reveal the public exposure that can increase phishing, impersonation, and fraud risk for your company.',
    buyFlow: 'Buy flow',
    simpleAndFast: 'Simple and fast',
    launchCustomers: 'Launch offer available for the first customers.',

    finalEyebrow: 'Buy now',
    finalTitle: 'Start with your first HumanSurface assessment.',
    finalText:
      'Purchase your assessment online, enter your company details, and continue to secure payment.',
    launchPrice: 'Launch offer: €190 + VAT',
    securePayment: 'Secure payment with Stripe',
    assessmentFirst: 'Built for assessment-first sales',
    directPurchase: 'Direct purchase',
    buyOnline: 'Buy your assessment online',

    footerText:
      'HumanSurface helps organizations identify public exposure that can enable phishing, impersonation, and human-targeted fraud.',
  },
  it: {
    navHow: 'Come funziona',
    navSample: 'Report esempio',
    navDashboard: 'Dashboard',
    navPricing: 'Prezzi',
    login: 'Login',
    getAssessment: 'Acquista assessment',
    seeSampleReport: 'Vedi report esempio',
    company: 'Azienda',
    resources: 'Risorse',
    privacy: 'Privacy',
    terms: 'Termini',
    contact: 'Contatti',
    sampleReport: 'Report esempio',
    dashboardPreview: 'Anteprima dashboard',
    buyAssessment: 'Acquista assessment',

    heroBadge: 'Intelligence sull’esposizione cyber per phishing e frodi',
    heroTitle:
      'Scopri quali persone, ruoli e dati pubblici aumentano il rischio di phishing e frodi.',
    heroText:
      'HumanSurface analizza l’esposizione pubblica della tua azienda e mostra dove un attaccante potrebbe colpirti attraverso persone, ruoli chiave e visibilità delle email.',
    chip1: 'Nessuna configurazione complessa',
    chip2: 'Checkout sicuro',
    chip3: 'Pensato per PMI e studi professionali',

    launchOffer: 'Offerta lancio',
    launchText:
      'Assessment HumanSurface con scansione del sito, analisi dell’esposizione esterna, visibilità di persone e ruoli, scoring website/external/combined e report executive-ready.',

    liveSnapshot: 'Snapshot assessment',
    highExposure: 'Alta esposizione',
    humanSurfaceScore: 'HumanSurface Score',
    topFindings: 'Principali finding',
    criticalSignals: '5 segnali critici',
    changed7: 'Cosa è cambiato in 7 giorni',
    orgMapped: 'Visibilità organizzativa mappata',
    roleModeled: 'Esposizione ruoli modellata',
    scenariosGenerated: 'Scenari di frode generati',

    ribbon1: 'Visibilità del rischio umano',
    ribbon2: 'Report pronti per il management',
    ribbon3: 'Focalizzato su phishing e frodi',
    ribbon4: 'Creato per assessment pratici',

    problemEyebrow: 'Il problema',
    problemTitle:
      'La maggior parte degli attacchi non inizia dall’infrastruttura. Inizia dalle persone.',
    problemText:
      'Molte aziende proteggono sistemi ed email, ma continuano a esporre informazioni pubbliche che aiutano gli attaccanti a rendere più credibili phishing, impersonificazione e frodi.',

    problemCard1Title: 'Esposizione pubblica',
    problemCard1Text:
      'Email pubbliche, nomi, ruoli e pagine aumentano la superficie d’attacco.',
    problemCard2Title: 'Rischio di impersonificazione',
    problemCard2Text:
      'Il contesto aziendale visibile rende più credibili le richieste false interne.',
    problemCard3Title: 'Remediation concreta',
    problemCard3Text:
      'Finding chiari e azioni immediate, non report generici di sicurezza.',

    howEyebrow: 'Come funziona',
    howTitle: 'Dal dominio aziendale a un piano d’azione in pochi passaggi.',
    step1Title: 'Inserisci i dati aziendali',
    step1Text: 'Nome azienda, dominio, email business e contesto opzionale.',
    step2Title: 'Procedi al pagamento sicuro',
    step2Text: 'Acquista online con checkout Stripe sicuro.',
    step3Title: 'Ricevi il tuo assessment',
    step3Text:
      'Ottieni finding, score, ruoli esposti e priorità di remediation.',

    whatEyebrow: 'Cosa ottieni',
    whatTitle: 'Non solo dati. Priorità chiare.',
    whatText:
      'Un assessment HumanSurface ti offre una vista executive-ready su quanto la tua organizzazione sia esposta pubblicamente e su come questa esposizione possa essere sfruttata.',
    executiveAssessment: 'Assessment executive',
    reportTitle: 'Report HumanSurface',
    immediateRemediation: 'Remediation immediata',

    findingsEyebrow: 'Esempi di finding',
    findingsTitle: 'Esempi di ciò che HumanSurface può rilevare',

    whoEyebrow: 'Per chi è',
    whoTitle:
      'Pensato per organizzazioni in cui le persone fanno parte della superficie d’attacco',

    diffEyebrow: 'Perché è diverso',
    diffTitle:
      'Gli strumenti tradizionali monitorano i sistemi. HumanSurface mostra dove la tua azienda è esposta attraverso le persone',
    traditional: 'Visibilità sicurezza tradizionale',
    humansurface: 'HumanSurface',

    dashboardEyebrow: 'Dashboard interna',
    dashboardTitle:
      'Una dashboard cyber-tech pensata per rendere immediati score, finding e priorità',
    dashboardText:
      'Questa anteprima mostra l’esperienza del prodotto: score leggibili, finding chiari, persone esposte e remediation immediata',
    assessmentOverview: 'Panoramica assessment',
    peopleAtRisk: 'Persone a rischio',
    exposedPeople: 'Ruoli e persone più esposti',
    delta7: 'Delta 7 giorni',

    pricingEyebrow: 'Prezzi',
    pricingTitle: 'Inizia con un assessment una tantum.',
    pricingText:
      'Prezzo lancio semplice, acquisto diretto online e checkout sicuro.',
    assessmentName: 'Assessment HumanSurface',
    pricingDescription:
      'Un assessment una tantum progettato per mostrare l’esposizione pubblica che può aumentare il rischio di phishing, impersonificazione e frodi.',
    buyFlow: 'Flusso acquisto',
    simpleAndFast: 'Semplice e veloce',
    launchCustomers: 'Offerta lancio disponibile per i primi clienti.',

    finalEyebrow: 'Acquista ora',
    finalTitle: 'Inizia con il tuo primo assessment HumanSurface.',
    finalText:
      'Acquista il tuo assessment online, inserisci i dati aziendali e procedi al pagamento sicuro.',
    launchPrice: 'Offerta lancio: €190 + IVA',
    securePayment: 'Pagamento sicuro con Stripe',
    assessmentFirst: 'Pensato per vendita assessment-first',
    directPurchase: 'Acquisto diretto',
    buyOnline: 'Acquista il tuo assessment online',

    footerText:
      'HumanSurface aiuta le organizzazioni a identificare l’esposizione pubblica che può favorire phishing, impersonificazione e frodi mirate alle persone.',
  },
} as const

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <motion.div variants={fadeUp} className="max-w-3xl">
      <div className="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">
        {eyebrow}
      </div>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-5 text-lg leading-8 text-slate-300">{description}</p>
      ) : null}
    </motion.div>
  )
}

function GlassCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-white/[0.035] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  )
}

function DataChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
      {children}
    </span>
  )
}

function SeverityBadge({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const styles = {
    High: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200',
    Medium: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100',
    Low: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  }

  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${styles[level]}`}
    >
      {level}
    </span>
  )
}

function LaunchPricingCard({
  t,
}: {
  t: Translation
}) {
  return (
    <div className="mt-8 max-w-xl rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.08] p-5 shadow-[0_0_40px_rgba(34,211,238,0.10)]">
      <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-cyan-200">
        {t.launchOffer}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="text-5xl font-semibold tracking-tight text-white">€190</div>
        <div className="pb-1 text-lg text-slate-300">+ VAT</div>
        <div className="pb-1 text-sm text-slate-500 line-through">€290 standard</div>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-300">{t.launchText}</p>
    </div>
  )
}

function LandingHero({
  t,
  locale,
}: {
  t: Translation
  locale: Locale
}) {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl gap-14 px-6 py-20 lg:px-8 lg:py-28">
        <motion.div
          className="flex flex-col justify-center"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex w-fit max-w-full items-center rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-200/90 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
          >
            {t.heroBadge}
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.03]"
          >
            {t.heroTitle}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-2xl text-lg leading-8 text-slate-300"
          >
            {t.heroText}
          </motion.p>

          <motion.div variants={fadeUp}>
            <LaunchPricingCard t={t} />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              id="request-assessment"
              href="/buy"
              className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 shadow-[0_0_36px_rgba(34,211,238,0.20)] transition hover:-translate-y-0.5 hover:bg-cyan-200"
            >
              {t.getAssessment} <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#sample-report"
              className="inline-flex min-w-[210px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-center text-sm font-semibold text-white backdrop-blur transition hover:border-cyan-300/20 hover:bg-cyan-300/10"
            >
              {t.seeSampleReport}
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <DataChip>{t.chip1}</DataChip>
            <DataChip>{t.chip2}</DataChip>
            <DataChip>{t.chip3}</DataChip>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative w-full max-w-2xl">
            <div className="absolute -inset-2 rounded-[34px] bg-[radial-gradient(circle,rgba(34,211,238,0.18),transparent_65%)] blur-2xl" />

            <GlassCard className="relative p-4 shadow-[0_0_80px_rgba(34,211,238,0.10)] sm:p-6">
              <div className="rounded-[24px] border border-white/10 bg-[#071022]/95 p-5">
                <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
                  <div className="flex min-w-0 items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-200/70">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                    <span className="truncate">{t.liveSnapshot}</span>
                  </div>

                  <div className="shrink-0 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-medium text-fuchsia-200">
                    {t.highExposure}
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[0.0.72fr_1.28fr]">
                  <div>
                    <div className="text-sm text-slate-400">{t.humanSurfaceScore}</div>
                    <div className="mt-2 text-5xl font-semibold tracking-tight text-white">
                      72<span className="text-2xl text-slate-500">/100</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      [locale === 'it' ? 'Impersonazione' : 'Impersonation', '81', 'HIGH'],
                      ['Finance fraud', '68', 'MED'],
                      ['HR / Social', '74', 'HIGH'],
                    ].map(([label, score, level]) => (
                      <div
                        key={label}
                        className="min-h-[132px] rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                      >
                        <div className="text-[8px] uppercase leading-4 tracking-[0.06em] text-slate-400 sm:text-[9px]">
                          {label}
                        </div>
                        <div className="mt-4 text-2xl font-semibold text-white">{score}</div>
                        <div className="mt-2 text-[10px] tracking-[0.14em] text-cyan-200/80">
                          {level}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.95fr]">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-cyan-200/80">
                        {t.topFindings}
                      </h3>
                      <span className="text-xs text-slate-500">{t.criticalSignals}</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        'Public email addresses found on company pages',
                        'Executive visibility exposed',
                        'Predictable email naming pattern detected',
                      ].map((item, idx) => (
                        <div
                          key={item}
                          className="flex gap-3 rounded-xl border border-white/8 bg-[#030815] px-3 py-3"
                        >
                          <div
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                              idx === 1
                                ? 'bg-fuchsia-300 shadow-[0_0_12px_rgba(232,121,249,0.8)]'
                                : 'bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]'
                            }`}
                          />
                          <p className="text-sm text-slate-200">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/8 p-4">
                    <div className="text-sm font-medium uppercase tracking-[0.16em] text-cyan-100">
                      {t.changed7}
                    </div>

                    <div className="mt-4 space-y-3 text-sm text-cyan-50">
                      {[
                        '+2 public email addresses detected',
                        '+1 HR contact page discovered',
                        'Overall score moved from 64 to 72',
                      ].map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-cyan-200/10 bg-[#030815]/50 px-3 py-3"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 text-[11px] uppercase tracking-[0.18em] text-slate-500 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
                    {t.orgMapped}
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
                    {t.roleModeled}
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
                    {t.scenariosGenerated}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
function InternalDashboardPreview({
  t,
}: {
  t: Translation
}) {
  const people = [
    {
      name: 'Laura Bianchi',
      role: 'CFO',
      score: 84,
      scenario: 'Payment fraud',
      icon: Briefcase,
    },
    {
      name: 'Marco Rossi',
      role: 'CEO',
      score: 81,
      scenario: 'Executive impersonation',
      icon: Building2,
    },
    {
      name: 'Giulia Verdi',
      role: 'HR Manager',
      score: 76,
      scenario: 'Fake candidate phishing',
      icon: Users,
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <SectionTitle
        eyebrow={t.dashboardEyebrow}
        title={t.dashboardTitle}
        description={t.dashboardText}
      />

      <motion.div
        className="mt-12 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
      >
        <motion.div variants={fadeUp}>
          <GlassCard className="overflow-hidden p-5">
            <div className="rounded-[24px] border border-white/10 bg-[#071022] p-5">
              <div className="flex flex-col gap-4 border-b border-white/8 pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                    {t.assessmentOverview}
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold">Rossi Industriali S.r.l.</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    last scan · 17 Mar 2026 · domain: rossi-industriali.it
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      Overall
                    </div>
                    <div className="mt-1 text-2xl font-semibold">72</div>
                  </div>
                  <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-3 text-fuchsia-200">
                    <div className="text-[10px] uppercase tracking-[0.18em]">
                      Risk level
                    </div>
                    <div className="mt-1 text-2xl font-semibold">High</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {[
                  { label: 'Impersonation', value: 81, icon: Fingerprint },
                  { label: 'Finance Fraud', value: 68, icon: FileWarning },
                  { label: 'HR / Social Engineering', value: 74, icon: Mail },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                          score
                        </span>
                      </div>
                      <div className="mt-4 text-sm text-slate-300">{item.label}</div>
                      <div className="mt-1 text-3xl font-semibold">{item.value}</div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">
                      Critical findings
                    </h4>
                    <span className="text-xs text-slate-500">updated now</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      ['Public email addresses found on company pages', 'High'],
                      ['Predictable naming pattern supports address enumeration', 'Medium'],
                      ['Finance role visibility increases urgent-payment fraud risk', 'High'],
                      ['Public HR contact page discovered', 'Medium'],
                    ].map(([title, level]) => (
                      <div
                        key={title}
                        className="rounded-2xl border border-white/8 bg-[#030815] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm text-slate-200">{title}</div>
                          <SeverityBadge level={level as 'High' | 'Medium'} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-100">
                      {t.immediateRemediation}
                    </h4>
                    <ScanSearch className="h-4 w-4 text-cyan-200" />
                  </div>
                  <div className="space-y-3">
                    {[
                      'Reduce public exposure of direct finance and HR email addresses',
                      'Introduce payment verification controls for urgent requests',
                      'Review leadership pages and public role descriptions',
                      'Train HR and finance on impersonation scenarios',
                    ].map((task) => (
                      <div
                        key={task}
                        className="rounded-2xl border border-cyan-200/10 bg-[#030815]/50 p-4 text-sm text-cyan-50"
                      >
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeUp} className="grid gap-6">
          <GlassCard className="p-5">
            <div className="rounded-[24px] border border-white/10 bg-[#071022] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                    {t.peopleAtRisk}
                  </div>
                  <h3 className="mt-2 text-xl font-semibold">{t.exposedPeople}</h3>
                </div>
                <Activity className="h-5 w-5 text-cyan-200" />
              </div>
              <div className="mt-5 space-y-3">
                {people.map((person) => {
                  const Icon = person.icon
                  return (
                    <div
                      key={person.name}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#030815] text-cyan-200">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{person.name}</div>
                            <div className="text-sm text-slate-400">{person.role}</div>
                            <div className="mt-2 text-sm text-slate-300">
                              Main scenario: {person.scenario}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                            risk score
                          </div>
                          <div className="mt-1 text-2xl font-semibold">{person.score}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="rounded-[24px] border border-white/10 bg-[#071022] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                    {t.delta7}
                  </div>
                  <h3 className="mt-2 text-xl font-semibold">{t.changed7}</h3>
                </div>
                <Radar className="h-5 w-5 text-cyan-200" />
              </div>
              <div className="mt-5 space-y-3">
                {[
                  '+2 new public emails discovered',
                  '+1 executive profile indexed',
                  'Finance fraud risk unchanged',
                  'Overall score moved from 64 to 72',
                ].map((item, idx) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center gap-3 text-sm text-slate-200">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          idx === 2 ? 'bg-cyan-300' : 'bg-fuchsia-300'
                        } ${
                          idx === 2
                            ? 'shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                            : 'shadow-[0_0_10px_rgba(232,121,249,0.8)]'
                        }`}
                      />
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </section>
  )
}

function LanguageToggle({
  locale,
  onChange,
}: {
  locale: Locale
  onChange: (locale: Locale) => void
}) {
  return (
    <div className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1 md:flex">
      {(['en', 'it'] as Locale[]).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
            locale === item
              ? 'bg-cyan-300 text-slate-950'
              : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

export default function HumanSurfaceLandingPage() {
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    const saved = window.localStorage.getItem('humansurface_locale')
    if (saved === 'en' || saved === 'it') {
      setLocale(saved)
      return
    }

    const browserLang = window.navigator.language.toLowerCase()
    if (browserLang.startsWith('it')) {
      setLocale('it')
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('humansurface_locale', locale)
  }, [locale])

  const t = useMemo(() => copy[locale], [locale])

  const findings = [
    {
      title:
        locale === 'it'
          ? 'Email pubbliche rilevate'
          : 'Public email addresses detected',
      description:
        locale === 'it'
          ? 'L’esposizione di contatti diretti può aumentare le opportunità di phishing e rendere più credibili i tentativi di impersonificazione.'
          : 'Direct contact exposure can increase phishing opportunities and make impersonation attempts more credible.',
      severity: 'High' as const,
      icon: Mail,
    },
    {
      title:
        locale === 'it'
          ? 'Pattern email prevedibile'
          : 'Predictable email naming pattern',
      description:
        locale === 'it'
          ? 'Un attaccante può indovinare altri indirizzi validi partendo dalle convenzioni visibili.'
          : 'Attackers may guess additional valid company addresses from visible naming conventions.',
      severity: 'Medium' as const,
      icon: Fingerprint,
    },
    {
      title:
        locale === 'it'
          ? 'Visibilità executive esposta'
          : 'Executive visibility exposed',
      description:
        locale === 'it'
          ? 'La visibilità del management può supportare frodi urgenti e impersonificazione dei ruoli.'
          : 'Leadership visibility can support urgent-request fraud and role-based impersonation.',
      severity: 'High' as const,
      icon: Shield,
    },
    {
      title:
        locale === 'it'
          ? 'Contatti HR pubblicamente esposti'
          : 'Public HR contacts exposed',
      description:
        locale === 'it'
          ? 'I contatti recruiting possono attirare candidature false, malware o pretesti mirati.'
          : 'Recruiting-related contacts may attract fake applications, malware delivery, or pretexting.',
      severity: 'Medium' as const,
      icon: Users,
    },
    {
      title:
        locale === 'it'
          ? 'Le team page rivelano contesto aziendale'
          : 'Team pages reveal business context',
      description:
        locale === 'it'
          ? 'Dettagli organizzativi pubblici possono supportare spear phishing più credibili.'
          : 'Public org details can support spear phishing with more believable business context.',
      severity: 'Medium' as const,
      icon: Radar,
    },
    {
      title:
        locale === 'it'
          ? 'I ruoli finance sono facili da identificare'
          : 'Finance roles are easy to identify',
      description:
        locale === 'it'
          ? 'Contatti finance visibili possono aumentare il rischio di tentativi di payment fraud.'
          : 'Visible finance contacts can raise the likelihood of payment fraud attempts.',
      severity: 'High' as const,
      icon: TriangleAlert,
    },
  ]

  const audiences = locale === 'it'
    ? [
        ['PMI', 'Visibilità rapida dell’esposizione senza implementazioni pesanti.'],
        [
          'Studi professionali',
          'Ideale per organizzazioni con nomi, ruoli e contatti molto visibili.',
        ],
        [
          'Aziende manifatturiere',
          'Utile dove leadership, finance, sales e operations sono esposti online.',
        ],
        ['Agenzie', 'Perfetto per team pubblici, people page e contesto aziendale visibile.'],
        [
          'Software house',
          'Utile per aziende con profili pubblici dei dipendenti e team page tecniche.',
        ],
        [
          'MSP e consulenti',
          'Un’offerta di assessment chiara e ripetibile per i clienti.',
        ],
      ]
    : [
        ['SMEs', 'Fast exposure visibility without heavy implementation.'],
        [
          'Professional firms',
          'Ideal for organizations with highly visible names, roles, and contact details.',
        ],
        [
          'Manufacturing companies',
          'Useful where leadership, finance, sales, and operations are exposed online.',
        ],
        ['Agencies', 'Perfect for public-facing teams, people pages, and visible business context.'],
        [
          'Software firms',
          'Helpful for companies with public employee profiles and technical team pages.',
        ],
        [
          'MSPs and consultants',
          'A clear, repeatable assessment offering for client engagements.',
        ],
      ]

  const included = locale === 'it'
    ? [
        'Overall HumanSurface Score',
        'Impersonation Risk',
        'Finance Fraud Risk',
        'HR / Social Engineering Risk',
        'Principali finding critici',
        'Persone e ruoli più esposti',
        'Scenari di attacco',
        'Remediation immediata',
        'Tracking cambiamenti a 7 giorni',
      ]
    : [
        'Overall HumanSurface Score',
        'Impersonation Risk',
        'Finance Fraud Risk',
        'HR / Social Engineering Risk',
        'Top critical findings',
        'Most exposed people and roles',
        'Attack scenarios',
        'Immediate remediation',
        '7-day change tracking',
      ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#040816] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_70%_20%,rgba(168,85,247,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-cyan-300/10 bg-[#040816]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 shadow-[0_0_30px_rgba(34,211,238,0.16)]">
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(34,211,238,0.15),transparent_68%)]" />
              <span className="relative text-lg font-semibold text-cyan-300">H</span>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/70">
                Human attack surface visibility
              </div>
              <div className="text-lg font-semibold tracking-tight">HumanSurface</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 lg:flex">
            <a href="#how-it-works" className="transition hover:text-cyan-200">
              {t.navHow}
            </a>
            <a href="#sample-report" className="transition hover:text-cyan-200">
              {t.navSample}
            </a>
            <a href="#dashboard-preview" className="transition hover:text-cyan-200">
              {t.navDashboard}
            </a>
            <a href="#pricing" className="transition hover:text-cyan-200">
              {t.navPricing}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageToggle locale={locale} onChange={setLocale} />

            <a
              href="/login"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              {t.login}
            </a>

            <a
              href="/buy"
              className="rounded-2xl border border-cyan-300/30 bg-cyan-300/90 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.20)] transition hover:-translate-y-0.5 hover:bg-cyan-200"
            >
              {t.getAssessment}
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <LandingHero t={t} locale={locale}/>

        <section className="border-y border-cyan-300/10 bg-[#061024]/70 backdrop-blur">
          <div className="mx-auto grid max-w-7xl gap-4 px-6 py-6 text-center text-sm text-slate-300 md:grid-cols-4 lg:px-8">
            <div>{t.ribbon1}</div>
            <div>{t.ribbon2}</div>
            <div>{t.ribbon3}</div>
            <div>{t.ribbon4}</div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            <SectionTitle
              eyebrow={t.problemEyebrow}
              title={t.problemTitle}
              description={t.problemText}
            />

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                [t.problemCard1Title, t.problemCard1Text, Radar],
                [t.problemCard2Title, t.problemCard2Text, Shield],
                [t.problemCard3Title, t.problemCard3Text, ScanSearch],
              ].map(([title, description, Icon], idx) => {
                const Comp = Icon as any
                return (
                  <motion.div key={title as string} variants={fadeUp}>
                    <GlassCard className="group h-full p-6 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.04]">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#091226] text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.10)]">
                        <Comp
                          className={`h-5 w-5 ${idx === 1 ? 'text-fuchsia-300' : 'text-cyan-200'}`}
                        />
                      </div>
                      <h3 className="text-xl font-semibold">{title as string}</h3>
                      <p className="mt-3 leading-7 text-slate-300">{description as string}</p>
                    </GlassCard>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </section>

        <section id="how-it-works" className="bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={stagger}
            >
              <SectionTitle eyebrow={t.howEyebrow} title={t.howTitle} />

              <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {[
                  ['01', t.step1Title, t.step1Text],
                  ['02', t.step2Title, t.step2Text],
                  ['03', t.step3Title, t.step3Text],
                ].map(([step, title, description]) => (
                  <motion.div key={step} variants={fadeUp}>
                    <GlassCard className="relative h-full p-6">
                      <div className="absolute right-5 top-5 text-4xl font-semibold tracking-tight text-white/5">
                        {step}
                      </div>
                      <div className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
                        Step {step}
                      </div>
                      <h3 className="mt-4 text-2xl font-semibold">{title}</h3>
                      <p className="mt-4 leading-7 text-slate-300">{description}</p>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="sample-report" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center"
          >
            <motion.div variants={fadeUp}>
              <SectionTitle
                eyebrow={t.whatEyebrow}
                title={t.whatTitle}
                description={t.whatText}
              />
              <div className="mt-8 space-y-4">
                {included.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-slate-200">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.16)]">
                      ✓
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="relative">
              <div className="absolute -inset-2 rounded-[34px] bg-[radial-gradient(circle,rgba(168,85,247,0.16),transparent_65%)] blur-2xl" />
              <GlassCard className="relative border-fuchsia-300/10 p-5">
                <div className="rounded-[24px] border border-white/10 bg-[#f7f9fc] p-6 text-slate-950 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {t.executiveAssessment}
                      </div>
                      <div className="mt-2 text-2xl font-semibold">{t.reportTitle}</div>
                    </div>
                    <div className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-4 py-2 text-sm font-medium text-fuchsia-700">
                      High Risk
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {[
                      ['Overall', '72/100'],
                      ['Impersonation', '81'],
                      ['Finance Fraud', '68'],
                    ].map(([label, score]) => (
                      <div
                        key={label}
                        className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                      >
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {label}
                        </div>
                        <div className="mt-2 text-2xl font-semibold">{score}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <div className="text-sm font-semibold">{t.topFindings}</div>
                    <div className="mt-4 space-y-3 text-sm text-slate-700">
                      <div>• Executive visibility increases impersonation risk</div>
                      <div>• Public email addresses found on company pages</div>
                      <div>• HR contacts publicly exposed</div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-cyan-50 p-5 ring-1 ring-cyan-100">
                    <div className="text-sm font-semibold text-slate-900">
                      {t.immediateRemediation}
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-slate-700">
                      <div>Reduce direct public email exposure</div>
                      <div>Introduce payment verification procedures</div>
                      <div>Train HR and finance on impersonation scenarios</div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </section>

        <section className="bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={stagger}
            >
              <SectionTitle eyebrow={t.findingsEyebrow} title={t.findingsTitle} />
              <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {findings.map((finding) => {
                  const Icon = finding.icon
                  return (
                    <motion.div key={finding.title} variants={fadeUp}>
                      <GlassCard className="h-full p-6 transition hover:border-cyan-300/20 hover:shadow-[0_0_30px_rgba(34,211,238,0.08)]">
                        <div className="mb-5 flex items-center justify-between gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#091226] text-cyan-200">
                            <Icon className="h-5 w-5" />
                          </div>
                          <SeverityBadge level={finding.severity} />
                        </div>
                        <h3 className="text-xl font-semibold leading-7">{finding.title}</h3>
                        <p className="mt-3 leading-7 text-slate-300">{finding.description}</p>
                      </GlassCard>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            <SectionTitle eyebrow={t.whoEyebrow} title={t.whoTitle} />
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {audiences.map(([title, description], idx) => (
                <motion.div key={title} variants={fadeUp}>
                  <GlassCard className="h-full p-6">
                    <div
                      className={`mb-4 h-2 w-14 rounded-full ${
                        idx % 2 === 0
                          ? 'bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]'
                          : 'bg-fuchsia-300 shadow-[0_0_12px_rgba(232,121,249,0.8)]'
                      }`}
                    />
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="mt-3 leading-7 text-slate-300">{description}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={stagger}
            >
              <SectionTitle eyebrow={t.diffEyebrow} title={t.diffTitle} />
              <div className="mt-12 grid gap-6 lg:grid-cols-2">
                <motion.div variants={fadeUp}>
                  <GlassCard className="p-8">
                    <h3 className="text-2xl font-semibold text-slate-200">
                      {t.traditional}
                    </h3>
                    <div className="mt-6 space-y-4 text-slate-300">
                      {[
                        'Endpoints',
                        'Infrastructure',
                        'Cloud assets',
                        'Network exposure',
                        'Technical configurations',
                      ].map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
                <motion.div variants={fadeUp}>
                  <GlassCard className="border-cyan-300/20 bg-cyan-300/[0.07] p-8 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
                    <h3 className="text-2xl font-semibold text-white">{t.humansurface}</h3>
                    <div className="mt-6 space-y-4 text-cyan-50">
                      {[
                        'Public people exposure',
                        'Role-based vulnerability',
                        'Impersonation signals',
                        'Fraud-enabling business context',
                        'Business-oriented remediation',
                      ].map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-cyan-200/10 bg-[#030815]/40 px-4 py-3"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <div id="dashboard-preview">
          <InternalDashboardPreview t={t} />
        </div>

        <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            <SectionTitle
              eyebrow={t.pricingEyebrow}
              title={t.pricingTitle}
              description={t.pricingText}
            />

            <motion.div variants={fadeUp} className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <GlassCard className="border-cyan-300/20 bg-cyan-300/[0.08] p-8 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
                <div className="mb-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-cyan-200">
                  {t.launchOffer}
                </div>

                <h3 className="text-3xl font-semibold">{t.assessmentName}</h3>

                <div className="mt-6 flex flex-wrap items-end gap-3">
                  <div className="text-6xl font-semibold tracking-tight text-white">€190</div>
                  <div className="pb-2 text-xl text-slate-300">+ VAT</div>
                  <div className="pb-2 text-base text-slate-500 line-through">€290 standard</div>
                </div>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                  {t.pricingDescription}
                </p>

                <div className="mt-8 grid gap-3 text-slate-200">
                  {[
                    'Website scan',
                    'External public exposure analysis',
                    'People and role visibility',
                    'Website / external / combined scoring',
                    'Executive-ready report',
                    'Immediate remediation priorities',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-[#030815]/40 px-4 py-3"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/buy"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    {t.getAssessment} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="#sample-report"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
                  >
                    {t.seeSampleReport}
                  </a>
                </div>
              </GlassCard>

              <GlassCard className="p-8">
                <div className="rounded-[24px] border border-white/10 bg-[#071022] p-6">
                  <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                    {t.buyFlow}
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold">{t.simpleAndFast}</h3>

                  <div className="mt-6 space-y-3 text-sm text-slate-300">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      Enter your company details before payment
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      Continue to secure Stripe checkout
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      Start your HumanSurface assessment
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-4 text-sm text-fuchsia-100">
                    {t.launchCustomers}
                  </div>

                  <div className="mt-6">
                    <Link
                      href="/buy"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 shadow-[0_0_36px_rgba(34,211,238,0.20)] transition hover:-translate-y-0.5 hover:bg-cyan-200"
                    >
                      {t.getAssessment} <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </section>

        <section id="final-cta" className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="relative overflow-hidden rounded-[36px] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.10),rgba(168,85,247,0.10))] p-8 shadow-[0_0_60px_rgba(34,211,238,0.08)] backdrop-blur sm:p-12"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-start">
              <div>
                <div className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
                  {t.finalEyebrow}
                </div>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                  {t.finalTitle}
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                  {t.finalText}
                </p>

                <div className="mt-8 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    {t.launchPrice}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-300 shadow-[0_0_10px_rgba(232,121,249,0.8)]" />
                    {t.securePayment}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    {t.assessmentFirst}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/buy"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    {t.getAssessment} <ChevronRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="/sample-report.pdf"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15"
                  >
                    {t.seeSampleReport}
                  </a>
                </div>
              </div>

              <GlassCard className="p-5">
                <div className="rounded-[24px] border border-white/10 bg-[#071022] p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                        {t.directPurchase}
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold">{t.buyOnline}</h3>
                    </div>
                    <Mail className="h-5 w-5 text-cyan-200" />
                  </div>

                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
                    <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">
                      {t.launchOffer}
                    </div>
                    <div className="mt-2 text-4xl font-semibold text-white">€190 + VAT</div>
                    <div className="mt-3 text-sm leading-7 text-slate-300">
                      {copy[locale].launchText}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 text-sm text-slate-300">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      Enter your company details before payment
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      Continue to secure Stripe checkout
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      Start your first HumanSurface assessment
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link
                      href="/buy"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 shadow-[0_0_36px_rgba(34,211,238,0.20)] transition hover:-translate-y-0.5 hover:bg-cyan-200"
                    >
                      {t.getAssessment} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#040816]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-3 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 shadow-[0_0_30px_rgba(34,211,238,0.16)]">
                <span className="text-lg font-semibold text-cyan-300">H</span>
              </div>
              <div className="text-lg font-semibold">HumanSurface</div>
            </div>
            <p className="mt-4 max-w-md leading-7 text-slate-400">{t.footerText}</p>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
              {t.company}
            </div>
            <div className="mt-4 space-y-3 text-slate-400">
              <Link href="/privacy" className="block hover:text-cyan-200">
                {t.privacy}
              </Link>
              <Link href="/terms" className="block hover:text-cyan-200">
                {t.terms}
              </Link>
              <a href="mailto:info@humansurface.com" className="block hover:text-cyan-200">
                {t.contact}
              </a>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
              {t.resources}
            </div>
            <div className="mt-4 space-y-3 text-slate-400">
              <a href="/sample-report.pdf" className="block hover:text-cyan-200">
                {t.sampleReport}
              </a>
              <a href="#dashboard-preview" className="block hover:text-cyan-200">
                {t.dashboardPreview}
              </a>
              <Link href="/buy" className="block hover:text-cyan-200">
                {t.buyAssessment}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
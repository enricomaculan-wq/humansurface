'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  type LucideIcon,
  Shield,
  ShieldCheck,
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
import LanguageToggle from '@/app/components/language-toggle'
import { useI18n } from '@/app/components/i18n-provider'
import type { Locale } from '@/lib/i18n/config'

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
  brandTagline: string

  heroBadge: string
  heroTitle: string
  heroText: string
  chip1: string
  chip2: string
  chip3: string

  trustSignals: Array<{
    title: string
    text: string
  }>
  preview: {
    impersonation: string
    financeFraud: string
    hrSocial: string
    highShort: string
    mediumShort: string
    highRisk: string
    publicEmails: string
    executiveVisibility: string
    predictableEmailPattern: string
    newPublicEmails: string
    hrContactDiscovered: string
    scoreMoved: string
    paymentFraud: string
    executiveImpersonation: string
    fakeCandidatePhishing: string
    lastScan: string
    domain: string
    overall: string
    riskLevel: string
    score: string
    criticalFindings: string
    updatedNow: string
    predictableNamingFinding: string
    financeRoleFinding: string
    publicHrFinding: string
    reduceEmails: string
    paymentVerification: string
    reviewLeadership: string
    trainHrFinance: string
    mainScenario: string
    riskScore: string
    newExecutiveProfile: string
    financeFraudUnchanged: string
    reportFindingExecutive: string
    reportFindingEmails: string
    reportFindingHr: string
    reportRemediationEmails: string
    reportRemediationPayment: string
    reportRemediationTraining: string
  }

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
  stepLabel: string
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
  buyFlow: string
  simpleAndFast: string
  launchCustomers: string
  requestSteps: string[]

  finalEyebrow: string
  finalTitle: string
  finalText: string
  launchPrice: string
  securePayment: string
  assessmentFirst: string
  introCallLabel: string
  buyOnline: string

  footerText: string
}

type PricingPlan = {
  name: string
  price: string
  priceSuffix: string
  description: string
  href: string
  cta: string
  items: string[]
  featured?: boolean
}

type PricingPlansCopy = {
  note: string
  plans: PricingPlan[]
}

const copy: Record<Locale, Translation> = {
  en: {
    navHow: 'How it works',
    navSample: 'Example report',
    navDashboard: 'Dashboard',
    navPricing: 'Pricing',
    login: 'Login',
    getAssessment: 'Request preliminary review',
    seeSampleReport: 'View example report',
    company: 'Company',
    resources: 'Resources',
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact',
    sampleReport: 'Example report',
    dashboardPreview: 'Dashboard preview',
    buyAssessment: 'Request assessment',
    brandTagline: 'Human attack surface visibility',

    heroBadge: 'Reviewed public-exposure assessment for phishing and fraud risk',
    heroTitle:
      'Find the public people, role, and contact exposure attackers can use to make fraud feel believable',
    heroText:
      'HumanSurface reviews your company’s public footprint, maps exposed roles and contact paths, and turns them into executive-ready findings and remediation priorities.',
    chip1: 'No credentials or internal access required',
    chip2: 'Manual review before delivery',
    chip3: 'Built for SMEs, professional firms, and visible teams',

    trustSignals: [
      {
        title: 'Clear scope before activation',
        text: 'The intro call confirms company, domain, priorities, and whether the reviewed assessment is the right fit.',
      },
      {
        title: 'Public-source methodology',
        text: 'We focus on externally visible people, roles, contact paths, business context, and fraud-enabling signals.',
      },
      {
        title: 'No internal access needed',
        text: 'The launch assessment does not require credentials, agents, inbox access, or invasive setup.',
      },
      {
        title: 'Decision-ready deliverable',
        text: 'You receive scored findings, exposed roles, likely attack scenarios, and practical remediation priorities.',
      },
    ],
    preview: {
      impersonation: 'Impersonation',
      financeFraud: 'Finance fraud',
      hrSocial: 'HR / Social',
      highShort: 'HIGH',
      mediumShort: 'MED',
      highRisk: 'High Risk',
      publicEmails: 'Public email addresses found on company pages',
      executiveVisibility: 'Executive visibility exposed',
      predictableEmailPattern: 'Predictable email naming pattern detected',
      newPublicEmails: '+2 public email addresses detected',
      hrContactDiscovered: '+1 HR contact page discovered',
      scoreMoved: 'Overall score moved from 64 to 72',
      paymentFraud: 'Payment fraud',
      executiveImpersonation: 'Executive impersonation',
      fakeCandidatePhishing: 'Fake candidate phishing',
      lastScan: 'last scan',
      domain: 'domain',
      overall: 'Overall',
      riskLevel: 'Risk level',
      score: 'score',
      criticalFindings: 'Critical findings',
      updatedNow: 'updated now',
      predictableNamingFinding:
        'Predictable naming pattern supports address enumeration',
      financeRoleFinding:
        'Finance role visibility increases urgent-payment fraud risk',
      publicHrFinding: 'Public HR contact page discovered',
      reduceEmails: 'Reduce public exposure of direct finance and HR email addresses',
      paymentVerification:
        'Introduce payment verification controls for urgent requests',
      reviewLeadership: 'Review leadership pages and public role descriptions',
      trainHrFinance: 'Train HR and finance on impersonation scenarios',
      mainScenario: 'Main scenario',
      riskScore: 'risk score',
      newExecutiveProfile: '+1 executive profile indexed',
      financeFraudUnchanged: 'Finance fraud risk unchanged',
      reportFindingExecutive: 'Executive visibility increases impersonation risk',
      reportFindingEmails: 'Public email addresses found on company pages',
      reportFindingHr: 'HR contacts publicly exposed',
      reportRemediationEmails: 'Reduce direct public email exposure',
      reportRemediationPayment: 'Introduce payment verification procedures',
      reportRemediationTraining: 'Train HR and finance on impersonation scenarios',
    },

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
      'Fraud and impersonation often start with public context, not technical compromise.',
    problemText:
      'Names, roles, emails, team pages, and business details can make a fake request sound real. HumanSurface shows which visible signals create the most usable attack context.',

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
    howTitle: 'A consultation-first path to a reviewed exposure assessment.',
    stepLabel: 'Step',
    step1Title: 'Submit a focused intake',
    step1Text:
      'Share your company domain, work email, role, and the exposure concerns you want reviewed.',
    step2Title: 'Confirm scope on a short call',
    step2Text:
      'We review the intake, respond within 1–2 business days, and align on fit, scope, and priorities.',
    step3Title: 'Receive your assessment',
    step3Text:
      'After activation, you receive reviewed findings, scores, exposed roles, scenarios, and remediation priorities.',

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
      'A reviewed report and dashboard built for security and business decisions.',
    dashboardText:
      'The product experience is designed to make exposure explainable: scored signals, role-level context, likely fraud scenarios, and remediation that a team can actually assign.',
    assessmentOverview: 'Assessment overview',
    peopleAtRisk: 'People at risk',
    exposedPeople: 'Most exposed roles and people',
    delta7: '7-day delta',

    pricingEyebrow: 'Pricing',
    pricingTitle: 'Choose the assessment scope before activation.',
    pricingText:
      'Start with Assessment Base at €190 + VAT, or add a cautious review of available leak/dark web signals with Assessment + Dark Web at €390 + VAT.',
    buyFlow: 'Request flow',
    simpleAndFast: 'Consultation first, assessment after scope is clear',
    launchCustomers: 'Assessment plans available for selected early customers.',
    requestSteps: [
      'Share company details and the reason for the assessment',
      'We review the intake and reply within 1–2 business days',
      'Intro call confirms fit, scope, and activation path',
    ],

    finalEyebrow: 'Request assessment',
    finalTitle: 'Start with a HumanSurface assessment call.',
    finalText:
      'Tell us what prompted the request. We will review the context and arrange a short intro call before activating the assessment.',
    launchPrice: 'Plans: Base €190 + VAT, Dark Web €390 + VAT',
    securePayment: 'Scope confirmed before activation',
    assessmentFirst: 'Reviewed report with remediation priorities',
    introCallLabel: 'Intro call first',
    buyOnline: 'Book a call',

    footerText:
      'HumanSurface helps organizations identify public exposure that can enable phishing, impersonation, and human-targeted fraud.',
  },
  it: {
    navHow: 'Come funziona',
    navSample: 'Esempio report',
    navDashboard: 'Dashboard',
    navPricing: 'Prezzi',
    login: 'Login',
    getAssessment: 'Richiedi verifica preliminare',
    seeSampleReport: 'Vedi esempio report',
    company: 'Azienda',
    resources: 'Risorse',
    privacy: 'Privacy',
    terms: 'Termini',
    contact: 'Contatti',
    sampleReport: 'Esempio report',
    dashboardPreview: 'Anteprima dashboard',
    buyAssessment: 'Richiedi assessment',
    brandTagline: 'Visibilità della superficie d’attacco umana',

    heroBadge: 'Assessment revisionato dell’esposizione pubblica per phishing e frodi',
    heroTitle:
      'Trova esposizioni pubbliche di persone, ruoli e contatti che possono rendere credibile una frode',
    heroText:
      'HumanSurface rivede la presenza pubblica della tua azienda, mappa ruoli e canali di contatto esposti e li trasforma in finding executive-ready e priorità di remediation.',
    chip1: 'Nessuna credenziale o accesso interno richiesto',
    chip2: 'Revisione manuale prima della consegna',
    chip3: 'Pensato per PMI, studi professionali e team visibili',

    trustSignals: [
      {
        title: 'Scope chiaro prima dell’attivazione',
        text: 'La call introduttiva conferma azienda, dominio, priorità e se l’assessment revisionato è adatto al caso.',
      },
      {
        title: 'Metodologia su fonti pubbliche',
        text: 'Ci concentriamo su persone, ruoli, canali di contatto, contesto aziendale e segnali che possono abilitare frodi.',
      },
      {
        title: 'Nessun accesso interno richiesto',
        text: 'L’assessment lancio non richiede credenziali, agent, accesso alle inbox o configurazioni invasive.',
      },
      {
        title: 'Deliverable pronto per decidere',
        text: 'Ricevi finding con score, ruoli esposti, scenari di attacco probabili e priorità di remediation pratiche.',
      },
    ],
    preview: {
      impersonation: 'Impersonificazione',
      financeFraud: 'Frodi finance',
      hrSocial: 'HR / Social',
      highShort: 'ALTO',
      mediumShort: 'MED',
      highRisk: 'Rischio alto',
      publicEmails: 'Email pubbliche trovate sulle pagine aziendali',
      executiveVisibility: 'Visibilità executive esposta',
      predictableEmailPattern: 'Pattern email prevedibile rilevato',
      newPublicEmails: '+2 email pubbliche rilevate',
      hrContactDiscovered: '+1 pagina contatti HR scoperta',
      scoreMoved: 'Score complessivo passato da 64 a 72',
      paymentFraud: 'Frode nei pagamenti',
      executiveImpersonation: 'Impersonificazione executive',
      fakeCandidatePhishing: 'Phishing con falso candidato',
      lastScan: 'ultima scansione',
      domain: 'dominio',
      overall: 'Complessivo',
      riskLevel: 'Livello rischio',
      score: 'score',
      criticalFindings: 'Finding critici',
      updatedNow: 'aggiornato ora',
      predictableNamingFinding:
        'Pattern di naming prevedibile supporta enumerazione indirizzi',
      financeRoleFinding:
        'Visibilità ruoli finance aumenta il rischio di frodi urgenti',
      publicHrFinding: 'Pagina contatti HR pubblica scoperta',
      reduceEmails: 'Ridurre l’esposizione pubblica di email finance e HR dirette',
      paymentVerification:
        'Introdurre controlli di verifica per richieste di pagamento urgenti',
      reviewLeadership: 'Rivedere pagine leadership e descrizioni pubbliche dei ruoli',
      trainHrFinance: 'Formare HR e finance su scenari di impersonificazione',
      mainScenario: 'Scenario principale',
      riskScore: 'score rischio',
      newExecutiveProfile: '+1 profilo executive indicizzato',
      financeFraudUnchanged: 'Rischio frodi finance invariato',
      reportFindingExecutive: 'Visibilità executive aumenta il rischio di impersonificazione',
      reportFindingEmails: 'Email pubbliche trovate sulle pagine aziendali',
      reportFindingHr: 'Contatti HR pubblicamente esposti',
      reportRemediationEmails: 'Ridurre l’esposizione di email pubbliche dirette',
      reportRemediationPayment: 'Introdurre procedure di verifica dei pagamenti',
      reportRemediationTraining: 'Formare HR e finance su scenari di impersonificazione',
    },

    liveSnapshot: 'Snapshot assessment',
    highExposure: 'Esposizione alta',
    humanSurfaceScore: 'HumanSurface Score',
    topFindings: 'Principali finding',
    criticalSignals: '5 segnali critici',
    changed7: 'Delta ultimi 7 giorni',
    orgMapped: 'Visibilità organizzativa mappata',
    roleModeled: 'Esposizione ruoli modellata',
    scenariosGenerated: 'Scenari di frode generati',

    ribbon1: 'Visibilità del rischio umano',
    ribbon2: 'Report pronti per il management',
    ribbon3: 'Focalizzato su phishing e frodi',
    ribbon4: 'Creato per assessment pratici',

    problemEyebrow: 'Il problema',
    problemTitle:
      'Frodi e impersonificazione spesso partono dal contesto pubblico, non da una compromissione tecnica.',
    problemText:
      'Nomi, ruoli, email, pagine team e dettagli aziendali possono far sembrare reale una richiesta falsa. HumanSurface mostra quali segnali visibili creano il contesto più sfruttabile.',

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
    howTitle: 'Un percorso consultation-first verso un assessment revisionato.',
    stepLabel: 'Fase',
    step1Title: 'Invia un intake mirato',
    step1Text:
      'Condividi dominio aziendale, email di lavoro, ruolo e le priorità di esposizione da rivedere.',
    step2Title: 'Conferma lo scope in una breve call',
    step2Text:
      'Rivediamo l’intake, rispondiamo entro 1-2 giorni lavorativi e allineiamo aderenza, scope e priorità.',
    step3Title: 'Ricevi il tuo assessment',
    step3Text:
      'Dopo l’attivazione ricevi finding revisionati, score, ruoli esposti, scenari e priorità di remediation.',

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
      'Pensato per le aziende e le organizzazioni in cui le persone possono far parte della superficie d’attacco',

    diffEyebrow: 'Perché è diverso',
    diffTitle:
      'Gli strumenti tradizionali monitorano i sistemi. HumanSurface mostra come gli attaccanti possano colpire la tua azienda attraverso le persone.',
    traditional: 'Visibilità sicurezza tradizionale',
    humansurface: 'HumanSurface',

    dashboardEyebrow: 'Dashboard interna',
    dashboardTitle: 'Un report e una dashboard revisionati per decisioni security e business.',
    dashboardText:
      'L’esperienza prodotto rende l’esposizione spiegabile: segnali con score, contesto per ruolo, scenari di frode probabili e remediation che il team può assegnare.',
    assessmentOverview: 'Panoramica assessment',
    peopleAtRisk: 'Persone a rischio',
    exposedPeople: 'Ruoli e persone più esposti',
    delta7: 'Delta 7 giorni',

    pricingEyebrow: 'Prezzi',
    pricingTitle: 'Scegli lo scope dell’assessment prima dell’attivazione.',
    pricingText:
      'Parti con Assessment Base a €190 + IVA, oppure aggiungi una verifica prudente di segnali leak/dark web disponibili con Assessment + Dark Web a €390 + IVA.',
    buyFlow: 'Flusso richiesta',
    simpleAndFast: 'Prima consulenza, assessment dopo scope chiaro',
    launchCustomers: 'Piani assessment disponibili per una selezione di primi clienti.',
    requestSteps: [
      'Condividi dati aziendali e motivo della richiesta',
      'Rivediamo l’intake e rispondiamo entro 1-2 giorni lavorativi',
      'La call conferma aderenza, scope e percorso di attivazione',
    ],

    finalEyebrow: 'Richiedi assessment',
    finalTitle: 'Inizia con una call assessment HumanSurface.',
    finalText:
      'Raccontaci cosa ha motivato la richiesta. Rivedremo il contesto e organizzeremo una breve call introduttiva prima di attivare l’assessment.',
    launchPrice: 'Piani: Base €190 + IVA, Dark Web €390 + IVA',
    securePayment: 'Scope confermato prima dell’attivazione',
    assessmentFirst: 'Report revisionato con priorità di remediation',
    introCallLabel: 'Prima call introduttiva',
    buyOnline: 'Prenota una call',

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

function SeverityBadge({
  level,
  label,
}: {
  level: 'High' | 'Medium' | 'Low'
  label?: string
}) {
  const styles = {
    High: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200',
    Medium: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100',
    Low: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  }

  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${styles[level]}`}
    >
      {label ?? level}
    </span>
  )
}

function getCompactScoreLabelLines(label: string) {
  if (label === 'Impersonificazione' || label === 'Impersonation') {
    return ['Imperson.']
  }

  if (label === 'Frodi finance') {
    return ['Frodi']
  }

  if (label === 'Finance fraud') {
    return ['Fraud']
  }

  if (label === 'HR / Social') {
    return ['HR/Social']
  }

  return [label]
}

function CompactScoreLabel({
  lines,
  tone = 'dark',
}: {
  lines: string[]
  tone?: 'dark' | 'light'
}) {
  const color = tone === 'light' ? 'text-slate-500' : 'text-slate-400'

  return (
    <div
      className={`flex h-6 flex-col justify-start text-[10px] uppercase leading-4 tracking-[0.12em] ${color} sm:text-[9px] md:text-[10px]`}
    >
      {lines.map((line) => (
        <span key={line} className="whitespace-nowrap">
          {line}
        </span>
      ))}
    </div>
  )
}

function getPricingPlans(locale: Locale): PricingPlansCopy {
  if (locale === 'it') {
    return {
      note:
        'L’attivazione avviene dopo conferma dello scope. Non eseguiamo scansioni invasive e non richiediamo accesso ai sistemi interni.',
      plans: [
        {
          name: 'Assessment Base',
          price: '€190',
          priceSuffix: '+ IVA',
          description:
            'Per capire quali informazioni pubbliche aumentano il rischio di impersonificazione e social engineering.',
          href: '/buy?plan=base',
          cta: 'Richiedi assessment base',
          items: [
            'Esposizione pubblica di persone, ruoli e contatti',
            'Rischio impersonificazione AI-assisted',
            'Superficie pubblica visibile',
            'Priorità operative',
            'Report sintetico + call di conferma scope',
          ],
        },
        {
          name: 'Assessment + Dark Web',
          price: '€390',
          priceSuffix: '+ IVA',
          description:
            'Include il Base e una verifica prudente di segnali leak/dark web collegati all’azienda.',
          href: '/buy?plan=dark-web',
          cta: 'Richiedi assessment con Dark Web',
          items: [
            'Tutto ciò che è incluso nell’Assessment Base',
            'Verifica segnali leak/dark web collegati',
            'Controllo esposizioni credenziali note, quando disponibili',
            'Riferimenti aziendali in fonti OSINT/dark web disponibili',
            'Priorità operative sulle esposizioni critiche',
          ],
          featured: true,
        },
      ],
    }
  }

  return {
    note:
      'Activation happens after scope confirmation. We do not perform invasive scans and do not require access to internal systems.',
    plans: [
      {
        name: 'Base Assessment',
        price: '€190',
        priceSuffix: '+ VAT',
        description:
          'Understand which public information increases impersonation and social engineering risk.',
        href: '/buy?plan=base',
        cta: 'Request base assessment',
        items: [
          'Public exposure of people, roles, and contacts',
          'AI-assisted impersonation risk',
          'Visible public surface',
          'Operational priorities',
          'Synthetic report + scope confirmation call',
        ],
      },
      {
        name: 'Assessment + Dark Web',
        price: '€390',
        priceSuffix: '+ VAT',
        description:
          'Includes Base plus a cautious review of leak/dark web signals connected to the company.',
        href: '/buy?plan=dark-web',
        cta: 'Request Dark Web assessment',
        items: [
          'Everything included in the Base Assessment',
          'Review of leak/dark web signals linked to company domains/emails',
          'Known credential exposure checks, when available',
          'Company references in available OSINT/dark web sources',
          'Operational priorities for critical exposures',
        ],
        featured: true,
      },
    ],
  }
}

function PricingPlans({
  locale,
  compact = false,
}: {
  locale: Locale
  compact?: boolean
}) {
  const pricing = getPricingPlans(locale)

  return (
    <div className={compact ? 'mt-8 max-w-3xl' : ''}>
      <div
        className={`grid auto-rows-fr items-stretch gap-4 ${
          compact ? 'sm:grid-cols-2' : 'lg:grid-cols-2'
        }`}
      >
        {pricing.plans.map((plan) => (
          <GlassCard
            key={plan.name}
            className={`flex h-full min-h-full flex-col ${compact ? 'p-4' : 'p-5'} ${
              plan.featured
                ? 'border-fuchsia-300/20 bg-fuchsia-300/[0.06]'
                : 'border-cyan-300/20 bg-cyan-300/[0.07]'
            }`}
          >
            <div className={compact ? 'min-h-[116px]' : 'min-h-[128px]'}>
              <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-semibold leading-7 text-white`}>
                {plan.name}
              </h3>
              <p className={`${compact ? 'mt-2 text-xs leading-5' : 'mt-3 text-sm leading-6'} text-slate-300`}>
                {plan.description}
              </p>
            </div>

            <div className={`${compact ? 'min-h-[58px]' : 'min-h-[70px]'} flex items-end gap-3`}>
              <div className={compact ? 'text-4xl font-semibold tracking-tight text-white' : 'text-5xl font-semibold tracking-tight text-white'}>
                {plan.price}
              </div>
              <div className="pb-1 text-base text-slate-300">{plan.priceSuffix}</div>
            </div>

            <div className={`${compact ? 'mt-4 min-h-[224px] gap-2 text-xs leading-5' : 'mt-5 min-h-[240px] gap-2 text-sm leading-6'} flex flex-1 flex-col text-slate-200`}>
              {plan.items.map((item) => (
                <div
                  key={item}
                  className={`${compact ? 'rounded-xl px-3 py-2' : 'rounded-2xl px-3 py-2'} border border-white/10 bg-[#030815]/35`}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-auto pt-6">
              <Link
                href={plan.href}
                className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-center text-sm font-semibold transition ${
                  plan.featured
                    ? 'border-fuchsia-400/70 bg-fuchsia-600 text-white shadow-[0_0_28px_rgba(192,38,211,0.18)] hover:bg-fuchsia-500'
                    : 'border-cyan-300/30 bg-cyan-300 text-slate-950 hover:bg-cyan-200'
                }`}
              >
                {plan.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-slate-300">
        {pricing.note}
      </div>
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
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[0.98fr_1.02fr] lg:items-start lg:gap-12 lg:px-8 lg:py-20">
        <motion.div
          className="flex flex-col"
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

          <motion.div variants={fadeUp} className="mt-7 flex flex-col gap-4 sm:flex-row">
            <Link
              id="request-assessment"
              href="/buy?plan=base"
              className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 shadow-[0_0_36px_rgba(34,211,238,0.20)] transition hover:-translate-y-0.5 hover:bg-cyan-200"
            >
              {t.getAssessment} <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/esempio-report"
              className="inline-flex min-w-[210px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-center text-sm font-semibold text-white backdrop-blur transition hover:border-cyan-300/20 hover:bg-cyan-300/10"
            >
              {t.seeSampleReport}
            </Link>
          </motion.div>

          <motion.div variants={fadeUp}>
            <PricingPlans locale={locale} compact />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-3">
            <DataChip>{t.chip1}</DataChip>
            <DataChip>{t.chip2}</DataChip>
            <DataChip>{t.chip3}</DataChip>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex items-start justify-center lg:pt-12"
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

                <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-sm text-slate-400">{t.humanSurfaceScore}</div>
                    <div className="mt-2 text-5xl font-semibold tracking-tight text-white">
                      72<span className="text-2xl text-slate-500">/100</span>
                    </div>
                  </div>

                  <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      {
                        key: t.preview.impersonation,
                        labelLines: getCompactScoreLabelLines(t.preview.impersonation),
                        score: '81',
                        level: t.preview.highShort,
                      },
                      {
                        key: t.preview.financeFraud,
                        labelLines: getCompactScoreLabelLines(t.preview.financeFraud),
                        score: '68',
                        level: t.preview.mediumShort,
                      },
                      {
                        key: t.preview.hrSocial,
                        labelLines: getCompactScoreLabelLines(t.preview.hrSocial),
                        score: '74',
                        level: t.preview.highShort,
                      },
                    ].map(({ key, labelLines, score, level }) => (
                      <div
                        key={key}
                        className="flex min-h-[150px] min-w-0 flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                      >
                        <CompactScoreLabel lines={labelLines} />
                        <div className="mt-3 text-2xl font-semibold leading-none tabular-nums">
                          {score}
                        </div>
                        <div className="mt-2 text-[10px] tracking-[0.2em] text-cyan-200/80">
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
                        t.preview.publicEmails,
                        t.preview.executiveVisibility,
                        t.preview.predictableEmailPattern,
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
                        t.preview.newPublicEmails,
                        t.preview.hrContactDiscovered,
                        t.preview.scoreMoved,
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
      scenario: t.preview.paymentFraud,
      icon: Briefcase,
    },
    {
      name: 'Marco Rossi',
      role: 'CEO',
      score: 81,
      scenario: t.preview.executiveImpersonation,
      icon: Building2,
    },
    {
      name: 'Giulia Verdi',
      role: 'HR Manager',
      score: 76,
      scenario: t.preview.fakeCandidatePhishing,
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
                    {t.preview.lastScan} · 17 Mar 2026 · {t.preview.domain}: rossi-industriali.it
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      {t.preview.overall}
                    </div>
                    <div className="mt-1 text-2xl font-semibold">72</div>
                  </div>
                  <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-3 text-fuchsia-200">
                    <div className="text-[10px] uppercase tracking-[0.18em]">
                      {t.preview.riskLevel}
                    </div>
                    <div className="mt-1 text-2xl font-semibold">{t.highExposure}</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {[
                  {
                    label: t.preview.impersonation,
                    labelLines: getCompactScoreLabelLines(t.preview.impersonation),
                    value: 81,
                    icon: Fingerprint,
                  },
                  {
                    label: t.preview.financeFraud,
                    labelLines: getCompactScoreLabelLines(t.preview.financeFraud),
                    value: 68,
                    icon: FileWarning,
                  },
                  {
                    label: t.preview.hrSocial,
                    labelLines: getCompactScoreLabelLines(t.preview.hrSocial),
                    value: 74,
                    icon: Mail,
                  },
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
                          {t.preview.score}
                        </span>
                      </div>
                      <div className="mt-4">
                        <CompactScoreLabel lines={item.labelLines} />
                      </div>
                      <div className="mt-1 text-3xl font-semibold">{item.value}</div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">
                      {t.preview.criticalFindings}
                    </h4>
                    <span className="text-xs text-slate-500">{t.preview.updatedNow}</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      [t.preview.publicEmails, 'High', t.preview.highShort],
                      [
                        t.preview.predictableNamingFinding,
                        'Medium',
                        t.preview.mediumShort,
                      ],
                      [t.preview.financeRoleFinding, 'High', t.preview.highShort],
                      [t.preview.publicHrFinding, 'Medium', t.preview.mediumShort],
                    ].map(([title, level, label]) => (
                      <div
                        key={title}
                        className="rounded-2xl border border-white/8 bg-[#030815] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm text-slate-200">{title}</div>
                          <SeverityBadge
                            level={level as 'High' | 'Medium'}
                            label={label}
                          />
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
                      t.preview.reduceEmails,
                      t.preview.paymentVerification,
                      t.preview.reviewLeadership,
                      t.preview.trainHrFinance,
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
                              {t.preview.mainScenario}: {person.scenario}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                            {t.preview.riskScore}
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
                  t.preview.newPublicEmails,
                  t.preview.newExecutiveProfile,
                  t.preview.financeFraudUnchanged,
                  t.preview.scoreMoved,
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

export default function HumanSurfaceLandingPage() {
  const { locale } = useI18n()

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

  const audiences =
    locale === 'it'
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
          ['MSP e consulenti', 'Un’offerta di assessment chiara e ripetibile per i clienti.'],
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
          ['MSPs and consultants', 'A clear, repeatable assessment offering for client engagements.'],
        ]

  const included =
    locale === 'it'
      ? [
          'Score complessivo HumanSurface',
          'Rischio impersonificazione',
          'Rischio frodi finance',
          'Rischio HR / social engineering',
          'Principali finding critici',
          'Persone e ruoli più esposti',
          'Scenari di attacco',
          'Remediation immediata',
          'Tracciamento cambiamenti a 7 giorni',
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

  const education =
    locale === 'it'
      ? {
          discoverEyebrow: 'Cosa scopriamo',
          discoverTitle:
            'Le informazioni pubbliche che possono aumentare il rischio operativo.',
          discoverText:
            'HumanSurface mette in ordine ciò che è visibile dall’esterno: contatti, ruoli, tecnologie, processi e segnali che possono rendere più credibili phishing, frodi e impersonificazione.',
          discoverItems: [
            [
              'Superficie pubblica esposta',
              'Pagine, documenti, profili, form e riferimenti aziendali accessibili senza autenticazione.',
              Radar,
            ],
            [
              'Email e ruoli visibili',
              'Contatti diretti, pattern email prevedibili e funzioni aziendali riconoscibili.',
              Mail,
            ],
            [
              'Tecnologie e segnali esterni',
              'Tecnologie dichiarate o deducibili, più segnali di leak o esposizione quando disponibili.',
              Fingerprint,
            ],
            [
              'Informazioni su figure chiave',
              'Dettagli pubblici su responsabilità, fornitori, processi e comunicazioni potenzialmente abusabili.',
              Users,
            ],
          ] satisfies Array<[string, string, LucideIcon]>,
          usefulEyebrow: 'Perché è utile',
          usefulTitle:
            'Aiuta a distinguere ciò che serve al business da ciò che crea rischio.',
          usefulText:
            'Non si tratta di sparire dal web. L’obiettivo è capire quali informazioni pubbliche sono necessarie e quali, combinate tra loro, possono facilitare social engineering o richieste fraudolente.',
          usefulItems: [
            'Prioritizzare le esposizioni che rendono più credibili richieste false.',
            'Ridurre il contesto disponibile per phishing mirato e frodi operative.',
            'Dare a management, security e operations una lista chiara di azioni.',
          ],
          methodEyebrow: 'Come funziona',
          methodTitle:
            'Un assessment basato su dati pubblici, review umana e priorità operative.',
          methodSteps: [
            [
              'Analisi esterna',
              'Raccogliamo segnali pubblici e OSINT pertinenti al dominio e alla presenza aziendale.',
            ],
            [
              'Interpretazione del rischio',
              'Colleghiamo persone, ruoli, contatti e processi a scenari realistici di abuso.',
            ],
            [
              'Report e remediation',
              'Consegnamo score, finding revisionati e azioni pratiche ordinate per priorità.',
            ],
          ],
          aiEyebrow: 'Il rischio impersonificazione nell’era dell’IA',
          aiTitle:
            'L’IA generativa rende più semplice trasformare contesto pubblico in messaggi credibili.',
          aiText:
            'Con l’intelligenza artificiale generativa, informazioni pubbliche apparentemente innocue possono essere trasformate in messaggi credibili, phishing mirato o tentativi di impersonificazione verso figure chiave dell’azienda. HumanSurface aiuta a capire quali informazioni sono visibili dall’esterno e quali possono aumentare il rischio operativo.',
          aiSignals: [
            'Ruoli, responsabilità e relazioni aziendali utili a costruire pretesti plausibili.',
            'Email, fornitori, documenti e processi che possono rendere credibile una richiesta.',
            'Contesto pubblico combinabile in messaggi personalizzati contro finance, HR, executive e operations.',
          ],
          assuranceEyebrow:
            'Non invasivo e orientato alla riduzione del rischio',
          assuranceTitle:
            'Ridurre il rischio prima che venga sfruttato, senza accedere ai sistemi interni.',
          assuranceItems: [
            'Analisi da fonti pubbliche e segnali OSINT.',
            'Nessuna scansione invasiva senza autorizzazione.',
            'Nessuna credenziale o accesso ai sistemi interni richiesto.',
            'Nessun dato sensibile pubblicato nei materiali dimostrativi.',
          ],
          exampleLink: 'Apri esempio report',
          methodLink: 'Leggi il metodo',
          cta: 'Richiedi una verifica preliminare',
        }
      : {
          discoverEyebrow: 'What we uncover',
          discoverTitle:
            'The public information that can increase operational risk.',
          discoverText:
            'HumanSurface organizes what is visible from the outside: contacts, roles, technologies, processes, and signals that can make phishing, fraud, and impersonation more credible.',
          discoverItems: [
            [
              'Exposed public surface',
              'Pages, documents, profiles, forms, and company references reachable without authentication.',
              Radar,
            ],
            [
              'Visible emails and roles',
              'Direct contacts, predictable email patterns, and recognizable business functions.',
              Mail,
            ],
            [
              'Technologies and external signals',
              'Declared or inferable technologies, plus leak or exposure signals when available.',
              Fingerprint,
            ],
            [
              'Key-role information',
              'Public details about responsibilities, suppliers, processes, and communications that may be abused.',
              Users,
            ],
          ] satisfies Array<[string, string, LucideIcon]>,
          usefulEyebrow: 'Why it matters',
          usefulTitle:
            'It separates business-useful visibility from risk-increasing exposure.',
          usefulText:
            'The goal is not to disappear from the web. The goal is to understand which public information is useful to the business and which combinations can support social engineering or fraudulent requests.',
          usefulItems: [
            'Prioritize exposures that make false requests more believable.',
            'Reduce the context available for targeted phishing and operational fraud.',
            'Give management, security, and operations a clear action list.',
          ],
          methodEyebrow: 'How it works',
          methodTitle:
            'An assessment based on public data, human review, and operational priorities.',
          methodSteps: [
            [
              'External analysis',
              'We collect relevant public and OSINT signals around the domain and company footprint.',
            ],
            [
              'Risk interpretation',
              'We connect people, roles, contacts, and processes to realistic abuse scenarios.',
            ],
            [
              'Report and remediation',
              'We deliver scores, reviewed findings, and practical actions ordered by priority.',
            ],
          ],
          aiEyebrow: 'Impersonation risk in the AI era',
          aiTitle:
            'Generative AI makes it easier to turn public context into credible messages.',
          aiText:
            'With generative AI, seemingly harmless public information can be transformed into credible messages, targeted phishing, or impersonation attempts against key company figures. HumanSurface helps clarify which information is visible from the outside and which signals can increase operational risk.',
          aiSignals: [
            'Roles, responsibilities, and company relationships that help build plausible pretexts.',
            'Emails, suppliers, documents, and processes that can make a request feel legitimate.',
            'Public context that can be combined into personalized messages against finance, HR, executives, and operations.',
          ],
          assuranceEyebrow: 'Non-invasive and risk-reduction oriented',
          assuranceTitle:
            'Reduce risk before it is exploited, without internal system access.',
          assuranceItems: [
            'Analysis from public sources and OSINT signals.',
            'No invasive scanning without authorization.',
            'No credentials or internal system access required.',
            'No sensitive data published in demo materials.',
          ],
          exampleLink: 'Open example report',
          methodLink: 'Read the method',
          cta: 'Request a preliminary review',
        }

  const darkWebEducation =
    locale === 'it'
      ? {
          eyebrow: 'Verifica Dark Web',
          title: 'Cosa include la verifica Dark Web',
          text:
            'La verifica Dark Web non promette di trovare ogni dato esposto. Cerca segnali e indicatori collegati a dominio, email aziendali e riferimenti pubblici, usando fonti disponibili e dati già esposti. L’obiettivo è capire se esistono elementi che aumentano il rischio di accessi non autorizzati, impersonificazione, frodi o social engineering.',
          includeTitle: 'Cosa cerchiamo',
          includeItems: [
            'Email aziendali presenti in leak noti o fonti disponibili',
            'Possibili credenziali o riferimenti da verificare',
            'Domini, brand o riferimenti aziendali citati in contesti a rischio',
            'Priorità operative per ridurre esposizione e abuso',
          ],
          notTitle: 'Cosa non facciamo',
          notItems: [
            'Non promettiamo copertura completa del dark web',
            'Non acquistiamo dati rubati',
            'Non richiediamo accesso ai sistemi interni',
            'Non pubblichiamo dati sensibili nel report',
          ],
        }
      : {
          eyebrow: 'Dark Web Review',
          title: 'What the Dark Web review includes',
          text:
            'The Dark Web review does not promise to find every exposed data point. It looks for signals and indicators linked to domains, company emails, and public references, using available sources and already exposed data. The goal is to understand whether there are elements that increase the risk of unauthorized access, impersonation, fraud, or social engineering.',
          includeTitle: 'What we look for',
          includeItems: [
            'Company emails appearing in known leaks or available sources',
            'Possible credentials or references to verify',
            'Domains, brand names, or company references mentioned in risky contexts',
            'Operational priorities to reduce exposure and abuse',
          ],
          notTitle: 'What we do not do',
          notItems: [
            'We do not promise complete dark web coverage',
            'We do not buy stolen data',
            'We do not require internal system access',
            'We do not publish sensitive data in the report',
          ],
        }

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
                {t.brandTagline}
              </div>
              <div className="text-lg font-semibold tracking-tight">HumanSurface</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 lg:flex">
            <a href="#how-it-works" className="transition hover:text-cyan-200">
              {t.navHow}
            </a>
            <Link href="/esempio-report" className="transition hover:text-cyan-200">
              {t.navSample}
            </Link>
            <Link href="/metodo" className="transition hover:text-cyan-200">
              {locale === 'it' ? 'Metodo' : 'Method'}
            </Link>
            <a href="#dashboard-preview" className="transition hover:text-cyan-200">
              {t.navDashboard}
            </a>
            <a href="#pricing" className="transition hover:text-cyan-200">
              {t.navPricing}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageToggle />

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
        <LandingHero t={t} locale={locale} />

        <section className="border-y border-cyan-300/10 bg-[#061024]/70 backdrop-blur">
          <div className="mx-auto grid max-w-7xl gap-4 px-6 py-6 text-center text-sm text-slate-300 md:grid-cols-4 lg:px-8">
            <div>{t.ribbon1}</div>
            <div>{t.ribbon2}</div>
            <div>{t.ribbon3}</div>
            <div>{t.ribbon4}</div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pt-16 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {t.trustSignals.map((item) => (
              <GlassCard key={item.title} className="h-full p-5">
                <div className="text-sm font-semibold text-white">{item.title}</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
              </GlassCard>
            ))}
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
              eyebrow={education.discoverEyebrow}
              title={education.discoverTitle}
              description={education.discoverText}
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {education.discoverItems.map(([title, description, Icon]) => (
                <motion.div key={title} variants={fadeUp}>
                  <GlassCard className="h-full p-6 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.04]">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold leading-7">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {description}
                    </p>
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
              className="grid gap-8 lg:grid-cols-[1fr_1.05fr]"
            >
              <motion.div variants={fadeUp}>
                <SectionTitle
                  eyebrow={darkWebEducation.eyebrow}
                  title={darkWebEducation.title}
                  description={darkWebEducation.text}
                />
              </motion.div>

              <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-2">
                <GlassCard className="border-cyan-300/20 bg-cyan-300/[0.06] p-6">
                  <div className="mb-5 flex items-center gap-3 text-cyan-100">
                    <FileWarning className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">{darkWebEducation.includeTitle}</h3>
                  </div>
                  <div className="grid gap-3">
                    {darkWebEducation.includeItems.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-cyan-200/10 bg-[#030815]/50 px-4 py-3 text-sm leading-7 text-slate-200"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="border-fuchsia-300/20 bg-fuchsia-300/[0.06] p-6">
                  <div className="mb-5 flex items-center gap-3 text-fuchsia-100">
                    <ShieldCheck className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">{darkWebEducation.notTitle}</h3>
                  </div>
                  <div className="grid gap-3">
                    {darkWebEducation.notItems.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-fuchsia-200/10 bg-[#030815]/50 px-4 py-3 text-sm leading-7 text-slate-200"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="bg-white/[0.02]">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={stagger}
            >
              <SectionTitle
                eyebrow={education.usefulEyebrow}
                title={education.usefulTitle}
                description={education.usefulText}
              />

              <motion.div variants={fadeUp} className="mt-8 space-y-3">
                {education.usefulItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={stagger}
              className="lg:pt-2"
            >
              <SectionTitle
                eyebrow={education.methodEyebrow}
                title={education.methodTitle}
              />

              <div className="mt-8 grid gap-4">
                {education.methodSteps.map(([title, description], idx) => (
                  <motion.div key={title} variants={fadeUp}>
                    <GlassCard className="p-5">
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-sm font-semibold text-cyan-200">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{title}</h3>
                          <p className="mt-2 text-sm leading-7 text-slate-300">
                            {description}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
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
            className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
          >
            <motion.div variants={fadeUp}>
              <SectionTitle
                eyebrow={education.aiEyebrow}
                title={education.aiTitle}
                description={education.aiText}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <GlassCard className="border-fuchsia-300/20 bg-fuchsia-300/[0.06] p-6">
                <div className="mb-5 flex items-center gap-3 text-fuchsia-100">
                  <TriangleAlert className="h-5 w-5" />
                  <div className="text-sm font-medium uppercase tracking-[0.16em]">
                    AI-assisted impersonation
                  </div>
                </div>

                <div className="space-y-3">
                  {education.aiSignals.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-fuchsia-200/10 bg-[#030815]/50 px-4 py-3 text-sm leading-7 text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
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
              className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
            >
              <motion.div variants={fadeUp}>
                <SectionTitle
                  eyebrow={education.assuranceEyebrow}
                  title={education.assuranceTitle}
                />

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/buy"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    {education.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/esempio-report"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
                  >
                    {education.exampleLink}
                  </Link>
                  <Link
                    href="/metodo"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
                  >
                    {education.methodLink}
                  </Link>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-2">
                {education.assuranceItems.map((item) => (
                  <GlassCard key={item} className="h-full p-5">
                    <div className="flex gap-3">
                      <Shield className="mt-1 h-5 w-5 shrink-0 text-cyan-200" />
                      <p className="text-sm leading-7 text-slate-200">{item}</p>
                    </div>
                  </GlassCard>
                ))}
              </motion.div>
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
            <SectionTitle
              eyebrow={t.problemEyebrow}
              title={t.problemTitle}
              description={t.problemText}
            />

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {([
                [t.problemCard1Title, t.problemCard1Text, Radar],
                [t.problemCard2Title, t.problemCard2Text, Shield],
                [t.problemCard3Title, t.problemCard3Text, ScanSearch],
              ] satisfies Array<[string, string, LucideIcon]>).map(([title, description, Icon], idx) => {
                return (
                  <motion.div key={title} variants={fadeUp}>
                    <GlassCard className="group h-full p-6 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.04]">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#091226] text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.10)]">
                        <Icon
                          className={`h-5 w-5 ${idx === 1 ? 'text-fuchsia-300' : 'text-cyan-200'}`}
                        />
                      </div>
                      <h3 className="text-xl font-semibold">{title}</h3>
                      <p className="mt-3 leading-7 text-slate-300">{description}</p>
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
                        {t.stepLabel} {step}
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
                      {t.preview.highRisk}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {[
                      {
                        key: t.preview.overall,
                        labelLines: ['Score'],
                        score: '72/100',
                      },
                      {
                        key: t.preview.impersonation,
                        labelLines: ['Imperson.'],
                        score: '81',
                      },
                      {
                        key: t.preview.financeFraud,
                        labelLines: [locale === 'it' ? 'Frodi' : 'Fraud'],
                        score: '68',
                      },
                    ].map(({ key, labelLines, score }) => (
                      <div
                        key={key}
                        className="flex min-h-[108px] min-w-0 flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                      >
                        <CompactScoreLabel lines={labelLines} tone="light" />
                        <div className="mt-auto whitespace-nowrap text-2xl font-semibold leading-none tabular-nums">
                          {score}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <div className="text-sm font-semibold">{t.topFindings}</div>
                    <div className="mt-4 space-y-3 text-sm text-slate-700">
                      <div>• {t.preview.reportFindingExecutive}</div>
                      <div>• {t.preview.reportFindingEmails}</div>
                      <div>• {t.preview.reportFindingHr}</div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-cyan-50 p-5 ring-1 ring-cyan-100">
                    <div className="text-sm font-semibold text-slate-900">
                      {t.immediateRemediation}
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-slate-700">
                      <div>{t.preview.reportRemediationEmails}</div>
                      <div>{t.preview.reportRemediationPayment}</div>
                      <div>{t.preview.reportRemediationTraining}</div>
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

            <motion.div variants={fadeUp} className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <PricingPlans locale={locale} />

              <GlassCard className="p-8">
                <div className="rounded-[24px] border border-white/10 bg-[#071022] p-6">
                  <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                    {t.buyFlow}
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold">{t.simpleAndFast}</h3>

                  <div className="mt-6 space-y-3 text-sm text-slate-300">
                    {t.requestSteps.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-4 text-sm text-fuchsia-100">
                    {t.launchCustomers}
                  </div>

                  <div className="mt-6">
                    <Link
                      href="/buy?plan=base"
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
                    href="/buy?plan=base"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    {locale === 'it' ? 'Richiedi assessment base' : 'Request base assessment'}{' '}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/buy?plan=dark-web"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-fuchsia-300/30 bg-fuchsia-200 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-fuchsia-100"
                  >
                    {locale === 'it'
                      ? 'Richiedi assessment con Dark Web'
                      : 'Request Dark Web assessment'}{' '}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/esempio-report"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15"
                  >
                    {t.seeSampleReport}
                  </Link>
                </div>
              </div>

              <GlassCard className="p-5">
                <div className="rounded-[24px] border border-white/10 bg-[#071022] p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                        {t.introCallLabel}
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold">{t.buyOnline}</h3>
                    </div>
                    <Mail className="h-5 w-5 text-cyan-200" />
                  </div>

                  <div className="grid gap-3">
                    {getPricingPlans(locale).plans.map((plan) => (
                      <Link
                        key={plan.name}
                        href={plan.href}
                        className={`rounded-2xl border p-4 transition ${
                          plan.featured
                            ? 'border-fuchsia-300/20 bg-fuchsia-300/[0.08] hover:bg-fuchsia-300/[0.12]'
                            : 'border-cyan-300/20 bg-cyan-300/[0.08] hover:bg-cyan-300/[0.12]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {plan.name}
                            </div>
                            <div className="mt-1 text-xs leading-5 text-slate-400">
                              {plan.description}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-2xl font-semibold text-white">
                              {plan.price}
                            </div>
                            <div className="text-xs text-slate-400">
                              {plan.priceSuffix}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3 text-sm text-slate-300">
                    {t.requestSteps.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Link
                      href="/buy?plan=base"
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
              <Link href="/esempio-report" className="block hover:text-cyan-200">
                {t.sampleReport}
              </Link>
              <Link href="/metodo" className="block hover:text-cyan-200">
                {locale === 'it' ? 'Metodo' : 'Method'}
              </Link>
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

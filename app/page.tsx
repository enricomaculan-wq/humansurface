'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
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
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[level]}`}>
      {level}
    </span>
  )
}

function LaunchPricingCard() {
  return (
    <div className="mt-8 max-w-xl rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.08] p-5 shadow-[0_0_40px_rgba(34,211,238,0.10)]">
      <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-cyan-200">
        Launch offer
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="text-5xl font-semibold tracking-tight text-white">€190</div>
        <div className="pb-1 text-lg text-slate-300">+ VAT</div>
        <div className="pb-1 text-sm text-slate-500 line-through">€290 standard</div>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-300">
        One-time HumanSurface Assessment including website scan, external exposure
        analysis, people and role visibility, website/external/combined scoring,
        and executive-ready reporting.
      </p>
    </div>
  )
}

function LandingHero() {
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
        <motion.div
          className="flex flex-col justify-center"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex w-fit items-center rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-200/90 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
          >
            Cyber exposure intelligence for phishing and fraud
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.03]"
          >
            Discover which people, roles, and public information make your company
            vulnerable to phishing, impersonation, and fraud.
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            HumanSurface analyzes your company’s public exposure and shows where
            attackers could target your business through people, key roles, and
            email visibility.
          </motion.p>

          <motion.div variants={fadeUp}>
            <LaunchPricingCard />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
              id="request-assessment"
              href="/buy"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 shadow-[0_0_36px_rgba(34,211,238,0.20)] transition hover:-translate-y-0.5 hover:bg-cyan-200"
              >
              Get assessment <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#sample-report"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-center text-sm font-semibold text-white backdrop-blur transition hover:border-cyan-300/20 hover:bg-cyan-300/10"
            >
              See sample report
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <DataChip>No complex setup</DataChip>
            <DataChip>Secure checkout</DataChip>
            <DataChip>Built for SMEs and professional firms</DataChip>
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
                <div className="flex items-center justify-between border-b border-white/8 pb-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-200/70">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                    Live assessment snapshot
                  </div>
                  <div className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-medium text-fuchsia-200">
                    High exposure
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-sm text-slate-400">HumanSurface Score</div>
                    <div className="mt-2 text-5xl font-semibold tracking-tight text-white">
                      72<span className="text-2xl text-slate-500">/100</span>
                    </div>
                  </div>

                  <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      ['Impersonation Risk', '81', 'HIGH'],
                      ['Finance fraud', '68', 'MED'],
                      ['HR / Social', '74', 'HIGH'],
                    ].map(([label, score, level]) => (
                      <div
                        key={label}
                        className="min-h-[150px] rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                      >
                        <div className="text-[10px] uppercase leading-5 tracking-[0.16em] text-slate-400">
                          {label}
                        </div>
                        <div className="mt-2 text-2xl font-semibold">{score}</div>
                        <div className="mt-1 text-[10px] tracking-[0.2em] text-cyan-200/80">
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
                        Top findings
                      </h3>
                      <span className="text-xs text-slate-500">5 critical signals</span>
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
                            className={`mt-1 h-2.5 w-2.5 rounded-full ${
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
                      What changed in 7 days
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

                <div className="mt-5 grid grid-cols-3 gap-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
                    Org visibility mapped
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
                    Role exposure modeled
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
                    Fraud scenarios generated
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

function InternalDashboardPreview() {
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
        eyebrow="Internal dashboard"
        title="A cyber-tech dashboard that feels like a real platform, not a generic brochure."
        description="This preview extends the same visual language into the actual product: high-signal cards, score-driven layouts, clear findings, and immediate remediation."
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
                    Assessment overview
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
                      Immediate remediation
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
                    People at risk
                  </div>
                  <h3 className="mt-2 text-xl font-semibold">
                    Most exposed roles and people
                  </h3>
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
                    7-day delta
                  </div>
                  <h3 className="mt-2 text-xl font-semibold">What changed</h3>
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

export default function HumanSurfaceLandingPage() {
  const findings = [
    {
      title: 'Public email addresses detected',
      description:
        'Direct contact exposure can increase phishing opportunities and make impersonation attempts more credible.',
      severity: 'High' as const,
      icon: Mail,
    },
    {
      title: 'Predictable email naming pattern',
      description:
        'Attackers may guess additional valid company addresses from visible naming conventions.',
      severity: 'Medium' as const,
      icon: Fingerprint,
    },
    {
      title: 'Executive visibility exposed',
      description:
        'Leadership visibility can support urgent-request fraud and role-based impersonation.',
      severity: 'High' as const,
      icon: Shield,
    },
    {
      title: 'Public HR contacts exposed',
      description:
        'Recruiting-related contacts may attract fake applications, malware delivery, or pretexting.',
      severity: 'Medium' as const,
      icon: Users,
    },
    {
      title: 'Team pages reveal business context',
      description:
        'Public org details can support spear phishing with more believable business context.',
      severity: 'Medium' as const,
      icon: Radar,
    },
    {
      title: 'Finance roles are easy to identify',
      description:
        'Visible finance contacts can raise the likelihood of payment fraud attempts.',
      severity: 'High' as const,
      icon: TriangleAlert,
    },
  ]

  const audiences = [
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

  const included = [
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 shadow-[0_0_30px_rgba(34,211,238,0.16)]">
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(34,211,238,0.15),transparent_68%)]" />
              <span className="relative text-lg font-semibold text-cyan-300">H</span>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/70">
                Human attack surface visibility
              </div>
              <div className="text-lg font-semibold tracking-tight">HumanSurface</div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#how-it-works" className="transition hover:text-cyan-200">
              How it works
            </a>
            <a href="#sample-report" className="transition hover:text-cyan-200">
              Sample report
            </a>
            <a href="#dashboard-preview" className="transition hover:text-cyan-200">
              Dashboard
            </a>
            <a href="#pricing" className="transition hover:text-cyan-200">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              Login
            </a>

            <a
              href="/buy"
              className="rounded-2xl border border-cyan-300/30 bg-cyan-300/90 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.20)] transition hover:-translate-y-0.5 hover:bg-cyan-200"
            >
              Get assessment
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <LandingHero />

        <section className="border-y border-cyan-300/10 bg-[#061024]/70 backdrop-blur">
          <div className="mx-auto grid max-w-7xl gap-4 px-6 py-6 text-center text-sm text-slate-300 md:grid-cols-4 lg:px-8">
            <div>Human-centered risk visibility</div>
            <div>Executive-ready reporting</div>
            <div>Focused on phishing and fraud exposure</div>
            <div>Built for practical security assessments</div>
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
              eyebrow="The problem"
              title="Most attacks do not start with infrastructure. They start with people."
              description="Many companies protect systems and email, but still expose public information that helps attackers run phishing, impersonation, and fraud attempts with higher credibility."
            />

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                [
                  'Public exposure',
                  'Public emails, names, roles, and pages can increase your attack surface.',
                  Radar,
                ],
                [
                  'Impersonation risk',
                  'Visible business context makes fake internal requests more believable.',
                  Shield,
                ],
                [
                  'Actionable remediation',
                  'Clear findings and immediate next steps, not generic security reporting.',
                  ScanSearch,
                ],
              ].map(([title, description, Icon], idx) => {
                const Comp = Icon as any
                return (
                  <motion.div key={title as string} variants={fadeUp}>
                    <GlassCard className="group p-6 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.04]">
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
              <SectionTitle
                eyebrow="How it works"
                title="From company domain to action plan in a few simple steps."
              />

              <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {[
                  [
                    '01',
                    'Enter your company details',
                    'Company name, domain, business email, and any optional context.',
                  ],
                  [
                    '02',
                    'Continue to secure payment',
                    'Purchase the assessment online with secure Stripe checkout.',
                  ],
                  [
                    '03',
                    'Receive your assessment',
                    'Get findings, scores, exposed roles, and immediate remediation priorities.',
                  ],
                ].map(([step, title, description]) => (
                  <motion.div key={step} variants={fadeUp}>
                    <GlassCard className="relative p-6">
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
                eyebrow="What you get"
                title="Not just data. Clear priorities."
                description="A HumanSurface assessment gives you an executive-ready view of how publicly exposed your organization is and how that exposure can be used against you."
              />
              <div className="mt-8 space-y-4">
                {included.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-slate-200">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.16)]">
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
                        Executive assessment
                      </div>
                      <div className="mt-2 text-2xl font-semibold">HumanSurface Report</div>
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
                    <div className="text-sm font-semibold">Top findings</div>
                    <div className="mt-4 space-y-3 text-sm text-slate-700">
                      <div>• Executive visibility increases impersonation risk</div>
                      <div>• Public email addresses found on company pages</div>
                      <div>• HR contacts publicly exposed</div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-cyan-50 p-5 ring-1 ring-cyan-100">
                    <div className="text-sm font-semibold text-slate-900">
                      Immediate remediation
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
              <SectionTitle
                eyebrow="Example findings"
                title="Examples of what HumanSurface can reveal"
              />
              <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {findings.map((finding) => {
                  const Icon = finding.icon
                  return (
                    <motion.div key={finding.title} variants={fadeUp}>
                      <GlassCard className="p-6 transition hover:border-cyan-300/20 hover:shadow-[0_0_30px_rgba(34,211,238,0.08)]">
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
            <SectionTitle
              eyebrow="Who it’s for"
              title="Built for organizations where people are part of the attack surface"
            />
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {audiences.map(([title, description], idx) => (
                <motion.div key={title} variants={fadeUp}>
                  <GlassCard className="p-6">
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
              <SectionTitle
                eyebrow="Why it’s different"
                title="Traditional tools monitor systems. HumanSurface shows how attackers can target your company through people."
              />
              <div className="mt-12 grid gap-6 lg:grid-cols-2">
                <motion.div variants={fadeUp}>
                  <GlassCard className="p-8">
                    <h3 className="text-2xl font-semibold text-slate-200">
                      Traditional security visibility
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
                    <h3 className="text-2xl font-semibold text-white">HumanSurface</h3>
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
          <InternalDashboardPreview />
        </div>

        <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            <SectionTitle
              eyebrow="Pricing"
              title="Start with a one-time assessment."
              description="Simple launch pricing, direct online purchase, and secure checkout."
            />

            <motion.div variants={fadeUp} className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <GlassCard className="border-cyan-300/20 bg-cyan-300/[0.08] p-8 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
                <div className="mb-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-cyan-200">
                  Launch offer
                </div>

                <h3 className="text-3xl font-semibold">HumanSurface Assessment</h3>

                <div className="mt-6 flex flex-wrap items-end gap-3">
                  <div className="text-6xl font-semibold tracking-tight text-white">€190</div>
                  <div className="pb-2 text-xl text-slate-300">+ VAT</div>
                  <div className="pb-2 text-base text-slate-500 line-through">€290 standard</div>
                </div>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                  A one-time assessment designed to reveal the public exposure that can
                  increase phishing, impersonation, and fraud risk for your company.
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
                    Acquista assessment <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="#sample-report"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
                  >
                    See sample report
                  </a>
                </div>
              </GlassCard>

              <GlassCard className="p-8">
                <div className="rounded-[24px] border border-white/10 bg-[#071022] p-6">
                  <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                    Buy flow
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold">Simple and fast</h3>

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
                    Launch offer available for the first customers.
                  </div>

                  <div className="mt-6">
                    <Link
                      href="/buy"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 shadow-[0_0_36px_rgba(34,211,238,0.20)] transition hover:-translate-y-0.5 hover:bg-cyan-200"
                    >
                      Acquista assessment <ChevronRight className="h-4 w-4" />
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
                  Buy now
                </div>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                  Start with your first HumanSurface assessment.
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                  Purchase your assessment online, enter your company details, and
                  continue to secure payment.
                </p>

                <div className="mt-8 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    Launch offer: €190 + VAT
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-300 shadow-[0_0_10px_rgba(232,121,249,0.8)]" />
                    Secure payment with Stripe
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    Built for assessment-first sales
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/buy"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    Acquista assessment <ChevronRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="/sample-report.pdf"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15"
                  >
                    See sample report
                  </a>
                </div>
              </div>

              <GlassCard className="p-5">
                <div className="rounded-[24px] border border-white/10 bg-[#071022] p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                        Direct purchase
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold">
                        Buy your assessment online
                      </h3>
                    </div>
                    <Mail className="h-5 w-5 text-cyan-200" />
                  </div>

                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
                    <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">
                      Launch offer
                    </div>
                    <div className="mt-2 text-4xl font-semibold text-white">€190 + VAT</div>
                    <div className="mt-3 text-sm leading-7 text-slate-300">
                      Includes website scan, external exposure analysis, people and
                      role visibility, website/external/combined scoring, and
                      executive-ready reporting.
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
                      Acquista assessment <ArrowRight className="h-4 w-4" />
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
            <p className="mt-4 max-w-md leading-7 text-slate-400">
              HumanSurface helps organizations identify public exposure that can
              enable phishing, impersonation, and human-targeted fraud.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
              Company
            </div>
            <div className="mt-4 space-y-3 text-slate-400">
              <a href="#" className="block hover:text-cyan-200">
                Privacy
              </a>
              <a href="#" className="block hover:text-cyan-200">
                Terms
              </a>
              <a href="mailto:info@humansurface.com" className="block hover:text-cyan-200">
                Contact
              </a>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
              Resources
            </div>
            <div className="mt-4 space-y-3 text-slate-400">
              <a href="/sample-report.pdf" className="block hover:text-cyan-200">
                Sample report
              </a>
              <a href="#dashboard-preview" className="block hover:text-cyan-200">
                Dashboard preview
              </a>
              <Link href="/buy" className="block hover:text-cyan-200">
                Buy assessment
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
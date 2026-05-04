import Link from 'next/link'
import LanguageToggle from '@/app/components/language-toggle'
import { getDictionary } from '@/lib/i18n/server'

export default async function AssessmentPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ assessment_id?: string; email?: string }>
}) {
  const dictionary = await getDictionary()
  const t = dictionary.assessmentPending
  const params = await searchParams
  const assessmentId = params.assessment_id ?? ''
  const email = params.email ?? ''

  const signupHref = email
    ? `/signup?email=${encodeURIComponent(email)}`
    : '/signup'

  return (
    <main className="hs-light min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 hidden justify-end md:flex">
          <LanguageToggle />
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            {t.eyebrow}
          </div>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            {t.title}
          </h1>

          <p className="mt-4 text-lg leading-8 text-slate-300">
            {t.intro}
          </p>

          <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
            <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">
              {t.deliveryTitle}
            </div>
            <div className="mt-2 text-sm leading-7 text-slate-200">
              {t.deliveryText}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-5">
            <div className="text-sm uppercase tracking-[0.16em] text-fuchsia-200">
              {t.nextTitle}
            </div>
            <div className="mt-2 space-y-2 text-sm leading-7 text-slate-200">
              {t.nextItems.map((item) => (
                <div key={item}>• {item}</div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-sm uppercase tracking-[0.16em] text-slate-400">
              {t.clientAccessTitle}
            </div>
            <div className="mt-2 text-sm leading-7 text-slate-300">
              {t.clientAccessText}
            </div>
            {email ? (
              <div className="mt-3 text-sm text-cyan-200">{email}</div>
            ) : null}
          </div>

          {assessmentId ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
              {t.referenceLabel}: {assessmentId}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Link
              href={signupHref}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              {dictionary.common.actions.createAccount}
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
            >
              {dictionary.common.actions.login}
            </Link>

            <a
              href="mailto:support@humansurface.com?subject=HumanSurface%20Assessment%20Status"
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

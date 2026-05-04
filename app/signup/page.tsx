import LanguageToggle from '@/app/components/language-toggle'
import { getDictionary } from '@/lib/i18n/server'
import AuthForm from '../login/auth-form'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const dictionary = await getDictionary()
  const t = dictionary.auth
  const params = await searchParams
  const email = params.email ?? ''

  return (
    <main className="hs-light min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-xl">
        <div className="mb-4 hidden justify-end md:flex">
          <LanguageToggle />
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            {t.eyebrow}
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            {t.signupTitle}
          </h1>
          <p className="mt-4 text-slate-400">
            {t.signupDescription}
          </p>
          <div className="mt-8">
            <AuthForm mode="signup" initialEmail={email} />
          </div>
        </div>
      </div>
    </main>
  )
}

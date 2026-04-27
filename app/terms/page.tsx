import LanguageToggle from '@/app/components/language-toggle'
import { getDictionary } from '@/lib/i18n/server'

export default async function TermsPage() {
  const dictionary = await getDictionary()
  const t = dictionary.legal

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <div className="mb-4 hidden justify-end md:flex">
          <LanguageToggle />
        </div>

        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
          {t.eyebrow}
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          {t.termsTitle}
        </h1>

        <div className="mt-8 space-y-8 text-slate-300">
          {t.termsSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <p className="mt-3 leading-7">{section.body}</p>
            </section>
          ))}

          <section>
            <h2 className="text-xl font-semibold text-white">
              8. {t.contactTitle}
            </h2>
            <p className="mt-3 leading-7">
              {t.termsContactIntro}
              <br />
              <a
                href="mailto:info@humansurface.com"
                className="text-cyan-200 underline underline-offset-4"
              >
                info@humansurface.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}

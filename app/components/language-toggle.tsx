'use client'

import { localeLabels, locales, type Locale } from '@/lib/i18n/config'
import { useI18n } from './i18n-provider'

export default function LanguageToggle({
  className = '',
}: {
  className?: string
}) {
  const { locale, setLocale, dictionary } = useI18n()

  return (
    <div
      role="group"
      aria-label={dictionary.common.language}
      className={`hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1 md:flex ${className}`}
    >
      {locales.map((item: Locale) => (
        <button
          key={item}
          type="button"
          aria-pressed={locale === item}
          title={localeLabels[item]}
          onClick={() => setLocale(item)}
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

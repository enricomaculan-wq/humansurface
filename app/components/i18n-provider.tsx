'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  localeCookieMaxAge,
  localeCookieName,
  localeToHtmlLang,
  type Locale,
} from '@/lib/i18n/config'
import { en, type Dictionary } from '@/lib/i18n/dictionaries/en'
import { it } from '@/lib/i18n/dictionaries/it'

const dictionaries: Record<Locale, Dictionary> = {
  en,
  it,
}

type I18nContextValue = {
  locale: Locale
  dictionary: Dictionary
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

function writeLocaleCookie(locale: Locale) {
  document.cookie = [
    `${localeCookieName}=${locale}`,
    'path=/',
    `max-age=${localeCookieMaxAge}`,
    'SameSite=Lax',
  ].join('; ')
}

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: ReactNode
}) {
  const router = useRouter()
  const [locale, setLocaleState] = useState(initialLocale)

  useEffect(() => {
    document.documentElement.lang = localeToHtmlLang(initialLocale)
  }, [initialLocale])

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      writeLocaleCookie(nextLocale)
      document.documentElement.lang = localeToHtmlLang(nextLocale)
      setLocaleState(nextLocale)
      router.refresh()
    },
    [router],
  )

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dictionary: dictionaries[locale],
      setLocale,
    }),
    [locale, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const value = useContext(I18nContext)

  if (!value) {
    throw new Error('useI18n must be used inside I18nProvider.')
  }

  return value
}

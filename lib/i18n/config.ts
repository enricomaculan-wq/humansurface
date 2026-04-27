export const locales = ['en', 'it'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'
export const defaultDateLocale: Locale = 'it'
export const localeCookieName = 'humansurface_locale'
export const localeCookieMaxAge = 60 * 60 * 24 * 365
export const defaultTimeZone = 'Europe/Rome'

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
}

export function isLocale(value: string | null | undefined): value is Locale {
  return locales.includes(value as Locale)
}

export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null

  const normalized = value.trim().toLowerCase()
  if (isLocale(normalized)) return normalized

  const baseLocale = normalized.split('-')[0]
  if (isLocale(baseLocale)) return baseLocale

  return null
}

export function localeToHtmlLang(locale: Locale) {
  return locale
}

export function localeToIntlLocale(locale: Locale) {
  return locale === 'it' ? 'it-IT' : 'en-US'
}

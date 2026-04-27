import { cookies, headers } from 'next/headers'
import {
  defaultLocale,
  localeCookieName,
  normalizeLocale,
  type Locale,
} from '@/lib/i18n/config'
import { en, type Dictionary } from '@/lib/i18n/dictionaries/en'
import { it } from '@/lib/i18n/dictionaries/it'

const dictionaries: Record<Locale, Dictionary> = {
  en,
  it,
}

function getAcceptLanguageLocale(value: string | null): Locale | null {
  if (!value) return null

  const preferredLocales = value
    .split(',')
    .map((entry) => {
      const [localePart, qPart] = entry.trim().split(';q=')
      const quality = qPart ? Number(qPart) : 1

      return {
        locale: normalizeLocale(localePart),
        quality: Number.isFinite(quality) ? quality : 0,
      }
    })
    .filter((entry): entry is { locale: Locale; quality: number } => !!entry.locale)
    .sort((a, b) => b.quality - a.quality)

  return preferredLocales[0]?.locale ?? null
}

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieLocale = normalizeLocale(cookieStore.get(localeCookieName)?.value)

  if (cookieLocale) return cookieLocale

  const headerStore = await headers()
  return getAcceptLanguageLocale(headerStore.get('accept-language')) ?? defaultLocale
}

export function getDictionaryForLocale(locale: Locale) {
  return dictionaries[locale]
}

export async function getDictionary(locale?: Locale) {
  return getDictionaryForLocale(locale ?? (await getRequestLocale()))
}

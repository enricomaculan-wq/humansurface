import {
  defaultDateLocale,
  defaultTimeZone,
  localeToIntlLocale,
  type Locale,
} from '@/lib/i18n/config'

export function formatDateTime(
  value: string | Date,
  locale: Locale = defaultDateLocale,
) {
  return new Date(value).toLocaleString(localeToIntlLocale(locale), {
    timeZone: defaultTimeZone,
    dateStyle: 'short',
    timeStyle: 'medium',
  })
}

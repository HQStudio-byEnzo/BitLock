import { useLang } from '~/composables/useI18n'

/**
 * Locale-aware date formatting shared across dashboard surfaces.
 */
export function useDateFormat() {
  const { locale } = useLang()

  function formatDate(
    value: string | number | Date | undefined | null,
    options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' },
    fallback = '',
  ) {
    if (value === undefined || value === null || value === '') return fallback
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return fallback
    return new Intl.DateTimeFormat(locale.value === 'fr' ? 'fr-FR' : 'en-US', options).format(date)
  }

  return { formatDate }
}

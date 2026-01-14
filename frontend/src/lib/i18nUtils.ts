/**
 * Internationalization utilities for date formatting
 */
import { vi, enUS, type Locale } from 'date-fns/locale'

/**
 * Get date-fns locale based on current locale string
 * @param locale - Current locale ('vi' or 'en')
 * @returns date-fns Locale object
 */
export function getDateFnsLocale(locale: string): Locale {
  return locale === 'vi' ? vi : enUS
}

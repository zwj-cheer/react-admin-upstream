import type { Locale as RuntimeLocale } from '@/core/config/runtimeConfig.schema'

export type Locale = RuntimeLocale

export const LOCALE_STORAGE_KEY = 'react-admin-template.locale:v1'

export function normalizeLocale(value: unknown): Locale | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.toLowerCase()
  if (normalized.startsWith('zh')) {
    return 'zh-CN'
  }
  if (normalized.startsWith('en')) {
    return 'en-US'
  }
  return undefined
}

export function resolveLocale(
  runtimeDefault: Locale | undefined,
  storedValue: unknown,
  browserLanguages: readonly string[],
): Locale {
  const storedLocale = normalizeLocale(storedValue)
  if (storedLocale) {
    return storedLocale
  }

  if (runtimeDefault) {
    return runtimeDefault
  }

  for (const language of browserLanguages) {
    const locale = normalizeLocale(language)
    if (locale) {
      return locale
    }
  }

  return 'zh-CN'
}

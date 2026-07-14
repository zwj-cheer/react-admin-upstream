import { LOCALE_STORAGE_KEY, resolveLocale, type Locale } from '@/core/i18n/localeResolver'
import {
  resolveThemePreference,
  THEME_STORAGE_KEY,
  type ThemeResolution,
} from '@/core/theme/themeResolver'
import type { RuntimeConfig } from '@/core/config/runtimeConfig.schema'

export interface ResolvedPreferences {
  theme: ThemeResolution
  locale: Locale
}

function safeStorageRead(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function resolvePreferences(config: RuntimeConfig): ResolvedPreferences {
  return {
    theme: resolveThemePreference(
      config.defaults.theme,
      safeStorageRead(THEME_STORAGE_KEY),
      window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
    ),
    locale: resolveLocale(
      config.defaults.locale,
      safeStorageRead(LOCALE_STORAGE_KEY),
      navigator.languages,
    ),
  }
}

export function applyPreferences(preferences: ResolvedPreferences): void {
  document.documentElement.classList.toggle('dark', preferences.theme.resolved === 'dark')
  document.documentElement.lang = preferences.locale
  document.documentElement.style.colorScheme = preferences.theme.resolved
}

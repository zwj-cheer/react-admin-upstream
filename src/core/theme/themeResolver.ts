import type { RuntimeConfig } from '@/core/config/runtimeConfig.schema'

export type ThemePreference = RuntimeConfig['defaults']['theme']
export type ResolvedTheme = Exclude<ThemePreference, 'system'>

export const THEME_STORAGE_KEY = 'react-admin-template.theme:v1'

export interface ThemeResolution {
  preference: ThemePreference
  resolved: ResolvedTheme
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function resolveThemePreference(
  runtimeDefault: ThemePreference,
  storedValue: unknown,
  prefersDark: boolean,
): ThemeResolution {
  const preference = isThemePreference(storedValue) ? storedValue : runtimeDefault
  return {
    preference,
    resolved: preference === 'system' ? (prefersDark ? 'dark' : 'light') : preference,
  }
}

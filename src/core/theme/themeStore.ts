import { create } from 'zustand'
import {
  resolveThemePreference,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from './themeResolver'

interface ThemeState {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

let runtimeDefault: ThemePreference = 'system'
let mediaQuery: MediaQueryList | undefined

function safePersist(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // A disabled storage backend must not break the application.
  }
}

function applyResolvedTheme(resolved: ResolvedTheme): void {
  document.documentElement.dataset.theme = resolved
  document.documentElement.style.colorScheme = resolved
}

function calculate(preference: ThemePreference) {
  return resolveThemePreference(
    runtimeDefault,
    preference,
    mediaQuery?.matches ?? window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
  )
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: 'system',
  resolved: 'light',
  setPreference: (preference) => {
    const next = calculate(preference)
    safePersist(preference)
    applyResolvedTheme(next.resolved)
    set(next)
  },
}))

function handleSystemThemeChange(): void {
  const state = useThemeStore.getState()
  if (state.preference !== 'system') {
    return
  }
  const next = calculate('system')
  applyResolvedTheme(next.resolved)
  useThemeStore.setState(next)
}

export function initializeThemeStore(
  defaultPreference: ThemePreference,
  initialPreference: ThemePreference,
): void {
  runtimeDefault = defaultPreference
  mediaQuery?.removeEventListener('change', handleSystemThemeChange)
  mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
  mediaQuery?.addEventListener('change', handleSystemThemeChange)

  const next = calculate(initialPreference)
  applyResolvedTheme(next.resolved)
  useThemeStore.setState(next)
}

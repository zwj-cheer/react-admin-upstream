import { loadRuntimeConfig } from './loadRuntimeConfig'
import { applyPreferences, resolvePreferences } from './resolvePreferences'
import { renderBootstrapError } from './renderBootstrapError'
import { RuntimeConfigError } from '@/core/config/runtimeConfig'
import { initializeI18n } from '@/core/i18n'
import { initializeThemeStore } from '@/core/theme/themeStore'
import { projectTrustedOrigins } from '@/project/trustedOrigins'

async function unregisterTemplateWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return
  }

  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(
    registrations
      .filter((registration) => registration.active?.scriptURL.endsWith('/mockServiceWorker.js'))
      .map((registration) => registration.unregister()),
  )
}

export async function startApplication(): Promise<void> {
  try {
    const config = await loadRuntimeConfig({
      trustedOrigins: projectTrustedOrigins,
    })
    const preferences = resolvePreferences(config)
    applyPreferences(preferences)
    initializeThemeStore(config.defaults.theme, preferences.theme.preference)
    await initializeI18n(preferences.locale)

    if (import.meta.env.DEV && config.mock.enabled) {
      const { startMocking } = await import('@/mocks/browser')
      await startMocking()
    } else if (import.meta.env.PROD) {
      await unregisterTemplateWorker()
    }

    const { renderApplication } = await import('@/app/renderApplication')
    renderApplication(config)
  } catch (error) {
    renderBootstrapError(
      error instanceof RuntimeConfigError ? error : new RuntimeConfigError('invalid-schema'),
    )
  }
}

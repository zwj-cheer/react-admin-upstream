import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enUS from './locales/en-US.json'
import zhCN from './locales/zh-CN.json'
import { LOCALE_STORAGE_KEY, type Locale } from './localeResolver'

let initialized = false

export async function initializeI18n(locale: Locale): Promise<void> {
  if (!initialized) {
    await i18n.use(initReactI18next).init({
      resources: {
        'zh-CN': { translation: zhCN },
        'en-US': { translation: enUS },
      },
      supportedLngs: ['zh-CN', 'en-US'],
      fallbackLng: 'zh-CN',
      lng: locale,
      interpolation: {
        escapeValue: false,
      },
    })
    initialized = true
    return
  }

  await i18n.changeLanguage(locale)
}

export async function setLocale(locale: Locale): Promise<void> {
  document.documentElement.lang = locale
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // A disabled storage backend must not break language switching.
  }
  await initializeI18n(locale)
}

export { i18n }

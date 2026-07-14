import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applyPreferences, resolvePreferences } from './resolvePreferences'
import { developmentRuntimeConfig } from '@/core/config/runtimeConfig'
import { LOCALE_STORAGE_KEY } from '@/core/i18n/localeResolver'
import { THEME_STORAGE_KEY } from '@/core/theme/themeResolver'

describe('resolvePreferences', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
  })

  it('prefers saved user choices over runtime defaults', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    localStorage.setItem(LOCALE_STORAGE_KEY, 'zh-CN')

    const result = resolvePreferences({
      ...developmentRuntimeConfig,
      defaults: { theme: 'dark', locale: 'en-US' },
    })

    expect(result).toEqual({
      theme: { preference: 'light', resolved: 'light' },
      locale: 'zh-CN',
    })
  })

  it('uses browser language when runtime locale is omitted', () => {
    vi.stubGlobal('navigator', { languages: ['en-GB'] })

    const result = resolvePreferences(developmentRuntimeConfig)

    expect(result.locale).toBe('en-US')
  })

  it('applies theme and language before React renders', () => {
    applyPreferences({
      theme: { preference: 'dark', resolved: 'dark' },
      locale: 'en-US',
    })

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.lang).toBe('en-US')
  })
})

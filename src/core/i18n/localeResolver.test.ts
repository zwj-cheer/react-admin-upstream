import { describe, expect, it } from 'vitest'
import { resolveLocale } from './localeResolver'

describe('resolveLocale', () => {
  it('uses the runtime default before browser language', () => {
    expect(resolveLocale('zh-CN', null, ['en-GB'])).toBe('zh-CN')
    expect(resolveLocale('en-US', null, ['zh-Hans-CN'])).toBe('en-US')
  })

  it('normalizes browser variants when no runtime default is configured', () => {
    expect(resolveLocale(undefined, null, ['en-GB'])).toBe('en-US')
    expect(resolveLocale(undefined, null, ['zh-Hans-CN'])).toBe('zh-CN')
  })

  it('falls back to Chinese for unsupported browser languages', () => {
    expect(resolveLocale(undefined, null, ['fr-FR'])).toBe('zh-CN')
  })
})

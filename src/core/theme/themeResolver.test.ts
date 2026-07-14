import { describe, expect, it } from 'vitest'
import { resolveThemePreference } from './themeResolver'

describe('resolveThemePreference', () => {
  it('resolves system preference without replacing the stored choice', () => {
    expect(resolveThemePreference('light', 'system', true)).toEqual({
      preference: 'system',
      resolved: 'dark',
    })
  })
})

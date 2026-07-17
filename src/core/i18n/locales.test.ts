import { describe, expect, it } from 'vitest'
import enUS from './locales/en-US.json'
import zhCN from './locales/zh-CN.json'

describe('locale resources', () => {
  it('keeps language choices as locale-independent autonyms', () => {
    for (const resource of [zhCN, enUS]) {
      expect(resource.settings.languageZhCn).toBe('简体中文')
      expect(resource.settings.languageEnUs).toBe('English')
    }
  })
})

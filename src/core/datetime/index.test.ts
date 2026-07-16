import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initializeI18n, setLocale } from '@/core/i18n'
import {
  INVALID_DATE_PLACEHOLDER,
  formatDate,
  formatDateMinute,
  formatDateTime,
  formatFromNow,
  formatTime,
} from './index'

const SAMPLE = '2026-07-16T09:30:45.000Z'

describe('core/datetime', () => {
  beforeEach(async () => {
    await initializeI18n('zh-CN')
    vi.useFakeTimers()
    vi.setSystemTime(new Date(SAMPLE))
  })

  afterEach(async () => {
    vi.useRealTimers()
    await setLocale('zh-CN')
  })

  it('固定 pattern 在中英文下呈现完全一致的绝对时间风格', async () => {
    await setLocale('zh-CN')
    const zh = formatDateTime(SAMPLE)
    await setLocale('en-US')
    const en = formatDateTime(SAMPLE)
    expect(zh).toBe(en)
    expect(zh).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
  })

  it('各粒度格式化输出对应 pattern', () => {
    expect(formatDate(SAMPLE)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(formatDateMinute(SAMPLE)).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
    expect(formatTime(SAMPLE)).toMatch(/^\d{2}:\d{2}:\d{2}$/)
  })

  it('非法输入返回占位符而非 Invalid Date', () => {
    expect(formatDate('not-a-date')).toBe(INVALID_DATE_PLACEHOLDER)
    expect(formatDateTime(undefined)).toBe(INVALID_DATE_PLACEHOLDER)
    expect(formatFromNow('nope')).toBe(INVALID_DATE_PLACEHOLDER)
  })

  it('相对时间随语言切换输出对应文案', async () => {
    const past = new Date(Date.now() - 3 * 60 * 1000).toISOString()
    await setLocale('zh-CN')
    expect(formatFromNow(past)).toBe('3 分钟前')
    await setLocale('en-US')
    expect(formatFromNow(past)).toBe('3 minutes ago')
  })
})

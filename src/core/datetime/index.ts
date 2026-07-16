import dayjs, { type ConfigType } from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { i18n } from '@/core/i18n'
import type { Locale } from '@/core/i18n/localeResolver'

dayjs.extend(relativeTime)

/**
 * 全项目统一的日期展示格式常量。
 *
 * 绝对时间刻意使用「固定 pattern」而非各语言的本地化格式，
 * 以保证同一项目在中英文下呈现完全一致的日期风格
 * （避免出现某些页面 `2026/07/16`、某些页面 `Jul 16, 2026` 的割裂）。
 * 相对时间（{@link formatFromNow}）才跟随当前语言输出「3 分钟前 / 3 minutes ago」。
 */
export const DATETIME_PATTERN = {
  /** 仅日期：`2026-07-16` */
  date: 'YYYY-MM-DD',
  /** 日期 + 时分：`2026-07-16 09:30` */
  dateMinute: 'YYYY-MM-DD HH:mm',
  /** 日期 + 时分秒：`2026-07-16 09:30:45` */
  dateTime: 'YYYY-MM-DD HH:mm:ss',
  /** 仅时分秒：`09:30:45` */
  time: 'HH:mm:ss',
} as const

/** 值无法解析为合法日期时展示的占位符。 */
export const INVALID_DATE_PLACEHOLDER = '-'

/** 可被格式化的时间入参：ISO 字符串、时间戳、Date 或 Dayjs 对象。 */
export type DateInput = ConfigType

const LOCALE_TO_DAYJS: Record<Locale, string> = {
  'zh-CN': 'zh-cn',
  'en-US': 'en',
}

let appliedDayjsLocale: string | undefined

/**
 * 按当前 i18n 语言惰性同步 dayjs 的全局 locale。
 * 每次格式化前调用，避免依赖事件订阅带来的初始化时序问题；
 * locale 未变化时直接跳过，无额外开销。
 */
function ensureLocale(): void {
  const locale = i18n.language === 'en-US' ? 'en-US' : 'zh-CN'
  const target = LOCALE_TO_DAYJS[locale]
  if (target !== appliedDayjsLocale) {
    dayjs.locale(target)
    appliedDayjsLocale = target
  }
}

/**
 * 解析入参为合法 Dayjs；空值（null/undefined/空串）与非法值一律返回 undefined，
 * 交由调用方渲染占位符——避免 dayjs 对空值默认取「当前时间」而误显示成此刻。
 */
function resolve(value: DateInput): dayjs.Dayjs | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined
  }
  ensureLocale()
  const instance = dayjs(value)
  return instance.isValid() ? instance : undefined
}

function formatWith(value: DateInput, pattern: string): string {
  return resolve(value)?.format(pattern) ?? INVALID_DATE_PLACEHOLDER
}

/** 格式化为 `YYYY-MM-DD`。非法输入返回 {@link INVALID_DATE_PLACEHOLDER}。 */
export function formatDate(value: DateInput): string {
  return formatWith(value, DATETIME_PATTERN.date)
}

/** 格式化为 `YYYY-MM-DD HH:mm`。非法输入返回 {@link INVALID_DATE_PLACEHOLDER}。 */
export function formatDateMinute(value: DateInput): string {
  return formatWith(value, DATETIME_PATTERN.dateMinute)
}

/** 格式化为 `YYYY-MM-DD HH:mm:ss`。非法输入返回 {@link INVALID_DATE_PLACEHOLDER}。 */
export function formatDateTime(value: DateInput): string {
  return formatWith(value, DATETIME_PATTERN.dateTime)
}

/** 格式化为 `HH:mm:ss`。非法输入返回 {@link INVALID_DATE_PLACEHOLDER}。 */
export function formatTime(value: DateInput): string {
  return formatWith(value, DATETIME_PATTERN.time)
}

/**
 * 相对当前时间的人类可读描述，随语言切换：
 * 中文「3 分钟前」/ 英文「3 minutes ago」。非法输入返回 {@link INVALID_DATE_PLACEHOLDER}。
 */
export function formatFromNow(value: DateInput): string {
  return resolve(value)?.fromNow() ?? INVALID_DATE_PLACEHOLDER
}

/** 任意自定义 pattern 的格式化出口，优先使用上面的语义化函数。 */
export function formatDateBy(value: DateInput, pattern: string): string {
  return formatWith(value, pattern)
}

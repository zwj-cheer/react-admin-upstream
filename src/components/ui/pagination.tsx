import { useTranslation } from 'react-i18next'
import { cn } from '@/core/utils'

export interface PaginationProps {
  /** 当前页码，从 1 开始（受控，对齐 antd `current`）。 */
  current: number
  /** 每页条数，仅用于计算总页数，组件不做数据切片。 */
  pageSize: number
  /** 数据总条数。总页数 = ceil(total / pageSize)，最小为 1。 */
  total: number
  /** 页码变化回调。点击页码按钮或上一页/下一页时触发，参数为目标页码。 */
  onChange: (page: number) => void
  /**
   * 是否显示汇总文案（i18n `common.pageInfo`：「第 x / y 页 · 共 n 条」）。
   * 与 antd 的函数式 `showTotal` 不同，本组件只提供布尔开关，文案固定走 i18n。
   * 仅桌面显示；移动端始终以「x / y」摘要代替页码按钮。
   */
  showTotal?: boolean
  /** 禁用整个分页器（所有按钮不可点）。 */
  disabled?: boolean
  /** 附加到容器 nav 的类名。 */
  className?: string
}

/** 省略号折叠（siblingCount=1）：总页数 ≤ 7 时全量展示，否则首尾恒显 + 当前页 ±1。 */
function getPageItems(current: number, pageCount: number): (number | 'gap-l' | 'gap-r')[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }
  const start = Math.max(2, current - 1)
  const end = Math.min(pageCount - 1, current + 1)
  const items: (number | 'gap-l' | 'gap-r')[] = [1]
  if (start > 2) items.push('gap-l')
  for (let page = start; page <= end; page++) items.push(page)
  if (end < pageCount - 1) items.push('gap-r')
  items.push(pageCount)
  return items
}

const pageButton =
  'inline-flex cursor-pointer items-center rounded-md border px-3 py-1.5 text-[13px] font-[inherit] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40'
const pageIdle =
  'border-[var(--border)] bg-[var(--card)] text-[var(--t2)] enabled:hover:border-[var(--gold)] enabled:hover:bg-[var(--gold-light)] enabled:hover:text-[var(--gold)]'
const pageActive = 'border-[var(--gold)] bg-[var(--gold)] text-[var(--primary-foreground)]'

/**
 * 分页器：参数对齐 Ant Design Pagination 常用子集（current/pageSize/total/onChange +
 * showTotal/disabled），视觉对齐原型 `.pg`（居中、gap 8、13px、当前页金底白字）。
 * 纯受控展示组件：不持有页码状态、不切片数据；本地分页还是服务端分页由调用方决定
 * （如高层 Table 的 pagination 配置）。非目标：pageSize 切换、快速跳转输入框。
 * 移动端（<640px）内建降级：隐藏页码按钮，折叠为「上一页 · x / y · 下一页」。
 */
export function Pagination({
  current,
  pageSize,
  total,
  onChange,
  showTotal,
  disabled,
  className,
}: PaginationProps) {
  const { t } = useTranslation()
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  return (
    <nav
      aria-label={t('common.pagination')}
      className={cn('flex items-center justify-center gap-2', className)}
    >
      {showTotal && (
        <span className="text-[13px] text-[var(--t3)] max-sm:hidden">
          {t('common.pageInfo', { page: current, pageCount, total })}
        </span>
      )}
      <button
        className={cn(pageButton, pageIdle)}
        disabled={disabled || current <= 1}
        type="button"
        onClick={() => onChange(current - 1)}
      >
        {t('common.previous')}
      </button>
      {getPageItems(current, pageCount).map((item) =>
        typeof item === 'number' ? (
          <button
            aria-current={item === current ? 'page' : undefined}
            className={cn(pageButton, item === current ? pageActive : pageIdle, 'max-sm:hidden')}
            disabled={disabled}
            key={item}
            type="button"
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ) : (
          <span aria-hidden className="px-1 text-[13px] text-[var(--t3)] max-sm:hidden" key={item}>
            …
          </span>
        ),
      )}
      <span className="text-[13px] text-[var(--t3)] sm:hidden">
        {current} / {pageCount}
      </span>
      <button
        className={cn(pageButton, pageIdle)}
        disabled={disabled || current >= pageCount}
        type="button"
        onClick={() => onChange(current + 1)}
      >
        {t('common.next')}
      </button>
    </nav>
  )
}

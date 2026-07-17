import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/core/utils'

export interface SpinProps {
  /** 是否处于加载中。false 时包裹模式只渲染 children，单独模式渲染 null。 */
  spinning: boolean
  /**
   * 包裹内容。提供时为**包裹模式**：children 上方叠加半透明遮罩
   * （65% `--card` 混透明，同高层 Table 的 loading 层）;
   * 省略时为**单独模式**：行内转圈 + i18n `common.loading` 文案。
   */
  children?: ReactNode
  /** 附加到容器的类名。 */
  className?: string
}

/**
 * 最小转圈原子：1.8px 边框圆环 + animate-spin。
 * 默认配色为灰环金顶（`--border-strong` / `--gold`）；需要随文字颜色自适应时
 * 传 `border-current border-t-transparent` 等类覆盖（如 Button loading）。
 */
export function SpinIndicator({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'size-3.5 shrink-0 animate-spin rounded-full border-[1.8px] border-[var(--border-strong)] border-t-[var(--gold)]',
        className,
      )}
    />
  )
}

/**
 * 加载指示：参数对齐 Ant Design Spin 常用子集（spinning + 包裹/单独两模式）。
 * 非目标：size 档位、delay 防抖、自定义 indicator、tip 文案。
 */
export function Spin({ spinning, children, className }: SpinProps) {
  const { t } = useTranslation()

  if (children === undefined) {
    if (!spinning) return null
    return (
      <span
        className={cn('inline-flex items-center gap-2 text-[13px] text-[var(--t3)]', className)}
      >
        <SpinIndicator />
        {t('common.loading')}
      </span>
    )
  }

  return (
    <div aria-busy={spinning || undefined} className={cn('relative min-w-0', className)}>
      {/* spinning 时内容 inert：遮罩只拦截指针，已聚焦的内部控件仍能收到键盘事件。 */}
      <div inert={spinning || undefined}>{children}</div>
      {spinning && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-[14px] bg-[color-mix(in_srgb,var(--card)_65%,transparent)] text-[13px] text-[var(--t3)]">
          {t('common.loading')}
        </div>
      )}
    </div>
  )
}

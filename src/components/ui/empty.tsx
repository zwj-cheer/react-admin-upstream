import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/core/utils'

export interface EmptyProps {
  /** 空态描述文案，默认 i18n `common.empty`（「暂无数据」）。 */
  description?: ReactNode
  /** 顶部图标/插图（ReactNode），省略时不渲染图标区。与 antd 差异：无内置插图。 */
  icon?: ReactNode
  /** 附加内容（如「新建」按钮），渲染在描述下方。 */
  children?: ReactNode
  /** 附加到容器的类名。 */
  className?: string
}

/**
 * 空态：参数对齐 Ant Design Empty 常用子集（description + 扩展 icon/children），
 * 样式对齐 `.async-state`（220px 最小高、居中、`--t3`）。
 * 非目标：内置插图（PRESENTED_IMAGE_*）、image 自定义。
 */
export function Empty({ description, icon, children, className }: EmptyProps) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'grid min-h-[220px] place-items-center p-8 text-center text-[13px] text-[var(--t3)]',
        className,
      )}
    >
      <div className="grid justify-items-center gap-2.5">
        {icon}
        <div>{description ?? t('common.empty')}</div>
        {children}
      </div>
    </div>
  )
}

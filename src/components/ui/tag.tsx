import type { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Icon } from '@/components/ui/icon'
import { useTranslation } from 'react-i18next'
import { cn } from '@/core/utils'

const tagVariants = cva(
  'inline-flex items-center gap-1.5 self-start whitespace-nowrap text-[11px] font-medium',
  {
    variants: {
      color: {
        default: 'bg-[var(--bg)] text-[var(--t2)]',
        gold: 'bg-[var(--gold-light)] text-[var(--gold)]',
        blue: 'bg-[var(--blue-light)] text-[var(--blue)]',
        green: 'bg-[var(--green-light)] text-[var(--green)]',
        purple: 'bg-[var(--purple-light)] text-[var(--purple)]',
        orange: 'bg-[var(--orange-light)] text-[var(--orange)]',
        red: 'bg-[var(--red-light)] text-[var(--red)]',
      },
      dot: {
        // 普通形态：原型 .tbl-tag——3px×7px 内边距、6px 圆角
        false: 'rounded-md px-[7px] py-[3px]',
        // 呼吸点形态：原型 .ov-bal-tag——4px×12px 内边距、12px 圆角、加粗
        true: 'rounded-xl px-3 py-1 text-xs font-semibold',
      },
    },
    defaultVariants: {
      color: 'default',
      dot: false,
    },
  },
)

export interface TagProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'>, VariantProps<typeof tagVariants> {
  /**
   * 语义色。'default' 灰底；其余对应 `--Xxx-light` 底 + 主色字
   * （gold/blue/green/purple/orange/red）。与 antd 的差异：不支持自定义色值字符串。
   */
  color?: 'default' | 'gold' | 'blue' | 'green' | 'purple' | 'orange' | 'red'
  /**
   * 呼吸点形态（对应原型 `.ov-bal-tag`）：左侧 5px 圆点 + 12px 圆角胶囊。
   * 常用于「运行中 / 启用」类状态展示；`prefers-reduced-motion` 下呼吸动画自动停用。
   */
  dot?: boolean
  /** 左侧图标（ReactNode），与 dot 互斥使用为宜（同时传时都渲染，dot 在前）。 */
  icon?: ReactNode
  /** 是否显示右侧关闭按钮。与 antd 差异：组件不自持可见性，点击仅回调 onClose。 */
  closable?: boolean
  /** 关闭按钮点击回调，配合 closable 使用。 */
  onClose?: () => void
}

/**
 * 标签：参数对齐 Ant Design Tag 常用子集（color/icon/closable/onClose + 扩展 dot），
 * cva 变体实现；视觉对齐原型 `.tbl-tag`（普通）与 `.ov-bal-tag`（呼吸点）。
 * 非目标：自定义色值、可选中 CheckableTag、bordered。
 */
export function Tag({
  color = 'default',
  dot = false,
  icon,
  closable,
  onClose,
  className,
  children,
  ...props
}: TagProps) {
  const { t } = useTranslation()
  return (
    <span className={cn(tagVariants({ color, dot }), className)} {...props}>
      {dot && (
        <span
          aria-hidden
          className="size-[5px] rounded-full bg-current motion-safe:animate-[tag-pulse_2s_ease-in-out_infinite]"
        />
      )}
      {icon}
      {children}
      {closable && (
        <button
          aria-label={t('common.close')}
          className="inline-flex cursor-pointer rounded-full transition-opacity hover:opacity-70"
          type="button"
          onClick={onClose}
        >
          <Icon name="x" size={14} />
        </button>
      )}
    </span>
  )
}

import { useTranslation } from 'react-i18next'
import { cn } from '@/core/utils'

/** 进度条语义色（对齐 tokens.css 主色板；default 走品牌金）。 */
export type ProgressStatus = 'default' | 'success' | 'warning' | 'danger'

export interface ProgressProps {
  /** 当前百分比，0–100；组件内部 clamp 到该区间。 */
  percent: number
  /** 语义色：default 金 / success 绿 / warning 橙 / danger 红。 */
  status?: ProgressStatus
  /** 轨道高度档：'default' 6px、'small' 5px、'large' 12px。 */
  size?: 'default' | 'small' | 'large'
  /**
   * 是否在右侧显示百分比文字（对齐 antd showInfo）。
   * 默认 false——原型进度条多为纯色条无文字。
   */
  showInfo?: boolean
  /** 附加到最外层容器的类名。 */
  className?: string
}

const TRACK_HEIGHT: Record<'default' | 'small' | 'large', string> = {
  default: 'h-1.5',
  small: 'h-[5px]',
  large: 'h-3',
}

const FILL_COLOR: Record<ProgressStatus, string> = {
  default: 'bg-[var(--gold)]',
  success: 'bg-[var(--green)]',
  warning: 'bg-[var(--orange)]',
  danger: 'bg-[var(--red)]',
}

/**
 * 进度条：参数对齐 Ant Design Progress 线形常用子集（percent/status/size/showInfo），
 * 视觉对齐原型 `.pref-bar` / `.thr-bar` / `.ov-bal-pb`——`--border` 轨道 + 语义色填充、圆角贴合档位。
 * 受控无状态组件；percent 越界自动收敛到 0–100。
 * 无障碍：容器带 `role=progressbar` + `aria-valuenow/min/max`。
 * 非目标：环形（circle/dashboard）、分段（steps）、动态条纹动画、成功阈值（success.percent）。
 */
export function Progress({
  percent,
  status = 'default',
  size = 'default',
  showInfo = false,
  className,
}: ProgressProps) {
  const { t } = useTranslation()
  const clamped = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        aria-label={t('common.progress')}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={clamped}
        className={cn(
          'flex-1 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--border)]',
          TRACK_HEIGHT[size],
        )}
        role="progressbar"
      >
        <div
          className={cn('h-full rounded-[var(--radius-sm)] transition-[width]', FILL_COLOR[status])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showInfo ? (
        <span className="w-9 shrink-0 text-right text-[13px] font-semibold tabular-nums text-[var(--t2)]">
          {clamped}%
        </span>
      ) : null}
    </div>
  )
}

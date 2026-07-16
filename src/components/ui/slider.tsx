import { useTranslation } from 'react-i18next'
import { Slider as SliderPrimitive } from 'radix-ui'
import { cn } from '@/core/utils'

export interface SliderProps {
  /** 当前值（受控，必传，单滑块）。 */
  value: number
  /** 值变化回调（拖拽/键盘/点击轨道都会回传）。 */
  onChange: (value: number) => void
  /** 最小值，默认 0。 */
  min?: number
  /** 最大值，默认 100。 */
  max?: number
  /** 步长，默认 1。 */
  step?: number
  /** 是否禁用（不可交互、置灰）。 */
  disabled?: boolean
  /** 附加到最外层容器的类名。 */
  className?: string
}

/**
 * 滑块：参数对齐 Ant Design Slider 单滑块常用子集（value/onChange/min/max/step/disabled），
 * 视觉对齐原型 `.thr`——`--border` 轨道 6px + 金色已选段 + 金色圆点手柄。
 * 基于 Radix Slider，受控；键盘方向键、Home/End、点击轨道跳值均内建，`aria-*` 无障碍属性由 Radix 提供。
 * 非目标：范围（双滑块）、刻度点（marks）、垂直方向、tooltip 气泡。
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
}: SliderProps) {
  const { t } = useTranslation()
  return (
    <SliderPrimitive.Root
      aria-label={t('common.slider')}
      className={cn(
        'relative flex h-5 w-full min-w-[180px] touch-none select-none items-center data-[disabled]:opacity-45',
        className,
      )}
      disabled={disabled}
      max={max}
      min={min}
      step={step}
      value={[value]}
      onValueChange={(next) => {
        onChange(next[0])
      }}
    >
      <SliderPrimitive.Track className="relative h-1.5 grow rounded-[var(--radius-sm)] bg-[var(--border)]">
        <SliderPrimitive.Range className="absolute h-full rounded-[var(--radius-sm)] bg-[var(--gold)]" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-4 cursor-pointer rounded-full border-2 border-[var(--gold)] bg-[var(--card)] shadow-[var(--shadow)] transition-[box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--gold)_25%,transparent)]" />
    </SliderPrimitive.Root>
  )
}

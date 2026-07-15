import { cn } from '@/core/utils'

/** 分段选项（对齐 antd Segmented 的对象选项用法；不支持纯字符串简写） */
export interface SegmentedOption {
  /** 选项显示文本。 */
  label: string
  /** 选项值，字符串。 */
  value: string
  /** 是否禁用该选项。 */
  disabled?: boolean
}

export interface SegmentedProps {
  /** 选项数组。 */
  options: SegmentedOption[]
  /** 当前激活值（受控，必传）。与 antd 差异：无非受控形态、无 defaultValue。 */
  value: string
  /** 激活项变化回调；点击已激活项不触发。 */
  onChange: (value: string) => void
  /** 尺寸密度：'middle' 默认（按钮 5px×12px），'small' 收紧（3px×10px、12px 字号）。 */
  size?: 'middle' | 'small'
  /** 禁用整个分段控件。 */
  disabled?: boolean
  /** 附加到容器的类名。 */
  className?: string
}

const BUTTON_SIZE: Record<'middle' | 'small', string> = {
  middle: 'px-3 py-[5px] text-[13px]',
  small: 'px-2.5 py-[3px] text-xs',
}

/**
 * 分段切换：参数对齐 Ant Design Segmented 常用子集（options/value/onChange/size/disabled），
 * 视觉对齐原型 `.ch-seg`——`--bg` 底 + `--border` 边框 8px 圆角外壳、3px 内衬,
 * 激活项 `--card` 底 + 金字加粗 + 细阴影。
 * 移动端：容器超宽时横向滚动（`overflow-x-auto`），选项不换行。
 * 非目标：icon 选项、block 撑满、受控外的任何形态。
 */
export function Segmented({
  options,
  value,
  onChange,
  size = 'middle',
  disabled,
  className,
}: SegmentedProps) {
  return (
    <div
      className={cn(
        'inline-flex max-w-full items-center overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-[3px]',
        className,
      )}
      role="radiogroup"
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            aria-checked={active}
            className={cn(
              'cursor-pointer whitespace-nowrap rounded-md border-0 bg-transparent font-[inherit] transition-[background,color,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-45',
              BUTTON_SIZE[size],
              active
                ? 'bg-[var(--card)] font-semibold text-[var(--gold)] shadow-[var(--shadow)]'
                : 'text-[var(--t2)] enabled:hover:text-[var(--t1)]',
            )}
            disabled={disabled || option.disabled}
            key={option.value}
            role="radio"
            type="button"
            onClick={() => {
              if (!active) onChange(option.value)
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

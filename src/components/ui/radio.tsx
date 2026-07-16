import type { ReactNode } from 'react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { cn } from '@/core/utils'

/** 单选项定义（对齐 antd Radio.Group options 的常用子集） */
export interface RadioOption {
  /** 选项显示文本/内容，调用方负责走 i18n。 */
  label: ReactNode
  /** 选项值，字符串。 */
  value: string
  /** 卡片形态下的副描述（optionType='default' 时忽略）。 */
  description?: ReactNode
  /** 是否禁用该选项。 */
  disabled?: boolean
}

export interface RadioGroupProps {
  /** 选项数组。 */
  options: RadioOption[]
  /** 当前选中值（受控，必传）。与 antd 差异：无非受控形态、无 defaultValue。 */
  value: string
  /** 选中值变化回调；点击禁用项不触发。 */
  onChange: (value: string) => void
  /**
   * 形态：'default' 圆点 + 文本（横向排列）；'card' 卡片（标题 + 描述，选中金边金底）。
   * 对齐 antd optionType 的 default/button 语义，视觉换成原型卡片。
   */
  optionType?: 'default' | 'card'
  /** 禁用整组。 */
  disabled?: boolean
  /** 附加到最外层容器的类名。 */
  className?: string
}

/**
 * 单选组：参数对齐 Ant Design Radio.Group 常用子集（options/value/onChange/optionType/disabled），
 * 视觉：'default' 圆点走 `--gold` 选中；'card' 对齐原型 `.rd-card`——1.5px 边框卡片，
 * 选中态 `--gold` 边框 + `--gold-light` 底。
 * 基于 Radix RadioGroup，受控；方向键切换、`role=radio`/`aria-checked` 无障碍属性内建。
 * 非目标：按钮组（button 实心块）、纵向 default 排列切换、独立 Radio 单选框（仅 Group 形态）。
 */
export function RadioGroup({
  options,
  value,
  onChange,
  optionType = 'default',
  disabled,
  className,
}: RadioGroupProps) {
  const isCard = optionType === 'card'
  return (
    <RadioGroupPrimitive.Root
      className={cn('flex gap-2.5', isCard ? 'items-stretch' : 'flex-wrap items-center', className)}
      disabled={disabled}
      value={value}
      onValueChange={onChange}
    >
      {options.map((option) => {
        const checked = option.value === value
        if (isCard) {
          return (
            <RadioGroupPrimitive.Item
              className={cn(
                'flex-1 cursor-pointer rounded-[var(--radius-lg)] border-[1.5px] bg-[var(--card)] p-3.5 text-center transition-[border-color,background] duration-150 disabled:cursor-not-allowed disabled:opacity-45',
                checked
                  ? 'border-[var(--gold)] bg-[var(--gold-light)]'
                  : 'border-[var(--border-strong)] enabled:hover:border-[var(--gold)]',
              )}
              disabled={option.disabled}
              key={option.value}
              value={option.value}
            >
              <div className="text-[13px] font-medium text-[var(--t1)]">{option.label}</div>
              {option.description !== undefined ? (
                <div className="mt-0.5 text-[11px] text-[var(--t3)]">{option.description}</div>
              ) : null}
            </RadioGroupPrimitive.Item>
          )
        }
        return (
          <label
            className={cn(
              'inline-flex items-center gap-2 text-[13px] text-[var(--t1)]',
              option.disabled || disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer',
            )}
            key={option.value}
          >
            <RadioGroupPrimitive.Item
              className="flex size-4 items-center justify-center rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--card)] transition-colors data-[state=checked]:border-[var(--gold)] disabled:cursor-not-allowed"
              disabled={option.disabled}
              value={option.value}
            >
              <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-[var(--gold)]" />
            </RadioGroupPrimitive.Item>
            {option.label}
          </label>
        )
      })}
    </RadioGroupPrimitive.Root>
  )
}

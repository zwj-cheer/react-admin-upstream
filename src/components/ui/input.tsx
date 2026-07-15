import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/core/utils'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> {
  /**
   * 是否显示一键清除按钮（有值且未禁用时出现在输入框右侧）。
   * 清除通过原生 value setter + input 事件实现，受控用法与 react-hook-form
   * `register` 均能收到 onChange。与 antd 的差异：不支持传自定义 clearIcon。
   * 契约限制：按钮显隐在非受控模式下由 onChange 跟踪——RHF `reset()`/`setValue()`
   * 直写 DOM 不派发事件，显隐会与真实值脱钩，故 allowClear 仅支持受控用法。
   */
  allowClear?: boolean
  /** 前缀装饰（ReactNode），绝对定位在输入框左侧，颜色默认 `--t3`；常用于搜索图标。 */
  prefix?: ReactNode
  /** 后缀装饰（ReactNode），绝对定位在输入框右侧；与 allowClear 同时使用时清除按钮在其左侧。 */
  suffix?: ReactNode
  /** 校验状态。'error' 时边框与聚焦光晕转红并输出 `aria-invalid`；省略为正常态。 */
  status?: 'error'
  /** 尺寸密度：'middle' 默认（40px 高），'small' 收紧（32px 高），字号均 13px。 */
  size?: 'middle' | 'small'
}

const SIZE: Record<'middle' | 'small', string> = {
  middle: 'min-h-10 px-3 py-[9px]',
  small: 'min-h-8 px-2.5 py-[5px]',
}

/**
 * 输入框：参数对齐 Ant Design Input 常用子集（allowClear/prefix/suffix/status/size），
 * 非目标：TextArea、Password、addonBefore/addonAfter。
 * 无装饰 props 时渲染裸 `<input>`（DOM 结构与增强前一致）；有装饰时外包一层
 * `relative` 容器并给输入框追加内边距。forwardRef 恒指向内部 `<input>`，
 * 与 react-hook-form 的 `register` 展开兼容。
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { allowClear, prefix, suffix, status, size = 'middle', className, onChange, ...props },
  ref,
) {
  const { t } = useTranslation()
  const innerRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => innerRef.current!)
  const [innerHasValue, setInnerHasValue] = useState(Boolean(props.defaultValue))
  const hasValue = props.value !== undefined ? props.value !== '' : innerHasValue

  const input = (
    <input
      ref={innerRef}
      className={cn(
        'w-full rounded-lg border bg-[var(--bg)] text-[13px] text-[var(--t1)] [color-scheme:inherit] transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--t3)] focus:outline-none',
        SIZE[size],
        status === 'error'
          ? 'border-[var(--red)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--red)_12%,transparent)]'
          : 'border-[var(--border)] focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--gold)_12%,transparent)]',
        prefix != null && 'pl-9',
        (suffix != null || allowClear) && 'pr-9',
        className,
      )}
      aria-invalid={status === 'error' || undefined}
      onChange={(event) => {
        setInnerHasValue(event.target.value !== '')
        onChange?.(event)
      }}
      {...props}
    />
  )

  if (prefix == null && suffix == null && !allowClear) return input

  return (
    <span className="relative inline-flex w-full items-center">
      {prefix != null && (
        <span className="pointer-events-none absolute left-3 inline-flex text-[var(--t3)]">
          {prefix}
        </span>
      )}
      {input}
      {(allowClear || suffix != null) && (
        <span className="absolute right-3 inline-flex items-center gap-1 text-[var(--t3)]">
          {allowClear && hasValue && !props.disabled && (
            <button
              aria-label={t('common.clear')}
              className="inline-flex cursor-pointer rounded-full p-0.5 transition-colors hover:bg-[var(--bg)] hover:text-[var(--t1)]"
              type="button"
              onClick={() => {
                const element = innerRef.current
                if (!element) return
                Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
                  element,
                  '',
                )
                element.dispatchEvent(new Event('input', { bubbles: true }))
                element.focus()
              }}
            >
              <Icon name="x" size={14} />
            </button>
          )}
          {suffix}
        </span>
      )}
    </span>
  )
})

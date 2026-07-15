import {
  forwardRef,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type SelectHTMLAttributes,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Popover } from 'radix-ui'
import { Icon } from '@/components/ui/icon'
import { SpinIndicator } from '@/components/ui/spin'
import { cn } from '@/core/utils'

/* ------------------------------------------------------------------ */
/* 低层基元：原生 <select> 透传（原 Select 改名让位）                     */
/* ------------------------------------------------------------------ */

/**
 * 原生 `<select>` 基元，保留 forwardRef 供 react-hook-form `register` 直接展开。
 * 仅需原生行为（表单内简单枚举、无搜索/多选）时使用；富交互一律用高层 `Select`。
 */
export const SelectNative = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function SelectNative({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'min-h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-[9px] text-[13px] text-[var(--t1)] [color-scheme:inherit] transition-[border-color,box-shadow] duration-150 focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--gold)_12%,transparent)] focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    )
  },
)

/* ------------------------------------------------------------------ */
/* 高层 Select：参数对齐 Ant Design Select 常用子集                      */
/* ------------------------------------------------------------------ */

/** 选项定义（对齐 antd options 数组用法；不支持 OptGroup） */
export interface SelectOption {
  /** 选项显示文本，同时作为 showSearch 的过滤目标。 */
  label: string
  /** 选项值，字符串。 */
  value: string
  /** 是否禁用该选项。 */
  disabled?: boolean
}

interface SelectBaseProps {
  /** 选项数组。非目标：OptGroup、远程搜索、虚拟滚动。 */
  options: SelectOption[]
  /** 未选中时的占位文案，颜色 `--t3`。 */
  placeholder?: string
  /** 是否显示清除按钮（有值且未禁用时出现）。单选清为 undefined，多选清为空数组。 */
  allowClear?: boolean
  /** 是否显示搜索框（本地 label 包含匹配，大小写不敏感）。 */
  showSearch?: boolean
  /** 加载中：触发器右侧转圈，面板显示 `common.loading`，禁止交互。 */
  loading?: boolean
  /** 禁用整个选择器。 */
  disabled?: boolean
  /** 尺寸密度：'middle' 默认（40px 高），'small' 收紧（32px 高）。 */
  size?: 'middle' | 'small'
  /** 附加到触发器按钮的类名。 */
  className?: string
}

export interface SelectSingleProps extends SelectBaseProps {
  /** 单选模式（默认）。 */
  mode?: undefined
  /** 当前选中值（受控）；undefined 表示未选中。 */
  value?: string
  /** 选中变化回调；allowClear 清除时回传 undefined。 */
  onChange: (value: string | undefined) => void
}

export interface SelectMultipleProps extends SelectBaseProps {
  /** 多选模式：触发器内以浅金 tag 展示选中项，点击选项切换选中。 */
  mode: 'multiple'
  /** 当前选中值数组（受控）。 */
  value: string[]
  /** 选中变化回调，回传完整选中数组。 */
  onChange: (value: string[]) => void
}

/** Select 组件属性：单选 / 多选二选一（判别联合，mode 决定 value/onChange 形状）。 */
export type SelectProps = SelectSingleProps | SelectMultipleProps

const TRIGGER_SIZE: Record<'middle' | 'small', string> = {
  middle: 'min-h-10 px-3 py-[9px]',
  small: 'min-h-8 px-2.5 py-[5px]',
}

/**
 * 选择器：参数对齐 Ant Design Select 常用子集
 * （options/value/onChange/placeholder/allowClear/showSearch/mode/loading/disabled/size），
 * 基于 radix Popover 实现（radix Select 不支持多选，为统一单/多选与搜索故不采用）。
 * 视觉对齐原型 `.multi-sel-btn`（8px 圆角、13px、右侧 ▾、有值时金字金边）与
 * `.multi-drop`（8px 圆角、--card 底、--shadow-md、选项 hover --bg 底）。
 * 面板宽度恒等于触发器宽度（含 390px 移动端，不做抽屉化）。
 * 受控组件：不持有选中状态。键盘：触发器 Enter/Space/ArrowDown 开启，面板内
 * ArrowUp/Down 移动选项焦点、Home/End 到首尾、Escape 关闭；无 typeahead（非目标）。
 * 与 antd 差异：无非受控形态、无 labelInValue、无 maxTagCount。
 */
export function Select(props: SelectProps) {
  const {
    options,
    placeholder,
    allowClear,
    showSearch,
    loading,
    disabled,
    size = 'middle',
    className,
  } = props
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const listboxId = useId()
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  /** 面板内选项 roving focus：ArrowUp/Down 移动、Home/End 到首尾。 */
  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    const items = [
      ...(listRef.current?.querySelectorAll<HTMLButtonElement>('[role=option]:not(:disabled)') ??
        []),
    ]
    if (items.length === 0) return
    event.preventDefault()
    const current = items.indexOf(document.activeElement as HTMLButtonElement)
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : event.key === 'ArrowDown'
            ? Math.min(current + 1, items.length - 1)
            : Math.max(current - 1, 0)
    items[next].focus()
  }

  const isMultiple = props.mode === 'multiple'
  const selectedValues = isMultiple ? props.value : props.value === undefined ? [] : [props.value]
  const selectedOptions = options.filter((option) => selectedValues.includes(option.value))
  const hasValue = selectedOptions.length > 0
  const interactive = !disabled && !loading

  const visibleOptions = showSearch
    ? options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  const pick = (option: SelectOption) => {
    if (props.mode === 'multiple') {
      const next = selectedValues.includes(option.value)
        ? selectedValues.filter((value) => value !== option.value)
        : [...selectedValues, option.value]
      props.onChange(next)
    } else {
      props.onChange(option.value)
      close()
    }
  }

  const clear = () => {
    if (props.mode === 'multiple') props.onChange([])
    else props.onChange(undefined)
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (!interactive) return
        if (next) setOpen(true)
        else close()
      }}
    >
      <Popover.Trigger asChild>
        {/* 触发器用 div[role=combobox] 而非 <button>：内部清除/移除 tag 需要真 <button>，
            button 嵌套 button 是非法 HTML；键盘开启由 onKeyDown 补齐 */}
        <div
          aria-controls={open ? listboxId : undefined}
          aria-disabled={disabled || undefined}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            'inline-flex w-full cursor-pointer items-center gap-1.5 rounded-lg border bg-[var(--card)] text-left text-[13px] transition-[border-color,box-shadow,color] duration-150 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--gold)_12%,transparent)] focus:outline-none',
            TRIGGER_SIZE[size],
            hasValue
              ? 'border-[var(--gold)] text-[var(--gold)]'
              : 'border-[var(--border)] text-[var(--t2)]',
            disabled && 'cursor-not-allowed opacity-45',
            className,
          )}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(event) => {
            if (!interactive) return
            if (['Enter', ' ', 'ArrowDown'].includes(event.key) && !open) {
              event.preventDefault()
              setOpen(true)
            }
          }}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {!hasValue && <span className="truncate text-[var(--t3)]">{placeholder}</span>}
            {isMultiple
              ? selectedOptions.map((option) => (
                  <span
                    className="inline-flex items-center gap-1 rounded-md bg-[var(--gold-light)] px-1.5 py-0.5 text-[12px] text-[var(--gold)]"
                    key={option.value}
                  >
                    {option.label}
                    <button
                      aria-label={t('common.deselect', { label: option.label })}
                      className="inline-flex cursor-pointer rounded-full border-0 bg-transparent p-0 text-inherit hover:opacity-70 disabled:cursor-not-allowed"
                      disabled={!interactive}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        pick(option)
                      }}
                    >
                      <Icon name="x" size={14} />
                    </button>
                  </span>
                ))
              : hasValue && <span className="truncate">{selectedOptions[0].label}</span>}
          </span>
          {allowClear && hasValue && interactive && (
            <button
              aria-label={t('common.clear')}
              className="inline-flex cursor-pointer border-0 bg-transparent p-0 text-[var(--t3)] hover:text-[var(--t1)]"
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                clear()
              }}
            >
              <Icon name="x" size={14} />
            </button>
          )}
          {loading ? (
            <SpinIndicator />
          ) : (
            <Icon
              className={cn(
                'shrink-0 text-[var(--icon)] transition-transform',
                open && 'rotate-180',
              )}
              name="chevron-down"
              size={14}
            />
          )}
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          className="z-[400] w-[var(--radix-popover-trigger-width)] rounded-lg border border-[var(--border)] bg-[var(--card)] py-1.5 shadow-[var(--shadow-md)]"
          sideOffset={4}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            if (showSearch) {
              searchRef.current?.focus()
              return
            }
            // 聚焦当前选中项（无则首个可用项），roving focus 由此起步
            const items = [
              ...(listRef.current?.querySelectorAll<HTMLButtonElement>(
                '[role=option]:not(:disabled)',
              ) ?? []),
            ]
            const selected = items.find((item) => item.getAttribute('aria-selected') === 'true')
            ;(selected ?? items[0])?.focus()
          }}
        >
          {showSearch && (
            <div className="border-b border-[var(--border)] px-2 pb-1.5">
              <input
                aria-label={t('common.search')}
                className="w-full rounded-md bg-transparent px-1.5 py-1 text-[13px] text-[var(--t1)] placeholder:text-[var(--t3)] focus:outline-none"
                placeholder={t('common.search')}
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          )}
          <div
            className="max-h-64 overflow-y-auto"
            id={listboxId}
            ref={listRef}
            role="listbox"
            aria-multiselectable={isMultiple || undefined}
            onKeyDown={handleListKeyDown}
          >
            {loading ? (
              <div className="px-3 py-2 text-[13px] text-[var(--t3)]">{t('common.loading')}</div>
            ) : visibleOptions.length === 0 ? (
              <div className="px-3 py-2 text-[13px] text-[var(--t3)]">{t('common.empty')}</div>
            ) : (
              visibleOptions.map((option) => {
                const active = selectedValues.includes(option.value)
                return (
                  <button
                    aria-selected={active}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-1.5 px-3 py-1.5 text-left text-[13px] transition-colors duration-100 hover:bg-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-45',
                      active ? 'text-[var(--gold)]' : 'text-[var(--t1)]',
                    )}
                    disabled={option.disabled}
                    key={option.value}
                    role="option"
                    type="button"
                    onClick={() => pick(option)}
                  >
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {active && <Icon className="shrink-0" name="circle-check" size={14} />}
                  </button>
                )
              })
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

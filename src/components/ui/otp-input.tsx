import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/core/utils'

export interface OtpInputProps {
  /** 当前值（受控，必传）；长度可短于 length，中间空位以空格占位，不足处渲染为空。 */
  value: string
  /** 值变化回调（输入、退格、粘贴都会回传拼接后的完整字符串，长度 ≤ length；中间空位为空格，尾部空位裁掉）。 */
  onChange: (value: string) => void
  /** 格子数量，默认 6。 */
  length?: number
  /**
   * 单格校验正则的字符类，默认 '[0-9]'（仅数字）。
   * 输入与粘贴都会按此过滤，非法字符被丢弃。
   */
  pattern?: string
  /** 是否禁用整组。 */
  disabled?: boolean
  /** 无障碍标签，覆盖默认 i18n `common.otpInput`。 */
  'aria-label'?: string
  /** 附加到最外层容器的类名。 */
  className?: string
}

/**
 * 验证码输入：参数对齐 Ant Design Input.OTP 常用子集（value/onChange/length/disabled），
 * 视觉对齐原型 `.otp-inp`——44×50 单格、1.5px 边框、金色 focus 光晕，居中大号数字。
 * 受控；自动聚焦下一格、退格回退、方向键移动、整串粘贴分发。
 * 非目标：formatter、mask 掩码、variant 边框样式、分隔符。
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  pattern = '[0-9]',
  disabled,
  'aria-label': ariaLabel,
  className,
}: OtpInputProps) {
  const { t } = useTranslation()
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  let charRegex: RegExp
  try {
    charRegex = new RegExp(`^(?:${pattern})$`)
  } catch {
    // pattern 非法（如未闭合的 `[`）时回退到「拒绝一切」，避免渲染期抛错崩溃组件。
    charRegex = /^\b$/
  }

  const focusAt = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index))
    inputsRef.current[clamped]?.focus()
    inputsRef.current[clamped]?.select()
  }

  /** 空位以空格占位保留槽位对齐，仅裁掉尾部空位——中间槽编辑不得使后续数字左移。 */
  const charsToValue = (chars: string[]) => chars.slice(0, length).join('').replace(/ +$/, '')

  const setCharAt = (index: number, char: string) => {
    const chars = value.split('')
    while (chars.length < length) chars.push(' ')
    chars[index] = char === '' ? ' ' : char
    onChange(charsToValue(chars))
  }

  const handleChange = (index: number, raw: string) => {
    const char = raw.slice(-1)
    if (char !== '' && !charRegex.test(char)) return
    setCharAt(index, char)
    if (char !== '') focusAt(index + 1)
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      const filled = value[index] !== undefined && value[index] !== ' '
      if (filled) {
        setCharAt(index, '')
      } else if (index > 0) {
        setCharAt(index - 1, '')
        focusAt(index - 1)
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusAt(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusAt(index + 1)
    }
  }

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData
      .getData('text')
      .split('')
      .filter((char) => charRegex.test(char))
    if (pasted.length === 0) return
    const chars = value.split('')
    while (chars.length < length) chars.push(' ')
    for (let i = 0; i < pasted.length && index + i < length; i += 1) {
      chars[index + i] = pasted[i]
    }
    onChange(charsToValue(chars))
    focusAt(index + pasted.length)
  }

  return (
    <div
      aria-label={ariaLabel ?? t('common.otpInput')}
      className={cn('flex justify-center gap-2', className)}
      role="group"
    >
      {Array.from({ length }, (_, index) => (
        <input
          aria-label={t('common.otpDigit', { index: index + 1 })}
          autoComplete="one-time-code"
          className="size-[44px] rounded-[var(--radius-lg)] border-[1.5px] border-[var(--border-strong)] bg-[var(--card)] text-center text-xl font-semibold text-[var(--t1)] transition-[border-color,box-shadow] duration-150 focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--gold)_12%,transparent)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-45 [&::-webkit-inner-spin-button]:appearance-none"
          disabled={disabled}
          inputMode={pattern === '[0-9]' ? 'numeric' : 'text'}
          key={index}
          maxLength={1}
          ref={(node) => {
            inputsRef.current[index] = node
          }}
          value={value[index] === ' ' ? '' : (value[index] ?? '')}
          onChange={(event) => {
            handleChange(index, event.target.value)
          }}
          onKeyDown={(event) => {
            handleKeyDown(index, event)
          }}
          onPaste={(event) => {
            handlePaste(index, event)
          }}
        />
      ))}
    </div>
  )
}

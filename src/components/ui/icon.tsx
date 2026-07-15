import type { SVGProps } from 'react'
import { cn } from '@/core/utils'

/**
 * sprite 图标名清单，与 `public/icons.svg` 的 symbol id（去掉 `icon-` 前缀）一一对应。
 * 一致性由 `icon.test.tsx` 读 sprite 双向断言守护——新增 symbol 未同步此处会在测试期报错。
 */
export const ICON_NAMES = [
  'user',
  'users',
  'building',
  'chart-bar',
  'file-text',
  'settings',
  'menu',
  'bolt',
  'save',
  'phone',
  'mail',
  'clipboard',
  'credit-card',
  'lightbulb',
  'circle-check',
  'triangle-alert',
  'bot',
  'target',
  'clock',
  'shield-check',
  'lock',
  'key',
  'monitor',
  'plug',
  'message-square',
  'headphones',
  'bell',
  'chevron-down',
  'chevron-up',
  'sun',
  'moon',
  'x',
  'plus',
  'flask',
  'pencil',
  'trash',
  'search',
  'key-round',
  'languages',
  'logout',
  'check',
] as const

/** 业务图标名字面量联合，由 {@link ICON_NAMES} 派生；拼错名字在编译期报错。 */
export type IconName = (typeof ICON_NAMES)[number]

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  /** 图标名，对应 sprite symbol id；仅接受 {@link IconName} 字面量，运行时动态字符串请用 `IconSprite`。 */
  name: IconName
  /**
   * 图标边长（px），默认 16，对应原型 `icon-14`/`icon-16` 等尺寸类。
   * 11/13 为表格排序箭头与复选框勾等微型场景；24 仅用于状态页大图标圆底
   * （对齐原型 `.modal-confirm-icon`）。
   */
  size?: 11 | 13 | 14 | 16 | 18 | 20 | 24
  /**
   * 无障碍标签。缺省时图标视为纯装饰（输出 `aria-hidden`）；
   * 传入后输出 `role="img"` + `aria-label`，用于图标独立承载语义的场景。
   */
  label?: string
}

/**
 * 业务图标组件，唯一来源为 `public/icons.svg` sprite（24 viewBox / stroke 1.8）。
 * 颜色恒为 `currentColor`，由父级文字颜色控制。
 * 全仓（含 `src/components/ui/`）禁止直接使用 lucide-react，一律经此组件取图标；
 * sprite 缺字形时先补 symbol 并同步 {@link ICON_NAMES}。
 */
export function Icon({ name, size = 16, label, className, ...props }: IconProps) {
  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      {...props}
    >
      <use href={'/icons.svg#icon-' + name} />
    </svg>
  )
}

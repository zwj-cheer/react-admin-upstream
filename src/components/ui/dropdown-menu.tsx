import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { DropdownMenu as DropdownPrimitive } from 'radix-ui'
import { cn } from '@/core/utils'

export const DropdownMenu = DropdownPrimitive.Root
export const DropdownMenuTrigger = DropdownPrimitive.Trigger

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        className={cn(
          'z-[400] min-w-[190px] rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-[var(--shadow-md)]',
          className,
        )}
        sideOffset={sideOffset}
        {...props}
      />
    </DropdownPrimitive.Portal>
  )
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Item>) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        'flex min-h-[34px] cursor-pointer select-none items-center gap-2 rounded-[7px] px-2.5 py-[7px] text-[var(--t2)] outline-none hover:bg-[var(--bg)] hover:text-[var(--t1)] focus:bg-[var(--bg)] focus:text-[var(--t1)]',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuLabel(props: ComponentProps<typeof DropdownPrimitive.Label>) {
  return (
    <DropdownPrimitive.Label
      className="px-2.5 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--t3)]"
      {...props}
    />
  )
}

export function DropdownMenuSeparator(props: ComponentProps<typeof DropdownPrimitive.Separator>) {
  return <DropdownPrimitive.Separator className="my-[5px] h-px bg-[var(--border)]" {...props} />
}

/* ------------------------------------------------------------------ */
/* 高层 Dropdown：参数对齐 Ant Design Dropdown 的常用子集                */
/* ------------------------------------------------------------------ */

/** 菜单项定义（对齐 antd menu.items 的常用子集；不支持子菜单嵌套） */
export interface DropdownMenuItemDef {
  /** 项唯一标识，点击后回传给 menu.onClick。分割线也需要 key（用于 React 列表）。 */
  key: string
  /** 项显示内容。type 为 'divider' 时忽略。 */
  label?: ReactNode
  /** 左侧图标（ReactNode）。 */
  icon?: ReactNode
  /** 危险项：文字与图标 `--red`。 */
  danger?: boolean
  /** 是否禁用该项。 */
  disabled?: boolean
  /** 传 'divider' 渲染分割线，其余字段忽略。 */
  type?: 'divider'
}

/** antd placement → radix side/align 的映射表 */
const PLACEMENT: Record<
  'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight',
  { side: 'top' | 'bottom'; align: 'start' | 'end' }
> = {
  bottomLeft: { side: 'bottom', align: 'start' },
  bottomRight: { side: 'bottom', align: 'end' },
  topLeft: { side: 'top', align: 'start' },
  topRight: { side: 'top', align: 'end' },
}

export interface DropdownProps {
  /** 菜单配置：items 列表 + 统一点击回调（回传被点项的 key）。 */
  menu: {
    items: DropdownMenuItemDef[]
    onClick?: (key: string) => void
  }
  /**
   * 触发器，必须是单个元素节点（经 radix asChild 透传 props）。
   * 注意 AGENTS.md 约定 3：不能传 NavLink 函数型 className 的元素。
   */
  children: ReactElement
  /** 面板方位，对齐 antd placement 常用四向，默认 'bottomLeft'。 */
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
  /** 禁用触发（面板不再打开）。 */
  disabled?: boolean
}

/**
 * 下拉菜单：参数对齐 Ant Design Dropdown 常用子集（menu/placement/disabled），
 * 点击触发、单层菜单。非目标：多级子菜单、hover 触发、可选中项。
 * 复杂自定义内容（如 AccountMenu 的用户信息头）继续使用 DropdownMenu* 基元组合。
 */
export function Dropdown({ menu, children, placement = 'bottomLeft', disabled }: DropdownProps) {
  const { side, align } = PLACEMENT[placement]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side}>
        {menu.items.map((item) =>
          item.type === 'divider' ? (
            <DropdownMenuSeparator key={item.key} />
          ) : (
            <DropdownMenuItem
              className={cn(
                item.danger && 'text-[var(--red)] hover:text-[var(--red)] focus:text-[var(--red)]',
              )}
              disabled={item.disabled}
              key={item.key}
              onSelect={() => menu.onClick?.(item.key)}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

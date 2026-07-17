import type { ComponentProps } from 'react'
import { DropdownMenu as DropdownPrimitive } from 'radix-ui'
import { cn } from '@/core/utils'

export const DropdownMenu = DropdownPrimitive.Root
export const DropdownMenuTrigger = DropdownPrimitive.Trigger
export const DropdownMenuGroup = DropdownPrimitive.Group

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

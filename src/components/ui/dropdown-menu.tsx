import type { ComponentProps } from 'react'
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
        className={cn('dropdown-content', className)}
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
  return <DropdownPrimitive.Item className={cn('dropdown-item', className)} {...props} />
}

export function DropdownMenuLabel(props: ComponentProps<typeof DropdownPrimitive.Label>) {
  return <DropdownPrimitive.Label className="dropdown-label" {...props} />
}

export function DropdownMenuSeparator(props: ComponentProps<typeof DropdownPrimitive.Separator>) {
  return <DropdownPrimitive.Separator className="dropdown-separator" {...props} />
}

import type { ComponentProps } from 'react'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import { cn } from '@/core/utils'

export const ToggleGroup = ToggleGroupPrimitive.Root

export function ToggleGroupItem({
  className,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        'inline-flex min-h-9 items-center justify-center rounded-md border border-transparent px-3 text-[13px] font-medium text-[var(--t2)] transition-[background,border-color,color] hover:text-[var(--t1)] disabled:cursor-not-allowed disabled:opacity-45 data-[state=on]:border-[var(--gold)] data-[state=on]:bg-[var(--gold-light)] data-[state=on]:text-[var(--gold)]',
        className,
      )}
      {...props}
    />
  )
}

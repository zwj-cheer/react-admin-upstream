import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/core/utils'

export function InputGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        'group/input-group relative flex min-h-10 w-full items-center rounded-lg border border-[var(--border)] bg-[var(--bg)] transition-[border-color,box-shadow] has-[[data-slot=input-group-control]:focus-visible]:border-[var(--gold)] has-[[data-slot=input-group-control]:focus-visible]:shadow-[0_0_0_3px_color-mix(in_srgb,var(--gold)_12%,transparent)] has-[[aria-invalid=true]]:border-[var(--red)]',
        className,
      )}
      {...props}
    />
  )
}

const addonVariants = cva(
  'flex cursor-text items-center justify-center text-[var(--t3)] [&_svg]:pointer-events-none',
  {
    variants: {
      align: {
        'inline-start': 'order-first pl-3',
        'inline-end': 'order-last pr-2',
      },
    },
    defaultVariants: { align: 'inline-start' },
  },
)

export function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: ComponentProps<'div'> & VariantProps<typeof addonVariants>) {
  return (
    <div
      data-align={align}
      data-slot="input-group-addon"
      className={cn(addonVariants({ align }), className)}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('button')) return
        event.currentTarget.parentElement?.querySelector('input')?.focus()
      }}
      {...props}
    />
  )
}

export function InputGroupButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn('size-7 min-h-0 rounded-md border-0 p-0 shadow-none', className)}
      size="icon"
      variant="ghost"
      {...props}
    />
  )
}

export function InputGroupInput({ className, ...props }: ComponentProps<'input'>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'min-w-0 flex-1 rounded-none border-0 bg-transparent px-2 shadow-none focus:shadow-none',
        className,
      )}
      {...props}
    />
  )
}

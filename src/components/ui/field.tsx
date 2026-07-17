import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/core/utils'

export function FieldSet({ className, ...props }: ComponentProps<'fieldset'>) {
  return <fieldset className={cn('flex flex-col gap-4', className)} {...props} />
}

export function FieldLegend({ className, ...props }: ComponentProps<'legend'>) {
  return <legend className={cn('text-[13px] font-medium text-[var(--t2)]', className)} {...props} />
}

export function FieldGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn('flex w-full flex-col gap-4', className)}
      {...props}
    />
  )
}

const fieldVariants = cva('group/field flex w-full gap-1.5 data-[invalid=true]:text-[var(--red)]', {
  variants: {
    orientation: {
      vertical: 'flex-col',
      horizontal: 'flex-row items-center gap-2',
    },
  },
  defaultVariants: { orientation: 'vertical' },
})

export function Field({
  className,
  orientation = 'vertical',
  ...props
}: ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

export function FieldLabel({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      data-slot="field-label"
      className={cn('w-fit text-[13px] font-medium text-[var(--t2)]', className)}
      {...props}
    />
  )
}

export function FieldTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-title"
      className={cn('w-fit text-[13px] font-medium text-[var(--t2)]', className)}
      {...props}
    />
  )
}

export function FieldError({ className, children, ...props }: ComponentProps<'div'>) {
  if (!children) return null
  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn('text-xs text-[var(--red)]', className)}
      {...props}
    >
      {children}
    </div>
  )
}

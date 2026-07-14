import type { ButtonHTMLAttributes } from 'react'
import { Slot } from 'radix-ui'
import { cn } from '@/core/utils'

type ButtonVariant = 'default' | 'primary' | 'outline-accent' | 'ghost' | 'danger'
type ButtonSize = 'default' | 'sm' | 'icon'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  asChild = false,
  className,
  variant = 'default',
  size = 'default',
  type,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot.Root : 'button'
  return (
    <Component
      className={cn('ui-button', className)}
      data-size={size}
      data-variant={variant}
      type={asChild ? undefined : (type ?? 'button')}
      {...props}
    />
  )
}

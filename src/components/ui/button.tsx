import type { ButtonHTMLAttributes } from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { SpinIndicator } from '@/components/ui/spin'
import { cn } from '@/core/utils'

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border text-[13px] font-medium no-underline transition-[background,border-color,color,opacity,transform] duration-150 disabled:cursor-not-allowed disabled:opacity-45',
  {
    variants: {
      variant: {
        default: 'border-[var(--border)] bg-[var(--card)] text-[var(--t1)] hover:bg-[var(--bg)]',
        primary:
          'border-[var(--gold)] bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold-dark)]',
        'outline-accent':
          'border-[1.5px] border-[var(--gold)] bg-[var(--gold-light)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--primary-foreground)]',
        ghost: 'border-transparent bg-transparent hover:bg-[var(--bg)]',
        danger: 'border-[var(--red)] bg-[var(--red)] text-white',
      },
      size: {
        default: 'min-h-9 px-3.5 py-2',
        sm: 'min-h-8 px-2.5 py-1.5 text-xs',
        icon: 'min-h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * 加载中：左侧渲染转圈并禁用按钮（对齐 antd Button loading 的常用形态）。
   * 与 asChild 互斥——asChild 下不注入转圈节点，loading 仅作禁用。
   */
  loading?: boolean
}

export function Button({
  asChild = false,
  loading = false,
  className,
  variant,
  size,
  type,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot.Root : 'button'
  return (
    <Component
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      type={asChild ? undefined : (type ?? 'button')}
      {...props}
    >
      {loading && !asChild ? (
        <>
          <SpinIndicator className="border-current border-t-transparent opacity-70" />
          {children}
        </>
      ) : (
        children
      )}
    </Component>
  )
}

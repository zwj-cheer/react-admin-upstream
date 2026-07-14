import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/core/utils'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'min-h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-[9px] text-[13px] text-[var(--t1)] [color-scheme:inherit] transition-[border-color,box-shadow] duration-150 focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--gold)_12%,transparent)] focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    )
  },
)

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/core/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'min-h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-[9px] text-[13px] text-[var(--t1)] [color-scheme:inherit] transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--t3)] focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--gold)_12%,transparent)] focus:outline-none',
          className,
        )}
        {...props}
      />
    )
  },
)

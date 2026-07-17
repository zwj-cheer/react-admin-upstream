import type { ComponentProps } from 'react'
import { cn } from '@/core/utils'

export function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        'min-h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-[9px] text-[13px] text-[var(--t1)] [color-scheme:inherit] transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--t3)] focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--gold)_12%,transparent)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-45 aria-invalid:border-[var(--red)] aria-invalid:focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--red)_12%,transparent)]',
        className,
      )}
      {...props}
    />
  )
}

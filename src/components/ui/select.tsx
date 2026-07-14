import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/core/utils'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn('ui-select', className)} {...props}>
        {children}
      </select>
    )
  },
)

import type { ComponentProps } from 'react'
import { Check } from 'lucide-react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { cn } from '@/core/utils'

export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'inline-grid size-[18px] place-items-center rounded-[5px] border border-[var(--border-strong)] bg-[var(--card)] text-white data-[state=checked]:border-[var(--gold)] data-[state=checked]:bg-[var(--gold)]',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check size={13} strokeWidth={2.5} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

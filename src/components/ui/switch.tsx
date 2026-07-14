import type { ComponentProps } from 'react'
import { Switch as SwitchPrimitive } from 'radix-ui'
import { cn } from '@/core/utils'

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'relative h-[22px] w-10 cursor-pointer rounded-full border-0 bg-[var(--border-strong)] p-0 transition-colors data-[state=checked]:bg-[var(--gold)]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-[18px] translate-x-[2px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-200 data-[state=checked]:translate-x-[20px]" />
    </SwitchPrimitive.Root>
  )
}

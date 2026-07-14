import type { ComponentProps } from 'react'
import { Tooltip as TooltipPrimitive } from 'radix-ui'

export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export function TooltipContent(props: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className="z-[500] rounded-md bg-[var(--t1)] px-[9px] py-1.5 text-[11px] text-[var(--card)]"
        sideOffset={6}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}

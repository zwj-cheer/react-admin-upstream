import type { ComponentProps, PropsWithChildren } from 'react'
import { X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { cn } from '@/core/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[300] animate-[fade-in_0.16s_ease] bg-black/45" />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'fixed left-1/2 top-1/2 z-[301] max-h-[calc(100vh-40px)] w-[min(520px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 animate-[dialog-in_0.18s_ease] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7 shadow-[var(--shadow-md)]',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-3.5 top-3.5 grid size-[30px] cursor-pointer place-items-center rounded-full border-0 bg-[var(--bg)] text-[var(--t3)]"
          aria-label="Close"
        >
          <X size={16} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({ children }: PropsWithChildren) {
  return <div className="mb-[22px] grid gap-1.5 pr-7">{children}</div>
}

export function DialogTitle(props: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className="text-lg font-bold" {...props} />
}

export function DialogDescription(props: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className="text-[13px] text-[var(--t2)]" {...props} />
}

export function DialogFooter({ children }: PropsWithChildren) {
  return <div className="mt-6 flex justify-end gap-2.5">{children}</div>
}

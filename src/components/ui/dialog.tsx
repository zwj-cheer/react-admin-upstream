import type { ComponentProps, CSSProperties, PropsWithChildren, ReactNode } from 'react'
import { Icon } from '@/components/ui/icon'
import { useTranslation } from 'react-i18next'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { cn } from '@/core/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  const { t } = useTranslation()
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
          aria-label={t('common.close')}
        >
          <Icon name="x" size={16} />
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

/* ------------------------------------------------------------------ */
/* 高层 Modal：参数对齐 Ant Design Modal 的常用子集                      */
/* ------------------------------------------------------------------ */

export interface ModalProps {
  /** 是否可见（受控）。 */
  open: boolean
  /** 可见性变化回调（遮罩点击、Escape、右上角 X、取消按钮都会回传 false）。 */
  onOpenChange: (open: boolean) => void
  /** 标题。始终渲染 DialogTitle（无障碍要求）；不需要标题时传空串并自行处理视觉。 */
  title: ReactNode
  /** 副标题/描述，渲染在标题下方，可省略。 */
  description?: ReactNode
  /**
   * 确认回调。返回 Promise 时不自动关闭弹窗——由调用方在成功后自行 `onOpenChange(false)`
   * （与 antd 自动关闭不同，本组件不吞错误也不代管关闭时机）。
   */
  onOk?: () => void | Promise<void>
  /** 取消回调，默认行为是 `onOpenChange(false)`；提供后先调它再关闭。 */
  onCancel?: () => void
  /** 确认按钮文案，默认 i18n `common.confirm`。 */
  okText?: ReactNode
  /** 取消按钮文案，默认 i18n `common.cancel`。 */
  cancelText?: ReactNode
  /** 确认按钮 loading（禁用 + 配合 Button 视觉），对齐 antd confirmLoading。 */
  confirmLoading?: boolean
  /** 危险确认：确认按钮红底（对齐 antd `okButtonProps.danger` 的常用形态）。 */
  okDanger?: boolean
  /**
   * 页脚。省略时渲染默认「取消 / 确认」双按钮；传 `null` 隐藏页脚（纯展示弹窗）;
   * 传 ReactNode 完全自定义。
   */
  footer?: ReactNode | null
  /** 弹窗宽度(px)。默认沿用 DialogContent 的 min(520px, 100vw-32px)，传入后取 min(width, 100vw-32px)。 */
  width?: number
  /** 附加到内容容器的类名。 */
  className?: string
  /** 弹窗主体内容。 */
  children?: ReactNode
}

/**
 * 模态弹窗：参数对齐 Ant Design Modal 常用子集
 * （open/onOpenChange/title/onOk/onCancel/okText/cancelText/confirmLoading/okDanger/
 * footer/width），视觉复用 DialogContent（2xl 圆角、p-7、45% 黑遮罩）。
 * 非目标：`Modal.confirm` 静态方法、拖拽、移动端 sheet 化（列为后续项）。
 * 含表单提交语义的场景（`<form onSubmit>` + submit 按钮）建议继续使用 Dialog 基元组合。
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  onOk,
  onCancel,
  okText,
  cancelText,
  confirmLoading,
  okDanger,
  footer,
  width,
  className,
  children,
}: ModalProps) {
  const { t } = useTranslation()
  const close = () => {
    onCancel?.()
    onOpenChange(false)
  }
  const style: CSSProperties | undefined =
    width === undefined ? undefined : { width: `min(${width}px, calc(100vw - 32px))` }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className={className} style={style}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description != null && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer !== null && (
          <DialogFooter>
            {footer ?? (
              <>
                <Button onClick={close}>{cancelText ?? t('common.cancel')}</Button>
                <Button
                  loading={confirmLoading}
                  variant={okDanger ? 'danger' : 'primary'}
                  onClick={() => void onOk?.()}
                >
                  {okText ?? t('common.confirm')}
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

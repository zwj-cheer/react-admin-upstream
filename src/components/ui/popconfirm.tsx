import { useRef, useState, type ReactElement, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Popover } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export interface PopconfirmProps {
  /** 确认文案（标题行，图标右侧）。 */
  title: ReactNode
  /**
   * 确认回调。返回 Promise 时等待完成后才关闭面板（期间确认按钮禁用）;
   * Promise 拒绝时面板保持打开。
   */
  onConfirm: () => void | Promise<void>
  /** 取消回调（点取消按钮或 Escape/点外部关闭时不触发，仅取消按钮触发）。 */
  onCancel?: () => void
  /** 确认按钮文案，默认 i18n `common.confirm`。 */
  okText?: ReactNode
  /** 取消按钮文案，默认 i18n `common.cancel`。 */
  cancelText?: ReactNode
  /** 危险确认：确认按钮红底，标题图标转红。 */
  okDanger?: boolean
  /** 触发器，必须是单个元素节点（经 radix asChild 透传；注意 AGENTS.md 约定 3）。 */
  children: ReactElement
}

/**
 * 气泡确认框：参数对齐 Ant Design Popconfirm 常用子集
 * （title/onConfirm/onCancel/okText/cancelText + okDanger），基于 radix Popover，
 * 面板样式对齐原型 `.multi-drop`（8px 圆角、--card 底、--shadow-md）。
 *
 * 与 `ConfirmDialog`（Modal）的分工：
 * - 不可恢复 / 批量 / 重量级操作 → `ConfirmDialog`（模态，打断式）;
 * - 单行、可撤销级的轻量操作（行内删除一条草稿等）→ `Popconfirm`（就地，非模态）。
 * 非目标：icon 自定义、异步 loading 图标、placement 细分（固定 top 优先自动翻转）。
 */
export function Popconfirm({
  title,
  onConfirm,
  onCancel,
  okText,
  cancelText,
  okDanger,
  children,
}: PopconfirmProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  /** 面板会话令牌：每次关闭自增，陈旧异步确认 resolve 后不得再关闭新会话的面板。 */
  const sessionRef = useRef(0)

  const close = () => {
    sessionRef.current += 1
    setOpen(false)
  }

  const confirm = async () => {
    const session = sessionRef.current
    const result = onConfirm()
    if (result instanceof Promise) {
      setPending(true)
      try {
        await result
      } catch {
        return
      } finally {
        setPending(false)
      }
    }
    if (sessionRef.current === session) close()
  }

  return (
    <Popover.Root open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="center"
          className="z-[400] w-max max-w-[280px] rounded-lg border border-[var(--border)] bg-[var(--card)] p-3.5 shadow-[var(--shadow-md)]"
          side="top"
          sideOffset={6}
        >
          <div className="flex items-start gap-2 text-[13px] text-[var(--t1)]">
            <Icon
              className={
                okDanger
                  ? 'mt-0.5 shrink-0 text-[var(--red)]'
                  : 'mt-0.5 shrink-0 text-[var(--orange)]'
              }
              name="triangle-alert"
              size={14}
            />
            {title}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button
              size="sm"
              onClick={() => {
                onCancel?.()
                close()
              }}
            >
              {cancelText ?? t('common.cancel')}
            </Button>
            <Button
              disabled={pending}
              size="sm"
              variant={okDanger ? 'danger' : 'primary'}
              onClick={() => void confirm()}
            >
              {okText ?? t('common.confirm')}
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

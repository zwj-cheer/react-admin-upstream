import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { SpinIndicator } from '@/components/ui/spin'

export interface ConfirmDialogProps {
  /** 是否打开确认弹窗。 */
  open: boolean
  /** 确认操作是否正在执行；执行期间禁止关闭与重复提交。 */
  pending?: boolean
  /** 弹窗开关回调。 */
  onOpenChange: (open: boolean) => void
  /** 确认回调；成功后的关闭时机由调用方控制。 */
  onConfirm: () => Promise<void>
}

export function ConfirmDialog({ open, pending, onOpenChange, onConfirm }: ConfirmDialogProps) {
  const { t } = useTranslation()
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
          <AlertDialogDescription>{t('common.confirmDeleteHint')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button disabled={pending}>{t('common.cancel')}</Button>
          </AlertDialogCancel>
          <Button disabled={pending} variant="danger" onClick={() => void onConfirm()}>
            {pending ? (
              <SpinIndicator className="border-current border-t-transparent opacity-70" />
            ) : null}
            {t('common.delete')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/dialog'

export function ConfirmDialog({
  open,
  pending,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  pending?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}) {
  const { t } = useTranslation()
  return (
    <Modal
      confirmLoading={pending}
      description={t('common.confirmDeleteHint')}
      okDanger
      okText={t('common.delete')}
      open={open}
      title={t('common.confirmDelete')}
      onOk={() => void onConfirm()}
      onOpenChange={onOpenChange}
    />
  )
}

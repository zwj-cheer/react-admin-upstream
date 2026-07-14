import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { Role } from '@/core/services/contracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { roleFormSchema, type RoleFormValues } from './schema'

export function RoleFormDialog({
  open,
  role,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  role?: Role
  pending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: RoleFormValues) => Promise<void>
}) {
  const { t } = useTranslation()
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: '', code: '', description: '' },
  })

  useEffect(() => {
    reset({
      name: role?.name ?? '',
      code: role?.code ?? '',
      description: role?.description ?? '',
    })
  }, [open, reset, role])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t(role ? 'roles.editTitle' : 'roles.newTitle')}</DialogTitle>
            <DialogDescription>{t('roles.subtitle')}</DialogDescription>
          </DialogHeader>
          <div className="form-grid">
            <label className="form-field">
              <span className="form-label">{t('common.name')}</span>
              <Input {...register('name')} />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </label>
            <label className="form-field">
              <span className="form-label">{t('common.code')}</span>
              <Input disabled={role?.code === 'admin'} {...register('code')} />
              {errors.code && <span className="form-error">{errors.code.message}</span>}
            </label>
          </div>
          <label className="form-field" style={{ marginTop: 16 }}>
            <span className="form-label">{t('common.description')}</span>
            <textarea className="ui-textarea" {...register('description')} />
            {errors.description && <span className="form-error">{errors.description.message}</span>}
          </label>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
            <Button disabled={pending} type="submit" variant="primary">
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

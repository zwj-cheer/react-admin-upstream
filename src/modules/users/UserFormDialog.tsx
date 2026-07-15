import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { User } from '@/core/services/contracts'
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
import { userFormSchema, type UserFormValues } from './schema'

export function UserFormDialog({
  open,
  user,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  user?: User
  pending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: UserFormValues) => Promise<void>
}) {
  const { t } = useTranslation()
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { name: '', email: '' },
  })

  useEffect(() => {
    reset({ name: user?.name ?? '', email: user?.email ?? '' })
  }, [reset, user, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t(user ? 'users.editTitle' : 'users.newTitle')}</DialogTitle>
            <DialogDescription>{t('users.subtitle')}</DialogDescription>
          </DialogHeader>
          <div className="form-grid">
            <label className="form-field">
              <span className="form-label">{t('common.name')}</span>
              <Input status={errors.name && 'error'} {...register('name')} />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </label>
            <label className="form-field">
              <span className="form-label">{t('common.email')}</span>
              <Input status={errors.email && 'error'} type="email" {...register('email')} />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </label>
          </div>
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

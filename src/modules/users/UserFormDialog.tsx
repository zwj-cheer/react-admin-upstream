import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { User } from '@/core/services/contracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
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
          <FieldGroup className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="user-name">{t('common.name')}</FieldLabel>
              <Input id="user-name" aria-invalid={Boolean(errors.name)} {...register('name')} />
              <FieldError>{errors.name?.message ? t(errors.name.message) : null}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="user-email">{t('common.email')}</FieldLabel>
              <Input
                id="user-email"
                aria-invalid={Boolean(errors.email)}
                type="email"
                {...register('email')}
              />
              <FieldError>{errors.email?.message ? t(errors.email.message) : null}</FieldError>
            </Field>
          </FieldGroup>
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

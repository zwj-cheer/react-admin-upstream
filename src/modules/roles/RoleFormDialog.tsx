import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { Role } from '@/core/services/contracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
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
          <FieldGroup className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="role-name">{t('common.name')}</FieldLabel>
              <Input id="role-name" aria-invalid={Boolean(errors.name)} {...register('name')} />
              <FieldError>{errors.name?.message ? t(errors.name.message) : null}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.code)}>
              <FieldLabel htmlFor="role-code">{t('common.code')}</FieldLabel>
              <Input
                id="role-code"
                disabled={role?.code === 'admin'}
                aria-invalid={Boolean(errors.code)}
                {...register('code')}
              />
              <FieldError>{errors.code?.message ? t(errors.code.message) : null}</FieldError>
            </Field>
            <Field
              className="col-span-2 max-md:col-span-1"
              data-invalid={Boolean(errors.description)}
            >
              <FieldLabel htmlFor="role-description">{t('common.description')}</FieldLabel>
              <Textarea
                id="role-description"
                aria-invalid={Boolean(errors.description)}
                {...register('description')}
              />
              <FieldError>
                {errors.description?.message ? t(errors.description.message) : null}
              </FieldError>
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

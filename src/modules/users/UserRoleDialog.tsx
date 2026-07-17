import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Role, User } from '@/core/services/contracts'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function UserRoleDialog({
  open,
  user,
  roles,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  user?: User
  roles: Role[]
  pending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (roleIds: string[]) => Promise<void>
}) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<string[]>(() => user?.roleIds ?? [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('users.roleTitle')}</DialogTitle>
          <DialogDescription>{user?.name}</DialogDescription>
        </DialogHeader>
        <FieldSet>
          <FieldLegend className="sr-only">{t('users.roleTitle')}</FieldLegend>
          <FieldGroup className="grid grid-cols-2 gap-2.5 max-md:grid-cols-1">
            {roles.map((role) => (
              <Field
                className="rounded-lg border border-[var(--border)] p-2.5"
                key={role.id}
                orientation="horizontal"
              >
                <Checkbox
                  id={`user-role-${role.id}`}
                  checked={selected.includes(role.id)}
                  onCheckedChange={(checked) =>
                    setSelected((current) =>
                      checked === true
                        ? [...new Set([...current, role.id])]
                        : current.filter((id) => id !== role.id),
                    )
                  }
                />
                <FieldLabel htmlFor={`user-role-${role.id}`}>{role.name}</FieldLabel>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button disabled={pending} variant="primary" onClick={() => void onSubmit(selected)}>
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

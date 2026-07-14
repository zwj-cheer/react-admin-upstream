import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Role, User } from '@/core/services/contracts'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
        <div className="capability-grid">
          {roles.map((role) => (
            <label className="capability-option" key={role.id}>
              <Checkbox
                checked={selected.includes(role.id)}
                onCheckedChange={(checked) =>
                  setSelected((current) =>
                    checked === true
                      ? [...new Set([...current, role.id])]
                      : current.filter((id) => id !== role.id),
                  )
                }
              />
              <span>{role.name}</span>
            </label>
          ))}
        </div>
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

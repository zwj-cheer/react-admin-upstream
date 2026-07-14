import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Role } from '@/core/services/contracts'
import { capabilityCatalog } from '@/core/permissions/capabilities'
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

export function RolePermissionDialog({
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
  onSubmit: (capabilities: string[]) => Promise<void>
}) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<string[]>(() => role?.capabilities ?? [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('roles.permissionTitle')}</DialogTitle>
          <DialogDescription>{role?.name}</DialogDescription>
        </DialogHeader>
        <div className="capability-grid">
          {capabilityCatalog.map((capability) => (
            <label className="capability-option" key={capability.key}>
              <Checkbox
                checked={selected.includes(capability.key)}
                disabled={role?.code === 'admin'}
                onCheckedChange={(checked) =>
                  setSelected((current) =>
                    checked === true
                      ? [...new Set([...current, capability.key])]
                      : current.filter((item) => item !== capability.key),
                  )
                }
              />
              <span>{t(capability.labelKey)}</span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button
            disabled={pending || role?.code === 'admin'}
            variant="primary"
            onClick={() => void onSubmit(selected)}
          >
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

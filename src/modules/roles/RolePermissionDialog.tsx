import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Role } from '@/core/services/contracts'
import { capabilityCatalog } from '@/core/permissions/capabilities'
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
        <FieldSet>
          <FieldLegend className="sr-only">{t('roles.permissionTitle')}</FieldLegend>
          <FieldGroup className="grid grid-cols-2 gap-2.5 max-md:grid-cols-1">
            {capabilityCatalog.map((capability) => (
              <Field
                className="rounded-lg border border-[var(--border)] p-2.5"
                key={capability.key}
                orientation="horizontal"
              >
                <Checkbox
                  id={`role-capability-${capability.key}`}
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
                <FieldLabel htmlFor={`role-capability-${capability.key}`}>
                  {t(capability.labelKey)}
                </FieldLabel>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
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

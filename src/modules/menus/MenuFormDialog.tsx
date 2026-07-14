import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { MenuItem } from '@/core/services/contracts'
import { useRouteRegistry } from '@/core/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { menuFormSchema, type MenuFormValues } from './schema'
import { flattenMenuTree, getDescendantIds } from './menuTree'

export function MenuFormDialog({
  open,
  menu,
  menus,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  menu?: MenuItem
  menus: MenuItem[]
  pending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: MenuFormValues) => Promise<void>
}) {
  const { t } = useTranslation()
  const routes = useRouteRegistry()
  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: { parentId: null, name: '', routeKey: 'users', icon: 'menu' },
  })
  const excludedParentIds = menu
    ? new Set([menu.id, ...getDescendantIds(menus, menu.id)])
    : new Set<string>()
  const parentOptions = flattenMenuTree(menus).filter((item) => !excludedParentIds.has(item.id))

  useEffect(() => {
    reset({
      parentId: menu?.parentId ?? null,
      name: menu?.name ?? '',
      routeKey: menu?.routeKey ?? 'users',
      icon: menu?.icon ?? 'menu',
    })
  }, [menu, open, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t(menu ? 'menus.editTitle' : 'menus.newTitle')}</DialogTitle>
            <DialogDescription>{t('menus.subtitle')}</DialogDescription>
          </DialogHeader>
          <div className="form-grid">
            <label className="form-field">
              <span className="form-label">{t('common.name')}</span>
              <Input {...register('name')} />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </label>
            <label className="form-field">
              <span className="form-label">{t('common.icon')}</span>
              <Input {...register('icon')} />
              {errors.icon && <span className="form-error">{errors.icon.message}</span>}
            </label>
            <label className="form-field">
              <span className="form-label">{t('common.route')}</span>
              <Select {...register('routeKey')}>
                {routes.map((route) => (
                  <option key={route.key} value={route.key}>
                    {t(route.titleKey)}
                  </option>
                ))}
              </Select>
            </label>
            <label className="form-field">
              <span className="form-label">{t('common.parent')}</span>
              <Controller
                control={control}
                name="parentId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value || null)}
                  >
                    <option value="">{t('common.rootMenu')}</option>
                    {parentOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {'—'.repeat(item.depth)} {item.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
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

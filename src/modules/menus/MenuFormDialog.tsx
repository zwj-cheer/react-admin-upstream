import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { MenuItem } from '@/core/services/contracts'
import { useRouteRegistry } from '@/core/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const ROOT_MENU_VALUE = '__root__'

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
          <FieldGroup className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="menu-name">{t('common.name')}</FieldLabel>
              <Input id="menu-name" aria-invalid={Boolean(errors.name)} {...register('name')} />
              <FieldError>{errors.name?.message ? t(errors.name.message) : null}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.icon)}>
              <FieldLabel htmlFor="menu-icon">{t('common.icon')}</FieldLabel>
              <Input id="menu-icon" aria-invalid={Boolean(errors.icon)} {...register('icon')} />
              <FieldError>{errors.icon?.message ? t(errors.icon.message) : null}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="menu-route">{t('common.route')}</FieldLabel>
              <Controller
                control={control}
                name="routeKey"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="menu-route" aria-label={t('common.route')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {routes.map((route) => (
                          <SelectItem key={route.key} value={route.key}>
                            {t(route.titleKey)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="menu-parent">{t('common.parent')}</FieldLabel>
              <Controller
                control={control}
                name="parentId"
                render={({ field }) => {
                  return (
                    <Select
                      value={field.value ?? ROOT_MENU_VALUE}
                      onValueChange={(value) =>
                        field.onChange(value === ROOT_MENU_VALUE ? null : value)
                      }
                    >
                      <SelectTrigger id="menu-parent" aria-label={t('common.parent')}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={ROOT_MENU_VALUE}>{t('common.rootMenu')}</SelectItem>
                          {parentOptions.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {`${'—'.repeat(item.depth)} ${item.name}`.trim()}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )
                }}
              />
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

import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { MenuItem } from '@/core/services/contracts'
import { useRouteRegistry } from '@/core/routing'
import { Can } from '@/core/permissions/Can'
import { capabilities } from '@/core/permissions/capabilities'
import { IconSprite } from '@/components/IconSprite'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { AsyncState } from '@/components/common/AsyncState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import {
  useCreateMenu,
  useMenus,
  useMoveMenu,
  useRemoveMenu,
  useSetMenuStatus,
  useUpdateMenu,
} from './queries'
import { MenuFormDialog } from './MenuFormDialog'
import { MenuOrderControls } from './MenuOrderControls'
import { flattenMenuTree, type MenuTreeRow } from './menuTree'

export function MenuTreePage() {
  const { t } = useTranslation()
  const routes = useRouteRegistry()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState<MenuItem>()
  const menus = useMenus()
  const createMenu = useCreateMenu()
  const updateMenu = useUpdateMenu()
  const removeMenu = useRemoveMenu()
  const setStatus = useSetMenuStatus()
  const moveMenu = useMoveMenu()
  const notifyFailure = () => toast.error(t('common.operationFailed'))
  const items = menus.data ?? []
  const rows = flattenMenuTree(items)
  const knownRouteKeys = new Set(routes.map((route) => route.key))

  const columns: DataTableColumn<MenuTreeRow>[] = [
    {
      key: 'menu',
      header: t('common.name'),
      cell: (menu) => (
        <div
          className="menu-tree-name"
          style={{ paddingInlineStart: menu.depth ? menu.depth * 22 : undefined }}
        >
          <IconSprite name={menu.icon} />
          <div>
            <div className="row-primary">{menu.name}</div>
            <div className="row-secondary">{menu.routeKey}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'route',
      header: t('common.route'),
      cell: (menu) =>
        knownRouteKeys.has(menu.routeKey) ? (
          routes.find((route) => route.key === menu.routeKey)?.path
        ) : (
          <span className="status-badge" data-status="disabled">
            {t('menus.unknownRoute')}
          </span>
        ),
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (menu) => (
        <div className="row-actions">
          <span className="status-badge" data-status={menu.status}>
            {t(menu.status === 'active' ? 'common.enabled' : 'common.disabled')}
          </span>
          <Can capability={capabilities.menus.toggle}>
            <Switch
              aria-label={`${menu.name} ${t('common.status')}`}
              checked={menu.status === 'active'}
              disabled={setStatus.isPending}
              onCheckedChange={(checked) =>
                void setStatus
                  .mutateAsync({ id: menu.id, status: checked ? 'active' : 'disabled' })
                  .then(() => toast.success(t('common.operationSuccess')), notifyFailure)
              }
            />
          </Can>
        </div>
      ),
    },
    {
      key: 'order',
      header: t('common.order'),
      cell: (menu) => (
        <Can capability={capabilities.menus.order} fallback={menu.order}>
          <MenuOrderControls
            disabled={moveMenu.isPending}
            first={menu.first}
            last={menu.last}
            onMove={(direction) =>
              void moveMenu
                .mutateAsync({ id: menu.id, direction })
                .then(() => toast.success(t('common.operationSuccess')), notifyFailure)
            }
          />
        </Can>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      cell: (menu) => (
        <div className="row-actions">
          <Can capability={capabilities.menus.update}>
            <Button
              size="sm"
              onClick={() => {
                setSelectedMenu(menu)
                setFormOpen(true)
              }}
            >
              <Pencil size={14} />
              {t('common.edit')}
            </Button>
          </Can>
          <Can capability={capabilities.menus.remove}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedMenu(menu)
                setDeleteOpen(true)
              }}
            >
              <Trash2 size={14} />
              {t('common.delete')}
            </Button>
          </Can>
        </div>
      ),
    },
  ]

  return (
    <section className="page-section">
      <div className="page-toolbar" style={{ justifyContent: 'flex-end' }}>
        <Can capability={capabilities.menus.create}>
          <Button
            variant="primary"
            onClick={() => {
              setSelectedMenu(undefined)
              setFormOpen(true)
            }}
          >
            <Plus size={15} />
            {t('common.add')}
          </Button>
        </Can>
      </div>

      <AsyncState
        empty={!items.length}
        error={menus.isError}
        loading={menus.isLoading}
        onRetry={() => void menus.refetch()}
      >
        <DataTable columns={columns} getKey={(menu) => menu.id} items={rows} />
      </AsyncState>

      <MenuFormDialog
        menu={selectedMenu}
        menus={items}
        open={formOpen}
        pending={createMenu.isPending || updateMenu.isPending}
        onOpenChange={setFormOpen}
        onSubmit={async (values) => {
          try {
            if (selectedMenu) {
              await updateMenu.mutateAsync({ id: selectedMenu.id, input: values })
            } else {
              await createMenu.mutateAsync(values)
            }
            setFormOpen(false)
            toast.success(t('common.operationSuccess'))
          } catch {
            notifyFailure()
          }
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        pending={removeMenu.isPending}
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          if (!selectedMenu) return
          try {
            await removeMenu.mutateAsync(selectedMenu.id)
            setDeleteOpen(false)
            toast.success(t('common.operationSuccess'))
          } catch {
            notifyFailure()
          }
        }}
      />
    </section>
  )
}

import { useState } from 'react'
import { KeyRound, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { Role } from '@/core/services/contracts'
import { capabilities } from '@/core/permissions/capabilities'
import { Can } from '@/core/permissions/Can'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { AsyncState } from '@/components/common/AsyncState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { Pagination } from '@/components/common/Pagination'
import {
  useCreateRole,
  useRemoveRole,
  useRoles,
  useSetRoleCapabilities,
  useSetRoleStatus,
  useUpdateRole,
} from './queries'
import { RoleFormDialog } from './RoleFormDialog'
import { RolePermissionDialog } from './RolePermissionDialog'

export function RoleListPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [permissionOpen, setPermissionOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>()
  const roles = useRoles({ query, page, pageSize: 8 })
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const removeRole = useRemoveRole()
  const setStatus = useSetRoleStatus()
  const setCapabilities = useSetRoleCapabilities()
  const notifyFailure = () => toast.error(t('common.operationFailed'))

  const columns: DataTableColumn<Role>[] = [
    {
      key: 'role',
      header: t('common.name'),
      cell: (role) => (
        <div>
          <div className="row-primary">{role.name}</div>
          <div className="row-secondary">{role.description}</div>
        </div>
      ),
    },
    { key: 'code', header: t('common.code'), cell: (role) => role.code },
    {
      key: 'users',
      header: t('roles.userCount'),
      cell: (role) => role.userCount,
    },
    {
      key: 'permissions',
      header: t('common.permissions'),
      cell: (role) => role.capabilities.length,
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (role) => (
        <div className="row-actions">
          <span className="status-badge" data-status={role.status}>
            {t(role.status === 'active' ? 'common.enabled' : 'common.disabled')}
          </span>
          <Can capability={capabilities.roles.toggle}>
            <Switch
              aria-label={`${role.name} ${t('common.status')}`}
              checked={role.status === 'active'}
              disabled={role.code === 'admin' || setStatus.isPending}
              onCheckedChange={(checked) =>
                void setStatus
                  .mutateAsync({ id: role.id, status: checked ? 'active' : 'disabled' })
                  .then(() => toast.success(t('common.operationSuccess')), notifyFailure)
              }
            />
          </Can>
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      cell: (role) => (
        <div className="row-actions">
          <Can capability={capabilities.roles.update}>
            <Button
              size="sm"
              onClick={() => {
                setSelectedRole(role)
                setFormOpen(true)
              }}
            >
              <Pencil size={14} />
              {t('common.edit')}
            </Button>
          </Can>
          <Can capability={capabilities.roles.permissions}>
            <Button
              size="sm"
              onClick={() => {
                setSelectedRole(role)
                setPermissionOpen(true)
              }}
            >
              <KeyRound size={14} />
              {t('common.permissions')}
            </Button>
          </Can>
          <Can capability={capabilities.roles.remove}>
            <Button
              disabled={role.code === 'admin'}
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedRole(role)
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
      <div className="page-toolbar">
        <label className="toolbar-search">
          <Search className="toolbar-search__icon" size={15} />
          <Input
            aria-label={t('common.search')}
            placeholder={t('roles.searchPlaceholder')}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
          />
        </label>
        <Can capability={capabilities.roles.create}>
          <Button
            variant="primary"
            onClick={() => {
              setSelectedRole(undefined)
              setFormOpen(true)
            }}
          >
            <Plus size={15} />
            {t('common.add')}
          </Button>
        </Can>
      </div>

      <AsyncState
        empty={!roles.data?.items.length}
        error={roles.isError}
        loading={roles.isLoading}
        onRetry={() => void roles.refetch()}
      >
        <DataTable columns={columns} getKey={(role) => role.id} items={roles.data?.items ?? []} />
        <Pagination
          onChange={setPage}
          page={roles.data?.page ?? page}
          pageSize={roles.data?.pageSize ?? 8}
          total={roles.data?.total ?? 0}
        />
      </AsyncState>

      <RoleFormDialog
        open={formOpen}
        pending={createRole.isPending || updateRole.isPending}
        role={selectedRole}
        onOpenChange={setFormOpen}
        onSubmit={async (values) => {
          try {
            if (selectedRole) {
              await updateRole.mutateAsync({ id: selectedRole.id, input: values })
            } else {
              await createRole.mutateAsync(values)
            }
            setFormOpen(false)
            toast.success(t('common.operationSuccess'))
          } catch {
            notifyFailure()
          }
        }}
      />
      <RolePermissionDialog
        key={(selectedRole?.id ?? 'none') + '-' + permissionOpen}
        open={permissionOpen}
        pending={setCapabilities.isPending}
        role={selectedRole}
        onOpenChange={setPermissionOpen}
        onSubmit={async (nextCapabilities) => {
          if (!selectedRole) return
          try {
            await setCapabilities.mutateAsync({
              id: selectedRole.id,
              capabilities: nextCapabilities,
            })
            setPermissionOpen(false)
            toast.success(t('common.operationSuccess'))
          } catch {
            notifyFailure()
          }
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        pending={removeRole.isPending}
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          if (!selectedRole) return
          try {
            const returnToPreviousPage = page > 1 && roles.data?.items.length === 1
            await removeRole.mutateAsync(selectedRole.id)
            if (returnToPreviousPage) setPage((current) => Math.max(1, current - 1))
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

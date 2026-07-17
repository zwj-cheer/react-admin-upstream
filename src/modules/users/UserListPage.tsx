import { useMemo, useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { User } from '@/core/services/contracts'
import { formatDate } from '@/core/datetime'
import { Can } from '@/core/permissions/Can'
import { capabilities } from '@/core/permissions/capabilities'
import { useListSearchParams } from '@/core/routing'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Switch } from '@/components/ui/switch'
import { Tag } from '@/components/ui/tag'
import { AsyncState } from '@/components/common/AsyncState'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { Pagination } from '@/components/ui/pagination'
import { ROLE_OPTIONS_PAGE_SIZE, useRoles } from '@/modules/roles/queries'
import {
  USER_LIST_PAGE_SIZE,
  useAssignUserRoles,
  useCreateUser,
  useSetUserStatus,
  useUpdateUser,
  useUsers,
} from './queries'
import { UserFormDialog } from './UserFormDialog'
import { UserRoleDialog } from './UserRoleDialog'

export function UserListPage() {
  const { t } = useTranslation()
  const { query, page, setQuery, setPage } = useListSearchParams()
  const [formOpen, setFormOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User>()
  const users = useUsers({ query, page, pageSize: USER_LIST_PAGE_SIZE })
  const roles = useRoles({ page: 1, pageSize: ROLE_OPTIONS_PAGE_SIZE })
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const setStatus = useSetUserStatus()
  const assignRoles = useAssignUserRoles()
  const notifyFailure = () => toast.error(t('common.operationFailed'))

  const roleNames = useMemo(
    () => new Map(roles.data?.items.map((role) => [role.id, role.name]) ?? []),
    [roles.data],
  )

  const columns: DataTableColumn<User>[] = [
    {
      key: 'user',
      header: t('common.name'),
      cell: (user) => (
        <div>
          <div className="row-primary">{user.name}</div>
          <div className="row-secondary">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: t('common.roles'),
      cell: (user) => user.roleIds.map((id) => roleNames.get(id) ?? id).join(' · ') || '—',
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (user) => (
        <div className="row-actions">
          <Tag color={user.status === 'active' ? 'green' : 'red'} dot>
            {t(user.status === 'active' ? 'common.enabled' : 'common.disabled')}
          </Tag>
          <Can capability={capabilities.users.toggle}>
            <Switch
              aria-label={`${user.name} ${t('common.status')}`}
              checked={user.status === 'active'}
              disabled={setStatus.isPending}
              onCheckedChange={(checked) =>
                void setStatus
                  .mutateAsync({ id: user.id, status: checked ? 'active' : 'disabled' })
                  .then(() => toast.success(t('common.operationSuccess')), notifyFailure)
              }
            />
          </Can>
        </div>
      ),
    },
    {
      key: 'created',
      header: t('common.createdAt'),
      cell: (user) => formatDate(user.createdAt),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      cell: (user) => (
        <div className="row-actions">
          <Can capability={capabilities.users.update}>
            <Button
              size="sm"
              onClick={() => {
                setSelectedUser(user)
                setFormOpen(true)
              }}
            >
              <Icon name="pencil" size={14} />
              {t('common.edit')}
            </Button>
          </Can>
          <Can capability={capabilities.users.assignRole}>
            <Button
              size="sm"
              onClick={() => {
                setSelectedUser(user)
                setRoleOpen(true)
              }}
            >
              <Icon name="shield-check" size={14} />
              {t('common.roles')}
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
          <InputGroup>
            <InputGroupAddon>
              <Icon name="search" size={16} />
            </InputGroupAddon>
            <InputGroupInput
              aria-label={t('common.search')}
              placeholder={t('users.searchPlaceholder')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton aria-label={t('common.clear')} onClick={() => setQuery('')}>
                  <Icon name="x" size={14} />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
        </label>
        <Can capability={capabilities.users.create}>
          <Button
            variant="primary"
            onClick={() => {
              setSelectedUser(undefined)
              setFormOpen(true)
            }}
          >
            <Icon name="plus" size={16} />
            {t('common.add')}
          </Button>
        </Can>
      </div>

      <AsyncState
        empty={!users.data?.items.length}
        error={users.isError}
        loading={users.isLoading}
        onRetry={() => void users.refetch()}
      >
        <DataTable columns={columns} getKey={(user) => user.id} items={users.data?.items ?? []} />
        <Pagination
          className="mt-4"
          current={users.data?.page ?? page}
          pageSize={users.data?.pageSize ?? USER_LIST_PAGE_SIZE}
          total={users.data?.total ?? 0}
          onChange={setPage}
        />
      </AsyncState>

      <UserFormDialog
        open={formOpen}
        pending={createUser.isPending || updateUser.isPending}
        user={selectedUser}
        onOpenChange={setFormOpen}
        onSubmit={async (values) => {
          try {
            if (selectedUser) {
              await updateUser.mutateAsync({
                id: selectedUser.id,
                input: { ...values, roleIds: selectedUser.roleIds },
              })
            } else {
              await createUser.mutateAsync({ ...values, roleIds: [] })
            }
            setFormOpen(false)
            toast.success(t('common.operationSuccess'))
          } catch {
            notifyFailure()
          }
        }}
      />
      <UserRoleDialog
        key={(selectedUser?.id ?? 'none') + '-' + roleOpen}
        open={roleOpen}
        pending={assignRoles.isPending}
        roles={roles.data?.items ?? []}
        user={selectedUser}
        onOpenChange={setRoleOpen}
        onSubmit={async (roleIds) => {
          if (!selectedUser) return
          try {
            await assignRoles.mutateAsync({ id: selectedUser.id, roleIds })
            setRoleOpen(false)
            toast.success(t('common.operationSuccess'))
          } catch {
            notifyFailure()
          }
        }}
      />
    </section>
  )
}

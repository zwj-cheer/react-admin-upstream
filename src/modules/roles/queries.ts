import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  Capability,
  EntityStatus,
  ListParams,
  RoleInput,
  Services,
} from '@/core/services/contracts'
import { useServices } from '@/core/services/useServices'

export const ROLE_LIST_PAGE_SIZE = 8
export const ROLE_OPTIONS_PAGE_SIZE = 100

export const roleKeys = {
  all: ['roles'] as const,
  list: (params: ListParams) => [...roleKeys.all, 'list', params] as const,
}

/** 可被组件、路由 loader 与预取逻辑共同复用的角色列表查询配置。 */
export function rolesQueryOptions(services: Services, params: ListParams) {
  return queryOptions({
    queryKey: roleKeys.list(params),
    queryFn: ({ signal }) => services.roles.list(params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useRoles(params: ListParams) {
  const services = useServices()
  return useQuery(rolesQueryOptions(services, params))
}

function useRoleMutation<T>(mutationFn: (input: T) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roleKeys.all }),
  })
}

export function useCreateRole() {
  const services = useServices()
  return useRoleMutation((input: RoleInput) => services.roles.create(input))
}

export function useUpdateRole() {
  const services = useServices()
  return useRoleMutation(({ id, input }: { id: string; input: RoleInput }) =>
    services.roles.update(id, input),
  )
}

export function useRemoveRole() {
  const services = useServices()
  return useRoleMutation((id: string) => services.roles.remove(id))
}

export function useSetRoleStatus() {
  const services = useServices()
  return useRoleMutation(({ id, status }: { id: string; status: EntityStatus }) =>
    services.roles.setStatus(id, status),
  )
}

export function useSetRoleCapabilities() {
  const services = useServices()
  return useRoleMutation(({ id, capabilities }: { id: string; capabilities: Capability[] }) =>
    services.roles.setCapabilities(id, capabilities),
  )
}

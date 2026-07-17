import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { EntityStatus, ListParams, Services, UserInput } from '@/core/services/contracts'
import { useServices } from '@/core/services/useServices'
import { roleKeys } from '@/modules/roles/queries'

export const USER_LIST_PAGE_SIZE = 8

export const userKeys = {
  all: ['users'] as const,
  list: (params: ListParams) => [...userKeys.all, 'list', params] as const,
}

/** 可被组件、路由 loader 与预取逻辑共同复用的用户列表查询配置。 */
export function usersQueryOptions(services: Services, params: ListParams) {
  return queryOptions({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) => services.users.list(params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useUsers(params: ListParams) {
  const services = useServices()
  return useQuery(usersQueryOptions(services, params))
}

export function useCreateUser() {
  const services = useServices()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UserInput) => services.users.create(input),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
        queryClient.invalidateQueries({ queryKey: roleKeys.all }),
      ]),
  })
}

export function useUpdateUser() {
  const services = useServices()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UserInput }) =>
      services.users.update(id, input),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
        queryClient.invalidateQueries({ queryKey: roleKeys.all }),
      ]),
  })
}

export function useSetUserStatus() {
  const services = useServices()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EntityStatus }) =>
      services.users.setStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useAssignUserRoles() {
  const services = useServices()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      services.users.assignRoles(id, roleIds),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
        queryClient.invalidateQueries({ queryKey: roleKeys.all }),
      ]),
  })
}

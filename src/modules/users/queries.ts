import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { EntityStatus, ListParams, UserInput } from '@/core/services/contracts'
import { useServices } from '@/core/services/useServices'

export function useUsers(params: ListParams) {
  const services = useServices()
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => services.users.list(params),
  })
}

export function useCreateUser() {
  const services = useServices()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UserInput) => services.users.create(input),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['roles'] }),
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
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['roles'] }),
      ]),
  })
}

export function useSetUserStatus() {
  const services = useServices()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EntityStatus }) =>
      services.users.setStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
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
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['roles'] }),
      ]),
  })
}

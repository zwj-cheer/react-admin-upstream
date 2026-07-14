import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Capability, EntityStatus, ListParams, RoleInput } from '@/core/services/contracts'
import { useServices } from '@/core/services/useServices'

export function useRoles(params: ListParams) {
  const services = useServices()
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => services.roles.list(params),
  })
}

function useRoleMutation<T>(mutationFn: (input: T) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
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

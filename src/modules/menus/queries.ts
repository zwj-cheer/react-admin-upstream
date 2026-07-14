import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { EntityStatus, MenuInput } from '@/core/services/contracts'
import { useServices } from '@/core/services/useServices'

export function useMenus() {
  const services = useServices()
  return useQuery({
    queryKey: ['menus'],
    queryFn: () => services.menus.list(),
  })
}

function useMenuMutation<T>(mutationFn: (input: T) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menus'] }),
  })
}

export function useCreateMenu() {
  const services = useServices()
  return useMenuMutation((input: MenuInput) => services.menus.create(input))
}

export function useUpdateMenu() {
  const services = useServices()
  return useMenuMutation(({ id, input }: { id: string; input: MenuInput }) =>
    services.menus.update(id, input),
  )
}

export function useRemoveMenu() {
  const services = useServices()
  return useMenuMutation((id: string) => services.menus.remove(id))
}

export function useSetMenuStatus() {
  const services = useServices()
  return useMenuMutation(({ id, status }: { id: string; status: EntityStatus }) =>
    services.menus.setStatus(id, status),
  )
}

export function useMoveMenu() {
  const services = useServices()
  return useMenuMutation(({ id, direction }: { id: string; direction: 'up' | 'down' }) =>
    services.menus.move(id, direction),
  )
}

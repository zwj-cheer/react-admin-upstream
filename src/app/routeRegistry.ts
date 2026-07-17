import { parseListSearchParams, type RegisteredRoute } from '@/core/routing'
import { capabilities } from '@/core/permissions/capabilities'
import { projectRoutes } from '@/project/routes'
import type { ShouldRevalidateFunction } from 'react-router'

export type { RegisteredRoute } from '@/core/routing'

/** 列表查询由 TanStack Query 响应 URL 搜索参数变化，避免重复阻塞式执行 route loader。 */
export const shouldRevalidateListRoute: ShouldRevalidateFunction = ({
  currentUrl,
  defaultShouldRevalidate,
  nextUrl,
}) =>
  currentUrl.pathname === nextUrl.pathname && currentUrl.search !== nextUrl.search
    ? false
    : defaultShouldRevalidate

export const templateRoutes: RegisteredRoute[] = [
  {
    key: 'users',
    path: '/users',
    titleKey: 'users.title',
    subtitleKey: 'users.subtitle',
    icon: 'users',
    capability: capabilities.users.read,
    lazy: () => import('@/modules/users/routes'),
    preload: async ({ queryClient, request, services }) => {
      const [{ USER_LIST_PAGE_SIZE, usersQueryOptions }, roles] = await Promise.all([
        import('@/modules/users/queries'),
        import('@/modules/roles/queries'),
      ])
      const { query, page } = parseListSearchParams(new URL(request.url).searchParams)
      await Promise.all([
        queryClient.ensureQueryData(
          usersQueryOptions(services, { query, page, pageSize: USER_LIST_PAGE_SIZE }),
        ),
        queryClient.ensureQueryData(
          roles.rolesQueryOptions(services, {
            page: 1,
            pageSize: roles.ROLE_OPTIONS_PAGE_SIZE,
          }),
        ),
      ])
    },
    shouldRevalidate: shouldRevalidateListRoute,
  },
  {
    key: 'roles',
    path: '/roles',
    titleKey: 'roles.title',
    subtitleKey: 'roles.subtitle',
    icon: 'shield-check',
    capability: capabilities.roles.read,
    lazy: () => import('@/modules/roles/routes'),
    preload: async ({ queryClient, request, services }) => {
      const { ROLE_LIST_PAGE_SIZE, rolesQueryOptions } = await import('@/modules/roles/queries')
      const { query, page } = parseListSearchParams(new URL(request.url).searchParams)
      await queryClient.ensureQueryData(
        rolesQueryOptions(services, { query, page, pageSize: ROLE_LIST_PAGE_SIZE }),
      )
    },
    shouldRevalidate: shouldRevalidateListRoute,
  },
  {
    key: 'menus',
    path: '/menus',
    titleKey: 'menus.title',
    subtitleKey: 'menus.subtitle',
    icon: 'menu',
    capability: capabilities.menus.read,
    lazy: () => import('@/modules/menus/routes'),
  },
]

export function createRouteRegistry(extensions: readonly RegisteredRoute[]): RegisteredRoute[] {
  return [...templateRoutes, ...extensions]
}

export const registeredRoutes = createRouteRegistry(projectRoutes)

import { QueryClient } from '@tanstack/react-query'
import type { ShouldRevalidateFunctionArgs } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { PageResult, Role, Services, User } from '@/core/services/contracts'
import { roleKeys, ROLE_OPTIONS_PAGE_SIZE } from '@/modules/roles/queries'
import { userKeys, USER_LIST_PAGE_SIZE } from '@/modules/users/queries'
import type { RegisteredRoute } from './routeRegistry'
import { createRouteRegistry, shouldRevalidateListRoute, templateRoutes } from './routeRegistry'

function ProjectPage() {
  return null
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

function revalidationArgs(
  currentUrl: string,
  nextUrl: string,
  defaultShouldRevalidate = true,
): ShouldRevalidateFunctionArgs {
  return {
    currentParams: {},
    currentUrl: new URL(currentUrl),
    defaultShouldRevalidate,
    nextParams: {},
    nextUrl: new URL(nextUrl),
  }
}

describe('createRouteRegistry', () => {
  it('appends typed downstream routes to the template registry', () => {
    const projectRoute: RegisteredRoute = {
      key: 'reports',
      path: '/reports',
      titleKey: 'reports.title',
      subtitleKey: 'reports.subtitle',
      icon: 'chart',
      capability: 'reports:read',
      lazy: async () => ({ Component: ProjectPage }),
    }

    const routes = createRouteRegistry([projectRoute])

    expect(routes.map((route) => route.key)).toEqual(['users', 'roles', 'menus', 'reports'])
    expect(routes.at(-1)).toBe(projectRoute)
  })

  it('preloads user and role data in parallel with URL-derived query keys', async () => {
    const usersResult = deferred<PageResult<User>>()
    const rolesResult = deferred<PageResult<Role>>()
    const listUsers = vi.fn<Services['users']['list']>(() => usersResult.promise)
    const listRoles = vi.fn<Services['roles']['list']>(() => rolesResult.promise)
    const services = {
      users: { list: listUsers },
      roles: { list: listRoles },
    } as unknown as Services
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const usersRoute = templateRoutes.find((route) => route.key === 'users')
    const userParams = { query: 'alice', page: 3, pageSize: USER_LIST_PAGE_SIZE }
    const roleParams = { page: 1, pageSize: ROLE_OPTIONS_PAGE_SIZE }

    const preload = usersRoute?.preload?.({
      queryClient,
      request: new Request('http://localhost/users?q=alice&page=3'),
      services,
    })

    await vi.waitFor(() => {
      expect(listUsers).toHaveBeenCalledTimes(1)
      expect(listRoles).toHaveBeenCalledTimes(1)
    })
    expect(listUsers.mock.calls[0]?.[0]).toEqual(userParams)
    expect(listRoles.mock.calls[0]?.[0]).toEqual(roleParams)

    const usersPage: PageResult<User> = {
      items: [],
      page: 3,
      pageSize: USER_LIST_PAGE_SIZE,
      total: 0,
    }
    const rolesPage: PageResult<Role> = {
      items: [],
      page: 1,
      pageSize: ROLE_OPTIONS_PAGE_SIZE,
      total: 0,
    }
    usersResult.resolve(usersPage)
    rolesResult.resolve(rolesPage)
    await preload

    expect(queryClient.getQueryData(userKeys.list(userParams))).toBe(usersPage)
    expect(queryClient.getQueryData(roleKeys.list(roleParams))).toBe(rolesPage)
  })

  it('lets component queries handle same-path search changes without rerunning the loader', () => {
    expect(
      shouldRevalidateListRoute(
        revalidationArgs(
          'http://localhost/users?q=alice&page=2',
          'http://localhost/users?q=bob&page=1',
        ),
      ),
    ).toBe(false)
    expect(
      shouldRevalidateListRoute(
        revalidationArgs('http://localhost/users', 'http://localhost/roles'),
      ),
    ).toBe(true)
    expect(
      shouldRevalidateListRoute(
        revalidationArgs('http://localhost/users', 'http://localhost/users', false),
      ),
    ).toBe(false)
  })
})

import type { RegisteredRoute } from '@/core/routing'
import { getAuthorizedRoutes } from '@/core/routing'
import type { MenuItem, Session } from '@/core/services/contracts'
import { flattenMenuTree } from '@/modules/menus/menuTree'

export interface MenuNavigationItem {
  menuId: string
  depth: number
  route: RegisteredRoute
}

export function getMenuNavigation(
  routes: readonly RegisteredRoute[],
  session: Session | undefined,
  menus: readonly MenuItem[],
): MenuNavigationItem[] {
  const routesByKey = new Map(
    getAuthorizedRoutes(routes, session).map((route) => [route.key, route]),
  )
  const includedRouteKeys = new Set<string>()
  const navigation: MenuNavigationItem[] = []

  for (const menu of flattenMenuTree(menus)) {
    const route = menu.status === 'active' ? routesByKey.get(menu.routeKey) : undefined
    if (!route || includedRouteKeys.has(route.key)) continue

    includedRouteKeys.add(route.key)
    navigation.push({ menuId: menu.id, depth: menu.depth, route })
  }

  return navigation
}

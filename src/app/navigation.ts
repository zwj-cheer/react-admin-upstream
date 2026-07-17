import type { RegisteredRoute } from '@/core/routing'
import { getAuthorizedRoutes } from '@/core/routing'
import type { MenuItem, Session } from '@/core/services/contracts'
import type { ShellNavigationItem } from '@/layouts/types'
import { flattenMenuTree } from '@/modules/menus/menuTree'

/**
 * 在 app 组合层把后端菜单、权限会话与编译期路由注册表合并为纯展示导航模型。
 * layouts 只接收结果，不直接依赖菜单业务模块或数据请求。
 */
export function getMenuNavigation(
  routes: readonly RegisteredRoute[],
  session: Session | undefined,
  menus: readonly MenuItem[],
): ShellNavigationItem[] {
  const routesByKey = new Map(
    getAuthorizedRoutes(routes, session).map((route) => [route.key, route]),
  )
  const includedRouteKeys = new Set<string>()
  const navigation: ShellNavigationItem[] = []

  for (const menu of flattenMenuTree(menus)) {
    const route = menu.status === 'active' ? routesByKey.get(menu.routeKey) : undefined
    if (!route || includedRouteKeys.has(route.key)) continue

    includedRouteKeys.add(route.key)
    navigation.push({ menuId: menu.id, depth: menu.depth, route })
  }

  return navigation
}

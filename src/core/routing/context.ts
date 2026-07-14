import { createContext, useContext, useMemo } from 'react'
import type { Session } from '@/core/services/contracts'
import {
  findRouteByPath,
  getAuthorizedRoutes,
  resolvePostLoginPath,
  type RegisteredRoute,
} from './registry'

export const RouteRegistryContext = createContext<readonly RegisteredRoute[] | null>(null)

/** 读取当前路由表；必须在 `RouteRegistryProvider` 内使用。 */
export function useRouteRegistry(): readonly RegisteredRoute[] {
  const routes = useContext(RouteRegistryContext)
  if (routes === null) {
    throw new Error('useRouteRegistry must be used within a RouteRegistryProvider')
  }
  return routes
}

/** 按路径匹配当前注册路由（支持动态段）。 */
export function useMatchedRoute(pathname: string): RegisteredRoute | undefined {
  const routes = useRouteRegistry()
  return useMemo(() => findRouteByPath(routes, pathname), [routes, pathname])
}

/** 返回当前会话有权访问的路由。 */
export function useAuthorizedRoutes(session: Session | undefined): RegisteredRoute[] {
  const routes = useRouteRegistry()
  return useMemo(() => getAuthorizedRoutes(routes, session), [routes, session])
}

/** 返回一个绑定当前路由表的登录后跳转解析器。 */
export function useResolvePostLoginPath(): (session: Session, returnTo?: string | null) => string {
  const routes = useRouteRegistry()
  return useMemo(
    () => (session: Session, returnTo?: string | null) =>
      resolvePostLoginPath(routes, session, returnTo),
    [routes],
  )
}

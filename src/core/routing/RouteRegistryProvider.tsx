import type { PropsWithChildren } from 'react'
import type { RegisteredRoute } from './registry'
import { RouteRegistryContext } from './context'

/** {@link RouteRegistryProvider} 的属性。 */
export interface RouteRegistryProviderProps {
  /** 组装完成的路由表（模板路由 + 项目路由），由 `src/app` 注入。 */
  routes: readonly RegisteredRoute[]
}

/**
 * 向下提供已注册路由表。放在 `src/app` 装配层，`layouts`/`modules`
 * 通过 `useRouteRegistry` 等 hook 消费，避免直接依赖 app 层单例。
 */
export function RouteRegistryProvider({
  routes,
  children,
}: PropsWithChildren<RouteRegistryProviderProps>) {
  return <RouteRegistryContext value={routes}>{children}</RouteRegistryContext>
}

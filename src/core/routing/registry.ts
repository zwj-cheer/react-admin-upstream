import type { ComponentType } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import type { ShouldRevalidateFunction } from 'react-router'
import { matchPath } from 'react-router'
import type { Services, Session } from '@/core/services/contracts'
import { authorize } from '@/core/permissions/authorize'

/** 注册路由按需加载的模块形态。 */
export interface RegisteredRouteModule {
  /** 路由页面组件。 */
  Component: ComponentType
  /** 可选的页面级错误边界。 */
  ErrorBoundary?: ComponentType
}

/** 注册路由 loader 可用的应用级基础设施。 */
export interface RegisteredRoutePreloadContext {
  /** 当前导航请求，可读取 URL 与 AbortSignal。 */
  request: Request
  /** 应用唯一的 TanStack Query 缓存。 */
  queryClient: QueryClient
  /** 后端无关服务端口。 */
  services: Services
}

/** 单条已注册路由的元数据，模板与下游项目共用同一份结构。 */
export interface RegisteredRoute {
  /** 路由稳定标识，供菜单 `routeKey` 关联，跨版本不应变化。 */
  key: string
  /**
   * react-router 风格的路径，可包含动态段（如 `/users/:id`）。
   * 匹配统一走 {@link findRouteByPath}，请勿在别处用字符串全等比较。
   */
  path: string
  /** 页面标题的 i18n 键。 */
  titleKey: string
  /** 页面副标题的 i18n 键。 */
  subtitleKey: string
  /** 图标 sprite 名称。 */
  icon: string
  /** 访问该路由所需的能力标识。 */
  capability: string
  /** 按需加载 route module；路径必须保持静态可分析。 */
  lazy: () => Promise<RegisteredRouteModule>
  /** 可选的数据预取；由 app 层转换为 React Router loader。 */
  preload?: (context: RegisteredRoutePreloadContext) => Promise<unknown>
  /** 可选的 loader 重验证策略。 */
  shouldRevalidate?: ShouldRevalidateFunction
}

/**
 * 按 react-router 语义匹配路径，支持 `/users/:id` 等动态段。
 * 命中多条时返回列表中第一条（与注册顺序一致）。
 */
export function findRouteByPath(
  routes: readonly RegisteredRoute[],
  pathname: string,
): RegisteredRoute | undefined {
  return routes.find((route) => matchPath({ path: route.path, end: true }, pathname) !== null)
}

/** 返回当前会话有权访问的路由，未登录时返回空数组。 */
export function getAuthorizedRoutes(
  routes: readonly RegisteredRoute[],
  session: Session | undefined,
): RegisteredRoute[] {
  return session ? routes.filter((route) => authorize(session.capabilities, route.capability)) : []
}

/**
 * 计算登录后应跳转的目标路径。
 * `returnTo` 仅在同源、无 hash、命中已注册路由且会话有权访问时才被采纳，
 * 以防开放重定向或借此扩展路由表。否则回退到第一个有权访问的路由，
 * 全无权限时回退到 `/forbidden`。
 */
export function resolvePostLoginPath(
  routes: readonly RegisteredRoute[],
  session: Session,
  returnTo?: string | null,
): string {
  if (returnTo) {
    try {
      const target = new URL(returnTo, window.location.origin)
      const route = findRouteByPath(routes, target.pathname)
      if (
        target.origin === window.location.origin &&
        !target.hash &&
        route &&
        authorize(session.capabilities, route.capability)
      ) {
        return target.pathname + target.search
      }
    } catch {
      // 非法的 returnTo 一律忽略，不允许借此扩展路由表。
    }
  }

  return getAuthorizedRoutes(routes, session)[0]?.path ?? '/forbidden'
}

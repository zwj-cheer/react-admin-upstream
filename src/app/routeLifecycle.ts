import type { LoaderFunction, MiddlewareFunction } from 'react-router'
import { redirect } from 'react-router'
import { authorize } from '@/core/permissions/authorize'
import { useAuthStore } from '@/core/auth/authStore'
import type { RegisteredRoute } from '@/core/routing'
import { resolvePostLoginPath } from '@/core/routing'
import type { AppRuntime } from './runtime'

/** 在任何受保护 loader 执行前等待首次会话恢复，并阻止未登录访问。 */
export function createAuthenticationMiddleware(authReady: Promise<void>): MiddlewareFunction {
  return async ({ request }) => {
    await authReady
    if (useAuthStore.getState().status === 'authenticated') return

    const url = new URL(request.url)
    const returnTo = url.pathname + url.search
    throw redirect('/login?returnTo=' + encodeURIComponent(returnTo))
  }
}

/** 在叶子路由 loader 运行前执行 fail-closed 能力校验。 */
export function createCapabilityMiddleware(capability: string): MiddlewareFunction {
  return () => {
    const session = useAuthStore.getState().session
    if (!authorize(session?.capabilities, capability)) throw redirect('/forbidden')
  }
}

/** 已登录用户访问登录页时直接回到安全的目标路由。 */
export function createLoginLoader(
  authReady: Promise<void>,
  routes: readonly RegisteredRoute[],
): LoaderFunction {
  return async ({ request }) => {
    await authReady
    const session = useAuthStore.getState().session
    if (!session) return null

    const returnTo = new URL(request.url).searchParams.get('returnTo')
    throw redirect(resolvePostLoginPath(routes, session, returnTo))
  }
}

/** 根索引始终跳转到当前会话首个可访问路由。 */
export function createDefaultRouteLoader(routes: readonly RegisteredRoute[]): LoaderFunction {
  return () => {
    const session = useAuthStore.getState().session
    throw redirect(session ? resolvePostLoginPath(routes, session) : '/login')
  }
}

/** OIDC 回调在 route loader 中完成，避免组件 effect 承担应用级副作用。 */
export function createOidcCallbackLoader(
  runtime: AppRuntime,
  routes: readonly RegisteredRoute[],
): LoaderFunction {
  return async () => {
    try {
      const returnTo = await runtime.authService.completeOidcCallback()
      const session = useAuthStore.getState().session
      throw redirect(session ? resolvePostLoginPath(routes, session, returnTo) : '/login')
    } catch (error) {
      if (error instanceof Response) throw error
      throw redirect('/auth/error')
    }
  }
}

/** 把注册表的领域预取函数转换成 React Router loader。 */
export function createRegisteredRouteLoader(
  runtime: AppRuntime,
  route: RegisteredRoute,
): LoaderFunction | undefined {
  if (!route.preload) return undefined
  return ({ request }) =>
    route.preload?.({
      request,
      queryClient: runtime.queryClient,
      services: runtime.services,
    })
}

/** 应用外壳依赖菜单模型，父 loader 在所有业务页面前统一预热。 */
export function createShellLoader(runtime: AppRuntime): LoaderFunction {
  return async () => {
    const { menusQueryOptions } = await import('@/modules/menus/queries')
    return runtime.queryClient.ensureQueryData(menusQueryOptions(runtime.services))
  }
}

import type { RouteObject } from 'react-router'
import { createBrowserRouter } from 'react-router'
import { RequireAuth } from './RequireAuth'
import type { AppRuntime } from './runtime'
import {
  createAuthenticationMiddleware,
  createCapabilityMiddleware,
  createDefaultRouteLoader,
  createLoginLoader,
  createOidcCallbackLoader,
  createRegisteredRouteLoader,
  createShellLoader,
} from './routeLifecycle'
import {
  AppRoot,
  AuthorizedAppShell,
  LoginRoute,
  NotFoundPage,
  RouteErrorBoundary,
  RouterHydrateFallback,
} from './routeComponents'
import { registeredRoutes } from './routeRegistry'
import { AuthErrorPage } from '@/modules/auth/AuthErrorPage'
import { NoPermissionPage } from '@/modules/auth/NoPermissionPage'

export interface CreateAppRoutesOptions {
  /** 应用级服务与 Query 缓存。 */
  runtime: AppRuntime
  /** 首次会话恢复 Promise，所有认证 middleware 共享同一实例。 */
  authReady: Promise<void>
}

export function createAppRoutes({ runtime, authReady }: CreateAppRoutesOptions): RouteObject[] {
  return [
    {
      id: 'root',
      Component: AppRoot,
      ErrorBoundary: RouteErrorBoundary,
      HydrateFallback: RouterHydrateFallback,
      children: [
        {
          id: 'login',
          path: 'login',
          loader: createLoginLoader(authReady, registeredRoutes),
          Component: LoginRoute,
        },
        {
          id: 'oidc-callback',
          path: 'auth/callback',
          loader: createOidcCallbackLoader(runtime, registeredRoutes),
        },
        { id: 'auth-error', path: 'auth/error', Component: AuthErrorPage },
        {
          id: 'authenticated',
          loader: () => null,
          middleware: [createAuthenticationMiddleware(authReady)],
          Component: RequireAuth,
          children: [
            { id: 'forbidden', path: 'forbidden', Component: NoPermissionPage },
            {
              id: 'app-shell',
              loader: createShellLoader(runtime),
              Component: AuthorizedAppShell,
              children: [
                {
                  id: 'app-index',
                  index: true,
                  loader: createDefaultRouteLoader(registeredRoutes),
                },
                ...registeredRoutes.map<RouteObject>((route) => ({
                  id: 'registered:' + route.key,
                  path: route.path.replace(/^\//, ''),
                  handle: route,
                  middleware: [createCapabilityMiddleware(route.capability)],
                  loader: createRegisteredRouteLoader(runtime, route),
                  lazy: route.lazy,
                  shouldRevalidate: route.shouldRevalidate,
                })),
              ],
            },
          ],
        },
        { id: 'not-found', path: '*', Component: NotFoundPage },
      ],
    },
  ]
}

export function createAppRouter(options: CreateAppRoutesOptions) {
  return createBrowserRouter(createAppRoutes(options))
}

export type AppRouter = ReturnType<typeof createAppRouter>

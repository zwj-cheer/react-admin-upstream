import { QueryClient } from '@tanstack/react-query'
import { createMemoryRouter, RouterContextProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/core/auth/authStore'
import type { RegisteredRoute } from '@/core/routing'
import type { Services, Session } from '@/core/services/contracts'
import { menuKeys } from '@/modules/menus/queries'
import {
  createAuthenticationMiddleware,
  createCapabilityMiddleware,
  createLoginLoader,
  createOidcCallbackLoader,
  createShellLoader,
} from './routeLifecycle'
import type { AppRuntime } from './runtime'

const usersRoute: RegisteredRoute = {
  key: 'users',
  path: '/users',
  titleKey: 'users.title',
  subtitleKey: 'users.subtitle',
  icon: 'users',
  capability: 'users:read',
  lazy: async () => ({ Component: () => null }),
}

const session: Session = {
  user: { id: '1', name: 'Admin', email: 'admin@example.com' },
  source: 'local',
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  capabilities: ['users:read'],
}

function createProtectedRouter(authReady: Promise<void>, loader: () => unknown) {
  return createMemoryRouter(
    [
      { path: '/login' },
      {
        path: '/',
        loader: () => null,
        middleware: [createAuthenticationMiddleware(authReady)],
        children: [
          { path: 'forbidden' },
          {
            path: 'users',
            middleware: [createCapabilityMiddleware(usersRoute.capability)],
            loader,
          },
        ],
      },
    ],
    { initialEntries: ['/login'] },
  )
}

function loaderArgs(url: string) {
  const request = new Request(url)
  return {
    context: new RouterContextProvider(),
    params: {},
    pattern: new URL(url).pathname,
    request,
    url: new URL(url),
  }
}

async function captureRedirect(loaderResult: unknown): Promise<Response> {
  const result = await Promise.resolve(loaderResult).catch((error: unknown) => error)
  expect(result).toBeInstanceOf(Response)
  return result as Response
}

afterEach(() => {
  useAuthStore.setState({ errorCategory: undefined, session: undefined, status: 'idle' })
})

describe('route lifecycle', () => {
  it('redirects unauthenticated users with an encoded returnTo before protected loaders run', async () => {
    useAuthStore.getState().setUnauthenticated()
    const protectedLoader = vi.fn()
    const router = createProtectedRouter(Promise.resolve(), protectedLoader)

    await router.navigate('/users?q=alice&page=2')

    expect(router.state.location.pathname).toBe('/login')
    expect(router.state.location.search).toBe('?returnTo=%2Fusers%3Fq%3Dalice%26page%3D2')
    expect(protectedLoader).not.toHaveBeenCalled()
    router.dispose()
  })

  it('redirects authenticated users without the required capability before the loader runs', async () => {
    useAuthStore.getState().setSession({ ...session, capabilities: [] })
    const protectedLoader = vi.fn()
    const router = createProtectedRouter(Promise.resolve(), protectedLoader)

    await router.navigate('/users')

    expect(router.state.location.pathname).toBe('/forbidden')
    expect(protectedLoader).not.toHaveBeenCalled()
    router.dispose()
  })

  it('redirects authenticated users away from login to an authorized return target', async () => {
    useAuthStore.getState().setSession(session)
    const router = createMemoryRouter(
      [
        { path: '/' },
        {
          path: '/login',
          loader: createLoginLoader(Promise.resolve(), [usersRoute]),
        },
        { path: '/users' },
      ],
      { initialEntries: ['/'] },
    )

    await router.navigate('/login?returnTo=%2Fusers%3Fq%3Dalice')

    expect(router.state.location.pathname).toBe('/users')
    expect(router.state.location.search).toBe('?q=alice')
    router.dispose()
  })

  it('completes the OIDC callback in the loader and preserves an authorized return target', async () => {
    useAuthStore.getState().setSession(session)
    const completeOidcCallback = vi.fn().mockResolvedValue('/users?q=alice')
    const runtime = {
      authService: { completeOidcCallback },
    } as unknown as AppRuntime

    const response = await captureRedirect(
      createOidcCallbackLoader(runtime, [usersRoute])(loaderArgs('http://localhost/auth/callback')),
    )

    expect(completeOidcCallback).toHaveBeenCalledTimes(1)
    expect(response.headers.get('Location')).toBe('/users?q=alice')
  })

  it('redirects failed OIDC callbacks to the dedicated retry page', async () => {
    const runtime = {
      authService: { completeOidcCallback: vi.fn().mockRejectedValue(new Error('failed')) },
    } as unknown as AppRuntime

    const response = await captureRedirect(
      createOidcCallbackLoader(runtime, [usersRoute])(loaderArgs('http://localhost/auth/callback')),
    )

    expect(response.headers.get('Location')).toBe('/auth/error')
  })

  it('preloads the shared menu query from the app-shell loader', async () => {
    const menus = [
      {
        id: 'menu-users',
        parentId: null,
        name: 'Users',
        routeKey: 'users',
        icon: 'users',
        status: 'active' as const,
        order: 1,
      },
    ]
    const list = vi.fn<Services['menus']['list']>().mockResolvedValue(menus)
    const services = { menus: { list } } as unknown as Services
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const runtime = { queryClient, services } as AppRuntime

    const result = await createShellLoader(runtime)(loaderArgs('http://localhost/users'))

    expect(result).toBe(menus)
    expect(queryClient.getQueryData(menuKeys.all)).toBe(menus)
    expect(list).toHaveBeenCalledWith(expect.any(AbortSignal))
  })
})

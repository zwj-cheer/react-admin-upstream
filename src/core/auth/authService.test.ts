import { QueryClient } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRestServices } from '@/adapters/rest'
import { developmentRuntimeConfig } from '@/core/config/runtimeConfig'
import type { RuntimeConfig } from '@/core/config/runtimeConfig.schema'
import { HttpClient } from '@/core/http/client'
import { emitUnauthorized } from '@/core/http/unauthorized'
import { useAuthStore } from './authStore'
import { AuthService } from './authService'

const oidcMocks = vi.hoisted(() => ({
  beginOidcLogin: vi.fn(),
  clearOidcUser: vi.fn().mockResolvedValue(undefined),
  completeOidcLogin: vi.fn(),
  hasRestorableOidcUser: vi.fn().mockResolvedValue(false),
  signoutOidc: vi.fn(),
}))

vi.mock('./oidcAuth', () => oidcMocks)

function createService(fetcher: typeof fetch, config: RuntimeConfig = developmentRuntimeConfig) {
  const client = new HttpClient({
    baseUrl: '/api',
    timeoutMs: 1000,
    csrfHeaderName: 'x-csrf-token',
    fetcher,
  })
  return new AuthService(config, createRestServices(client), new QueryClient())
}

const oidcConfig: RuntimeConfig = {
  ...developmentRuntimeConfig,
  auth: {
    mode: 'oidc',
    local: { csrfHeaderName: 'x-csrf-token' },
    oidc: {
      authority: 'https://id.example.com',
      clientId: 'public-client',
      redirectPath: '/auth/callback',
      postLogoutRedirectPath: '/login',
      scope: 'openid profile',
    },
  },
}

describe('AuthService', () => {
  beforeEach(() => {
    oidcMocks.clearOidcUser.mockReset().mockResolvedValue(undefined)
    oidcMocks.signoutOidc.mockReset().mockResolvedValue(undefined)
    useAuthStore.getState().setUnauthenticated()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('keeps an invalid local login in the retryable error state', async () => {
    const service = createService(
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'invalid_credentials' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    )
    service.start()

    await expect(service.loginLocal('wrong@example.com', 'Wrong123!')).rejects.toThrow(
      'local_login_failed',
    )
    await Promise.resolve()

    expect(useAuthStore.getState()).toMatchObject({
      status: 'error',
      errorCategory: 'local_login_failed',
    })
    service.stop()
  })

  it('does not make local login depend on session storage', async () => {
    vi.spyOn(window.sessionStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked')
    })
    const session = {
      user: { id: 'user-1', name: 'Admin', email: 'admin@example.com' },
      source: 'local',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      capabilities: ['users:read'],
    }
    const service = createService(
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(session), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    )

    await expect(service.loginLocal('admin@example.com', 'Admin123!')).resolves.toEqual(session)
    expect(useAuthStore.getState().status).toBe('authenticated')
    service.stop()
  })

  it('uses the OIDC user for IdP logout before clearing local OIDC storage', async () => {
    const calls: string[] = []
    const fetcher = vi.fn().mockImplementation(async () => {
      calls.push('application')
      return new Response(null, { status: 204 })
    })
    oidcMocks.signoutOidc.mockImplementation(async () => {
      calls.push('identity-provider')
    })
    oidcMocks.clearOidcUser.mockImplementation(async () => {
      calls.push('local-storage')
    })
    const service = createService(fetcher, oidcConfig)
    useAuthStore.getState().setSession({
      user: { id: 'user-1', name: 'Admin', email: 'admin@example.com' },
      source: 'oidc',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      capabilities: [],
    })

    await service.logout()

    expect(calls).toEqual(['application', 'identity-provider', 'local-storage'])
    expect(useAuthStore.getState().status).toBe('unauthenticated')
  })

  it('still attempts IdP logout and local cleanup when application logout fails', async () => {
    const calls: string[] = []
    const fetcher = vi.fn().mockImplementation(async () => {
      calls.push('application')
      return new Response(JSON.stringify({ message: 'session_expired' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    })
    oidcMocks.signoutOidc.mockImplementation(async () => {
      calls.push('identity-provider')
    })
    oidcMocks.clearOidcUser.mockImplementation(async () => {
      calls.push('local-storage')
    })
    const service = createService(fetcher, oidcConfig)
    service.start()
    useAuthStore.getState().setSession({
      user: { id: 'user-1', name: 'Admin', email: 'admin@example.com' },
      source: 'oidc',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      capabilities: [],
    })

    await expect(service.logout()).resolves.toBeUndefined()

    expect(oidcMocks.signoutOidc).toHaveBeenCalledTimes(1)
    expect(oidcMocks.clearOidcUser).toHaveBeenCalledTimes(1)
    expect(calls).toEqual(['application', 'identity-provider', 'local-storage'])
    expect(useAuthStore.getState().status).toBe('unauthenticated')
    service.stop()
  })

  it('clears an authenticated session when its expiry time is reached', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-10T10:00:00.000Z'))
    const session = {
      user: { id: 'user-1', name: 'Admin', email: 'admin@example.com' },
      source: 'local' as const,
      expiresAt: '2026-07-10T10:00:01.000Z',
      capabilities: ['users:read'],
    }
    const service = createService(
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(session), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    )

    await service.loginLocal('admin@example.com', 'Admin123!')
    await vi.advanceTimersByTimeAsync(1_000)

    expect(useAuthStore.getState().status).toBe('unauthenticated')
  })

  it('cancels the expiry timer during explicit session cleanup', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-10T10:00:00.000Z'))
    const session = {
      user: { id: 'user-1', name: 'Admin', email: 'admin@example.com' },
      source: 'local' as const,
      expiresAt: '2026-07-10T10:00:01.000Z',
      capabilities: ['users:read'],
    }
    const service = createService(
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(session), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    )

    await service.loginLocal('admin@example.com', 'Admin123!')
    await service.clearSession()
    await vi.advanceTimersByTimeAsync(1_000)

    expect(oidcMocks.clearOidcUser).toHaveBeenCalledTimes(1)
  })

  it('coalesces overlapping unauthorized cleanup', async () => {
    let finishCleanup: (() => void) | undefined
    oidcMocks.clearOidcUser.mockImplementation(
      () => new Promise<void>((resolve) => (finishCleanup = resolve)),
    )
    const service = createService(vi.fn())
    service.start()

    emitUnauthorized()
    await Promise.resolve()
    emitUnauthorized()
    await Promise.resolve()

    expect(oidcMocks.clearOidcUser).toHaveBeenCalledTimes(1)
    finishCleanup?.()
    await Promise.resolve()
    service.stop()
  })
})

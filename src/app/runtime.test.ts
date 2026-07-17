import { describe, expect, it, vi } from 'vitest'
import { developmentRuntimeConfig } from '@/core/config/runtimeConfig'
import type { Services } from '@/core/services/contracts'
import { createAppRuntime, startAppRuntime } from './runtime'

const mocks = vi.hoisted(() => ({
  configureOidc: vi.fn(),
  createProjectServices: vi.fn(),
  getOidcAccessToken: vi.fn(),
}))

vi.mock('@/core/auth/oidcAuth', () => ({
  configureOidc: mocks.configureOidc,
  getOidcAccessToken: mocks.getOidcAccessToken,
}))

vi.mock('@/project/services', () => ({
  createProjectServices: mocks.createProjectServices,
}))

describe('application runtime', () => {
  it('creates all app-wide services outside React rendering', () => {
    const services = {} as Services
    mocks.createProjectServices.mockReturnValue(services)

    const runtime = createAppRuntime(developmentRuntimeConfig)

    expect(mocks.configureOidc).toHaveBeenCalledWith(developmentRuntimeConfig)
    expect(mocks.createProjectServices).toHaveBeenCalledWith(
      developmentRuntimeConfig,
      mocks.getOidcAccessToken,
    )
    expect(runtime.services).toBe(services)
    expect(runtime.queryClient.getDefaultOptions()).toMatchObject({
      queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 15_000 },
      mutations: { retry: false },
    })
  })

  it('starts the auth subscription and restore exactly from the composition root', () => {
    mocks.createProjectServices.mockReturnValue({} as Services)
    const runtime = createAppRuntime(developmentRuntimeConfig)
    const start = vi.spyOn(runtime.authService, 'start').mockImplementation(() => undefined)
    const restorePromise = Promise.resolve()
    const restore = vi.spyOn(runtime.authService, 'restore').mockReturnValue(restorePromise)

    const authReady = startAppRuntime(runtime)

    expect(start).toHaveBeenCalledTimes(1)
    expect(restore).toHaveBeenCalledTimes(1)
    expect(authReady).toBe(restorePromise)
  })
})

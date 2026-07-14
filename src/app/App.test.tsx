import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RuntimeConfigProvider } from '@/core/config/RuntimeConfigProvider'
import { developmentRuntimeConfig } from '@/core/config/runtimeConfig'
import { initializeI18n } from '@/core/i18n'
import { RouteRegistryProvider } from '@/core/routing'
import { renderApp } from '@/test/render'
import { registeredRoutes } from '@/app/routeRegistry'
import { LoginPage } from '@/modules/auth/LoginPage'
import { AuthProvider } from '@/core/auth/AuthProvider'
import type { AuthService } from '@/core/auth/authService'
import { useAuthStore } from '@/core/auth/authStore'

describe('application entry', () => {
  it('renders a local login entry for the development configuration', async () => {
    await initializeI18n('zh-CN')
    useAuthStore.getState().setUnauthenticated()
    const authService = {
      start: () => undefined,
      stop: () => undefined,
      restore: async () => undefined,
      loginLocal: async () => {
        throw new Error('not_used')
      },
      loginOidc: async () => undefined,
    } as unknown as AuthService
    renderApp(
      <RuntimeConfigProvider config={developmentRuntimeConfig}>
        <RouteRegistryProvider routes={registeredRoutes}>
          <AuthProvider service={authService}>
            <LoginPage />
          </AuthProvider>
        </RouteRegistryProvider>
      </RuntimeConfigProvider>,
      ['/login'],
    )
    expect(screen.getByText('账号密码登录')).toBeInTheDocument()
  })
})

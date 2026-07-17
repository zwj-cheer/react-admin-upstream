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
            <LoginPage
              branding={{ name: 'Probe Workspace', shortName: 'PW', edition: 'Probe Edition' }}
            />
          </AuthProvider>
        </RouteRegistryProvider>
      </RuntimeConfigProvider>,
      ['/login'],
    )
    expect(screen.getByText('账号密码登录')).toBeInTheDocument()
    // branding 三字段线路:名称、缩写标记、edition 均来自注入的 branding prop
    expect(screen.getByText('Probe Workspace')).toBeInTheDocument()
    expect(screen.getByText('PW')).toBeInTheDocument()
    expect(screen.getByText('Probe Edition')).toBeInTheDocument()
    // auth.title 以 branding.name 插值
    expect(screen.getByRole('heading', { name: '登录 Probe Workspace' })).toBeInTheDocument()
  })
})

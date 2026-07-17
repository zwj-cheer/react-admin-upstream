import { isRouteErrorResponse, Link, Outlet, useRevalidator, useRouteError } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/core/auth/authStore'
import type { ShellBranding } from '@/core/branding'
import { useRuntimeConfig } from '@/core/config/RuntimeConfigProvider'
import { RouteRegistryProvider, useRouteRegistry } from '@/core/routing'
import { AppShell } from '@/layouts/AppShell'
import { LoginPage } from '@/modules/auth/LoginPage'
import { useMenus } from '@/modules/menus/queries'
import { projectBranding } from '@/project/branding'
import { projectNavigation } from '@/project/navigation'
import { getMenuNavigation } from './navigation'
import { registeredRoutes } from './routeRegistry'

export function AppRoot() {
  return (
    <RouteRegistryProvider routes={registeredRoutes}>
      <Outlet />
    </RouteRegistryProvider>
  )
}

export function RouterHydrateFallback() {
  const { t } = useTranslation()
  return (
    <main className="status-page">
      <section className="status-page__card" aria-live="polite">
        {t('auth.restoring')}
      </section>
    </main>
  )
}

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <main className="status-page">
      <section className="status-page__card">
        <div className="status-page__icon">404</div>
        <h1>{t('errors.notFoundTitle')}</h1>
        <p>{t('errors.notFoundBody')}</p>
        <Button asChild variant="primary">
          <Link to="/">{t('errors.backToApp')}</Link>
        </Button>
      </section>
    </main>
  )
}

export function RouteErrorBoundary() {
  const { t } = useTranslation()
  const error = useRouteError()
  const revalidator = useRevalidator()

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />

  return (
    <main className="status-page">
      <section className="status-page__card">
        <h1>{t('common.loadFailed')}</h1>
        <p>{t('errors.routeLoadBody')}</p>
        <Button
          disabled={revalidator.state !== 'idle'}
          variant="primary"
          onClick={() => revalidator.revalidate()}
        >
          {t('common.retry')}
        </Button>
      </section>
    </main>
  )
}

export function LoginRoute() {
  const config = useRuntimeConfig()
  const branding: ShellBranding = { name: config.app.name, ...projectBranding }
  return <LoginPage branding={branding} />
}

export function AuthorizedAppShell() {
  const config = useRuntimeConfig()
  const branding: ShellBranding = { name: config.app.name, ...projectBranding }
  const session = useAuthStore((state) => state.session)
  const routes = useRouteRegistry()
  const menus = useMenus()
  const navigation = getMenuNavigation(routes, session, menus.data ?? [])

  return (
    <AppShell
      branding={branding}
      groupLabelKey={projectNavigation.systemGroupLabelKey}
      navigation={navigation}
    />
  )
}

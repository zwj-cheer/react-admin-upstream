import { Navigate, Route, Routes } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/core/auth/authStore'
import { useRuntimeConfig } from '@/core/config/RuntimeConfigProvider'
import { RouteRegistryProvider, useResolvePostLoginPath } from '@/core/routing'
import { registeredRoutes } from './routeRegistry'
import { RequireAuth } from './RequireAuth'
import { RequirePermission } from './RequirePermission'
import { AppShell } from '@/layouts/AppShell'
import { LoginPage } from '@/modules/auth/LoginPage'
import { OidcCallbackPage } from '@/modules/auth/OidcCallbackPage'
import { AuthErrorPage } from '@/modules/auth/AuthErrorPage'
import { NoPermissionPage } from '@/modules/auth/NoPermissionPage'
import { Button } from '@/components/ui/button'
import { projectBranding } from '@/project/branding'
import { projectNavigation } from '@/project/navigation'

function DefaultRoute() {
  const session = useAuthStore((state) => state.session)
  const resolvePostLoginPath = useResolvePostLoginPath()
  return session ? <Navigate replace to={resolvePostLoginPath(session)} /> : null
}

function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <main className="status-page">
      <section className="status-page__card">
        <div className="status-page__icon">404</div>
        <h1>{t('errors.notFoundTitle')}</h1>
        <p>{t('errors.notFoundBody')}</p>
        <Button asChild variant="primary">
          <a href="/">{t('errors.backToApp')}</a>
        </Button>
      </section>
    </main>
  )
}

function AppRoutes() {
  const config = useRuntimeConfig()
  const branding = { name: config.app.name, ...projectBranding }
  return (
    <Routes>
      <Route path="/login" element={<LoginPage branding={branding} />} />
      <Route path="/auth/callback" element={<OidcCallbackPage />} />
      <Route path="/auth/error" element={<AuthErrorPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/forbidden" element={<NoPermissionPage />} />
        <Route
          element={
            <AppShell branding={branding} groupLabelKey={projectNavigation.systemGroupLabelKey} />
          }
        >
          <Route index element={<DefaultRoute />} />
          {registeredRoutes.map((route) => {
            const Page = route.component
            return (
              <Route
                key={route.key}
                path={route.path}
                element={
                  <RequirePermission capability={route.capability}>
                    <Page />
                  </RequirePermission>
                }
              />
            )
          })}
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export function AppRouter() {
  return (
    <RouteRegistryProvider routes={registeredRoutes}>
      <AppRoutes />
    </RouteRegistryProvider>
  )
}

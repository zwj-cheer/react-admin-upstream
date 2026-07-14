import { useEffect, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuthService } from '@/core/auth/AuthProvider'
import { useAuthStore } from '@/core/auth/authStore'

export function RequireAuth({ children }: { children?: ReactNode }) {
  const { t } = useTranslation()
  const service = useAuthService()
  const status = useAuthStore((state) => state.status)
  const location = useLocation()

  useEffect(() => {
    if (status === 'idle') {
      void service.restore()
    }
  }, [service, status])

  if (status === 'idle' || status === 'restoring') {
    return (
      <main className="status-page">
        <section className="status-page__card" aria-live="polite">
          {t('auth.restoring')}
        </section>
      </main>
    )
  }

  if (status !== 'authenticated') {
    const returnTo = location.pathname + location.search
    return <Navigate replace to={'/login?returnTo=' + encodeURIComponent(returnTo)} />
  }

  return children ?? <Outlet />
}

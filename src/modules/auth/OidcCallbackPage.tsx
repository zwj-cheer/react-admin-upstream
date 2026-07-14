import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuthService } from '@/core/auth/AuthProvider'
import { useAuthStore } from '@/core/auth/authStore'
import { useResolvePostLoginPath } from '@/core/routing'

export function OidcCallbackPage() {
  const { t } = useTranslation()
  const service = useAuthService()
  const navigate = useNavigate()
  const session = useAuthStore((state) => state.session)
  const resolvePostLoginPath = useResolvePostLoginPath()

  useEffect(() => {
    void service
      .completeOidcCallback()
      .then((returnTo) => {
        const nextSession = useAuthStore.getState().session
        navigate(nextSession ? resolvePostLoginPath(nextSession, returnTo) : '/login', {
          replace: true,
        })
      })
      .catch(() => navigate('/auth/error', { replace: true }))
  }, [navigate, service, resolvePostLoginPath])

  if (session) {
    return null
  }

  return (
    <main className="status-page">
      <section className="status-page__card" aria-live="polite">
        {t('auth.restoring')}
      </section>
    </main>
  )
}

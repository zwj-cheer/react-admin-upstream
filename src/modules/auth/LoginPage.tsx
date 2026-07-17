import { Navigate, useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useRuntimeConfig } from '@/core/config/RuntimeConfigProvider'
import { useAuthService } from '@/core/auth/AuthProvider'
import { useAuthStore } from '@/core/auth/authStore'
import { useResolvePostLoginPath } from '@/core/routing'
import { LocalLoginForm } from './LocalLoginForm'
import { OidcLoginButton } from './OidcLoginButton'
import type { ShellBranding } from '@/layouts/types'

export interface LoginPageProps {
  /** 品牌标识：name 来自 runtime.json 的 app.name，shortName/edition 来自编译期项目配置。 */
  branding: ShellBranding
}

export function LoginPage({ branding }: LoginPageProps) {
  const { t } = useTranslation()
  const config = useRuntimeConfig()
  const service = useAuthService()
  const status = useAuthStore((state) => state.status)
  const session = useAuthStore((state) => state.session)
  const errorCategory = useAuthStore((state) => state.errorCategory)
  const navigate = useNavigate()
  const location = useLocation()
  const resolvePostLoginPath = useResolvePostLoginPath()
  const returnTo = new URLSearchParams(location.search).get('returnTo')

  if (status === 'authenticated' && session) {
    return <Navigate replace to={resolvePostLoginPath(session, returnTo)} />
  }

  const showLocal = config.auth.mode === 'local' || config.auth.mode === 'hybrid'
  const showOidc = config.auth.mode === 'oidc' || config.auth.mode === 'hybrid'
  const pending = status === 'restoring'

  return (
    <main className="login-page">
      <section className="login-card page-enter">
        <div className="login-brand">
          <div className="brand-mark">{branding.shortName}</div>
          <div>
            <div className="brand-name">{branding.name}</div>
            <div className="brand-meta">{branding.edition}</div>
          </div>
        </div>
        <h1 className="login-title">{t('auth.title', { name: branding.name })}</h1>
        <p className="login-subtitle">{t('auth.subtitle')}</p>

        {showLocal && (
          <LocalLoginForm
            pending={pending}
            onSubmit={async ({ email, password }) => {
              try {
                const nextSession = await service.loginLocal(email, password)
                navigate(resolvePostLoginPath(nextSession, returnTo), { replace: true })
              } catch {
                // AuthService owns the retryable error state shown below.
              }
            }}
          />
        )}

        {showLocal && showOidc && <div className="login-divider">OR</div>}

        {showOidc && (
          <OidcLoginButton
            disabled={pending}
            onClick={() =>
              void service
                .loginOidc(returnTo ?? undefined)
                .catch(() => navigate('/auth/error', { replace: true }))
            }
          />
        )}

        {errorCategory && <div className="auth-error">{t('auth.failed')}</div>}
        {import.meta.env.DEV && config.mock.enabled && (
          <div className="login-hint">{t('auth.demoHint')}</div>
        )}
      </section>
    </main>
  )
}

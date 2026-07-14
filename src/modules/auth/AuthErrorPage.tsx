import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { IconSprite } from '@/components/IconSprite'

export function AuthErrorPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <main className="status-page">
      <section className="status-page__card">
        <div className="status-page__icon">
          <IconSprite name="triangle-alert" />
        </div>
        <h1>{t('auth.callbackFailed')}</h1>
        <p>{t('auth.failed')}</p>
        <Button variant="primary" onClick={() => navigate('/login', { replace: true })}>
          {t('common.retry')}
        </Button>
      </section>
    </main>
  )
}

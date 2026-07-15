import { useTranslation } from 'react-i18next'
import { useAuthService } from '@/core/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export function NoPermissionPage() {
  const { t } = useTranslation()
  const service = useAuthService()
  return (
    <main className="status-page">
      <section className="status-page__card">
        <div className="status-page__icon">
          <Icon name="shield-check" size={24} />
        </div>
        <h1>{t('auth.noPermission')}</h1>
        <p>{t('auth.noPermissionHint')}</p>
        <Button onClick={() => void service.logout()}>{t('auth.logout')}</Button>
      </section>
    </main>
  )
}

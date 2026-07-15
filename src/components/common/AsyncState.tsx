import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { Spin } from '@/components/ui/spin'

export function AsyncState({
  loading,
  error,
  empty,
  onRetry,
  children,
}: {
  loading?: boolean
  error?: boolean
  empty?: boolean
  onRetry?: () => void
  children: ReactNode
}) {
  const { t } = useTranslation()
  if (loading) {
    return (
      <div className="async-state">
        <Spin spinning />
      </div>
    )
  }
  if (error) {
    return (
      <div className="async-state">
        <div>
          <p>{t('common.loadFailed')}</p>
          {onRetry && (
            <Button size="sm" onClick={onRetry}>
              {t('common.retry')}
            </Button>
          )}
        </div>
      </div>
    )
  }
  if (empty) {
    return <Empty />
  }
  return children
}

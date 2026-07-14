import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}) {
  const { t } = useTranslation()
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  return (
    <nav className="pagination" aria-label="Pagination">
      <Button size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        {t('common.previous')}
      </Button>
      <span className="pagination__summary">
        {page} / {pageCount}
      </span>
      <Button size="sm" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
        {t('common.next')}
      </Button>
    </nav>
  )
}

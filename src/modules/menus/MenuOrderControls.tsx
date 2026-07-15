import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'

export function MenuOrderControls({
  first,
  last,
  disabled,
  onMove,
}: {
  first: boolean
  last: boolean
  disabled?: boolean
  onMove: (direction: 'up' | 'down') => void
}) {
  const { t } = useTranslation()
  return (
    <div className="menu-order">
      <Button
        aria-label={t('common.moveUp')}
        disabled={disabled || first}
        size="icon"
        onClick={() => onMove('up')}
      >
        <Icon name="chevron-up" size={14} />
      </Button>
      <Button
        aria-label={t('common.moveDown')}
        disabled={disabled || last}
        size="icon"
        onClick={() => onMove('down')}
      >
        <Icon name="chevron-down" size={14} />
      </Button>
    </div>
  )
}

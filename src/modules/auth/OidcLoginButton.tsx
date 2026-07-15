import { Icon } from '@/components/ui/icon'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function OidcLoginButton({
  disabled,
  onClick,
}: {
  disabled?: boolean
  onClick: () => void
}) {
  const { t } = useTranslation()
  return (
    <Button className="login-submit" disabled={disabled} onClick={onClick}>
      <Icon name="building" size={16} />
      {t('auth.oidcLogin')}
    </Button>
  )
}

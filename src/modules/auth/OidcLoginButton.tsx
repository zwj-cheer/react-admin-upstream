import { Building2 } from 'lucide-react'
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
      <Building2 size={16} />
      {t('auth.oidcLogin')}
    </Button>
  )
}

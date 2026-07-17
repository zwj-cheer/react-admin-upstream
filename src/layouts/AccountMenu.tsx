import { useState, type ReactNode } from 'react'
import { Icon } from '@/components/ui/icon'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/core/auth/authStore'
import { useAuthService } from '@/core/auth/AuthProvider'
import { SettingsDialog } from './SettingsDialog'

export function AccountMenu({
  trigger,
  side = 'bottom',
  align = 'end',
}: {
  trigger: ReactNode
  side?: 'top' | 'bottom'
  align?: 'start' | 'center' | 'end'
}) {
  const { t } = useTranslation()
  const session = useAuthStore((state) => state.session)
  const service = useAuthService()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align={align} side={side}>
          {session && (
            <DropdownMenuGroup>
              <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
              <DropdownMenuItem disabled>{session.user.email}</DropdownMenuItem>
            </DropdownMenuGroup>
          )}
          {session ? <DropdownMenuSeparator /> : null}
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
              <Icon name="settings" size={16} />
              {t('settings.title')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => void service.logout()}>
              <Icon name="logout" size={16} />
              {t('auth.logout')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}

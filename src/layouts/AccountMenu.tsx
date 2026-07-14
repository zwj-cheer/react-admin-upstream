import { useState, type ReactNode } from 'react'
import { LogOut, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
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
            <>
              <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
              <DropdownMenuItem disabled>{session.user.email}</DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
            <Settings size={15} />
            {t('settings.title')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void service.logout()}>
            <LogOut size={15} />
            {t('auth.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}

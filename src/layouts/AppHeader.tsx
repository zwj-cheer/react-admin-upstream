import { Languages, Menu, Monitor, Moon, Sun } from 'lucide-react'
import { useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useMatchedRoute } from '@/core/routing'
import { useAuthStore } from '@/core/auth/authStore'
import { useThemeStore } from '@/core/theme/themeStore'
import { setLocale } from '@/core/i18n'
import type { Locale } from '@/core/i18n/localeResolver'
import { Avatar } from '@/components/ui/avatar'
import { AccountMenu } from './AccountMenu'

const themeOrder = ['light', 'dark', 'system'] as const

export function AppHeader({
  onOpenNavigation,
  showAccountMenu,
}: {
  onOpenNavigation: () => void
  showAccountMenu: boolean
}) {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const route = useMatchedRoute(location.pathname)
  const session = useAuthStore((state) => state.session)
  const preference = useThemeStore((state) => state.preference)
  const setPreference = useThemeStore((state) => state.setPreference)
  const locale = i18n.language === 'en-US' ? 'en-US' : 'zh-CN'

  const themeIcon =
    preference === 'light' ? (
      <Sun size={16} />
    ) : preference === 'dark' ? (
      <Moon size={16} />
    ) : (
      <Monitor size={16} />
    )
  const themeLabel =
    preference === 'light'
      ? t('a11y.themeLight')
      : preference === 'dark'
        ? t('a11y.themeDark')
        : t('a11y.themeSystem')

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          className="header-icon-button nav-toggle"
          aria-label={t('a11y.openNavigation')}
          onClick={onOpenNavigation}
        >
          <Menu size={18} />
        </button>
        <h1 className="page-title">{route ? t(route.titleKey) : t('app.name')}</h1>
        {route && <span className="page-subtitle">{t(route.subtitleKey)}</span>}
      </div>
      <div className="app-header__right">
        <button
          className="header-icon-button"
          aria-label={themeLabel}
          onClick={() => {
            const index = themeOrder.indexOf(preference)
            setPreference(themeOrder[(index + 1) % themeOrder.length])
          }}
        >
          {themeIcon}
        </button>
        <button
          className="header-icon-button locale-button"
          aria-label={t('a11y.switchLanguage')}
          onClick={() => void setLocale((locale === 'zh-CN' ? 'en-US' : 'zh-CN') as Locale)}
        >
          <Languages size={14} />
          {locale === 'zh-CN' ? '中' : 'EN'}
        </button>
        {showAccountMenu && (
          <AccountMenu
            side="bottom"
            align="end"
            trigger={
              <button
                className="header-icon-button header-avatar-button"
                aria-label={session?.user.name ?? t('a11y.userMenu')}
              >
                <Avatar
                  className="header-avatar"
                  name={session?.user.name}
                  src={session?.user.avatarUrl}
                />
              </button>
            }
          />
        )}
      </div>
    </header>
  )
}

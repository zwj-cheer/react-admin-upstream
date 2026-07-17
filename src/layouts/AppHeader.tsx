import { Icon } from '@/components/ui/icon'
import { useLocation, useNavigation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useMatchedRoute } from '@/core/routing'
import { useRuntimeConfig } from '@/core/config/RuntimeConfigProvider'
import { useAuthStore } from '@/core/auth/authStore'
import { useThemeStore } from '@/core/theme/themeStore'
import { setLocale } from '@/core/i18n'
import type { Locale } from '@/core/i18n/localeResolver'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SheetTrigger } from '@/components/ui/sheet'
import { AccountMenu } from './AccountMenu'

const themeOrder = ['light', 'dark', 'system'] as const

export interface AppHeaderProps {
  /** 是否在页头显示账号菜单入口；由运行时 UI 配置决定。 */
  showAccountMenu: boolean
}

export function AppHeader({ showAccountMenu }: AppHeaderProps) {
  const { t, i18n } = useTranslation()
  const config = useRuntimeConfig()
  const location = useLocation()
  const navigation = useNavigation()
  const route = useMatchedRoute(location.pathname)
  const session = useAuthStore((state) => state.session)
  const preference = useThemeStore((state) => state.preference)
  const setPreference = useThemeStore((state) => state.setPreference)
  const locale = i18n.language === 'en-US' ? 'en-US' : 'zh-CN'
  const routePending = Boolean(navigation.location)

  const themeIcon =
    preference === 'light' ? (
      <Icon name="sun" size={16} />
    ) : preference === 'dark' ? (
      <Icon name="moon" size={16} />
    ) : (
      <Icon name="monitor" size={16} />
    )
  const themeLabel =
    preference === 'light'
      ? t('a11y.themeLight')
      : preference === 'dark'
        ? t('a11y.themeDark')
        : t('a11y.themeSystem')

  return (
    <header className="app-header" aria-busy={routePending || undefined}>
      {routePending ? (
        <div className="route-progress" role="status" aria-live="polite" aria-atomic="true">
          <span className="sr-only">{t('common.loading')}</span>
        </div>
      ) : null}
      <div className="app-header__left">
        <SheetTrigger asChild>
          <button className="header-icon-button nav-toggle" aria-label={t('a11y.openNavigation')}>
            <Icon name="menu" size={18} />
          </button>
        </SheetTrigger>
        <h1 className="page-title">{route ? t(route.titleKey) : config.app.name}</h1>
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
          <Icon name="languages" size={14} />
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
                <Avatar className="header-avatar" aria-label={session?.user.name}>
                  {session?.user.avatarUrl ? (
                    <AvatarImage alt={session.user.name} src={session.user.avatarUrl} />
                  ) : null}
                  <AvatarFallback>{session?.user.name.slice(0, 1) ?? 'A'}</AvatarFallback>
                </Avatar>
              </button>
            }
          />
        )}
      </div>
    </header>
  )
}

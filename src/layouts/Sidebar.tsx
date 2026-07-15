import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/ui/icon'
import { IconSprite } from '@/components/IconSprite'
import { useAuthStore } from '@/core/auth/authStore'
import { useRouteRegistry } from '@/core/routing'
import { useMenus } from '@/modules/menus/queries'
import { Avatar } from '@/components/ui/avatar'
import { AccountMenu } from './AccountMenu'
import { getMenuNavigation } from './navigation'
import type { ShellBranding } from './types'

export function Sidebar({
  open,
  onNavigate,
  branding,
  groupLabelKey,
  showAccountMenu,
}: {
  open: boolean
  onNavigate: () => void
  branding: ShellBranding
  groupLabelKey: string
  showAccountMenu: boolean
}) {
  const { t } = useTranslation()
  const session = useAuthStore((state) => state.session)
  const routes = useRouteRegistry()
  const menus = useMenus()
  const navigation = getMenuNavigation(routes, session, menus.data ?? [])

  return (
    <aside className={'app-sidebar' + (open ? ' is-open' : '')}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-mark">{branding.shortName}</div>
          <div className="brand-copy">
            <div className="brand-name">{branding.name}</div>
            <div className="brand-meta">{branding.edition}</div>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav" aria-label={t('a11y.primaryNavigation')}>
        <div className="sidebar-section">{t(groupLabelKey)}</div>
        {navigation.map(({ menuId, depth, route }) => (
          <NavLink
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
            key={menuId}
            onClick={onNavigate}
            style={{ paddingInlineStart: 10 + depth * 18 }}
            to={route.path}
          >
            <IconSprite name={route.icon} />
            <span>{t(route.titleKey)}</span>
          </NavLink>
        ))}
      </nav>
      {showAccountMenu && (
        <div className="sidebar-footer">
          <AccountMenu
            side="top"
            align="start"
            trigger={
              <button
                className="sidebar-user"
                type="button"
                aria-label={session?.user.name ?? t('a11y.userMenu')}
              >
                <Avatar
                  className="sidebar-avatar"
                  name={session?.user.name}
                  src={session?.user.avatarUrl}
                />
                <div className="sidebar-user-copy">
                  <div className="sidebar-user-name">{session?.user.name}</div>
                  <div className="sidebar-user-meta">{session?.source.toUpperCase()}</div>
                </div>
                <Icon className="sidebar-user-chevron" name="chevron-up" size={16} />
              </button>
            }
          />
        </div>
      )}
    </aside>
  )
}

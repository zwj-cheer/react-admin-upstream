import { Suspense, useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useRuntimeConfig } from '@/core/config/RuntimeConfigProvider'
import { Sidebar } from './Sidebar'
import { AppHeader } from './AppHeader'
import type { ShellBranding } from './types'

export function AppShell({
  branding,
  groupLabelKey,
}: {
  branding: ShellBranding
  groupLabelKey: string
}) {
  const { t } = useTranslation()
  const accountMenu = useRuntimeConfig().ui.accountMenu
  const [navigationOpen, setNavigationOpen] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', navigationOpen)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavigationOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth > 768) setNavigationOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.classList.remove('sidebar-open')
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [navigationOpen])

  return (
    <div className="app-layout">
      <Sidebar
        branding={branding}
        groupLabelKey={groupLabelKey}
        open={navigationOpen}
        showAccountMenu={accountMenu.sidebar}
        onNavigate={() => setNavigationOpen(false)}
      />
      <button
        className={'sidebar-mask' + (navigationOpen ? ' show' : '')}
        aria-label="Close navigation"
        onClick={() => setNavigationOpen(false)}
      />
      <div className="app-main">
        <AppHeader
          onOpenNavigation={() => setNavigationOpen(true)}
          showAccountMenu={accountMenu.header}
        />
        <main className="page-content page-enter">
          <Suspense
            fallback={
              <div className="page-loading" role="status" aria-live="polite">
                {t('common.loading')}
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

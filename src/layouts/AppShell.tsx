import { Suspense, useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useRuntimeConfig } from '@/core/config/RuntimeConfigProvider'
import type { ShellBranding } from '@/core/branding'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { AppHeader } from './AppHeader'
import type { ShellNavigationItem } from './types'

export function AppShell({
  branding,
  groupLabelKey,
  navigation,
}: {
  branding: ShellBranding
  groupLabelKey: string
  navigation: readonly ShellNavigationItem[]
}) {
  const { t } = useTranslation()
  const accountMenu = useRuntimeConfig().ui.accountMenu
  const [navigationOpen, setNavigationOpen] = useState(false)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 769px)')
    const closeOnDesktop = () => {
      if (desktop.matches) setNavigationOpen(false)
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  return (
    <Sheet open={navigationOpen} onOpenChange={setNavigationOpen}>
      <div className="app-layout">
        <Sidebar
          branding={branding}
          className="app-sidebar--desktop"
          groupLabelKey={groupLabelKey}
          navigation={navigation}
          showAccountMenu={accountMenu.sidebar}
          onNavigate={() => setNavigationOpen(false)}
        />
        <SheetContent className="mobile-navigation-sheet" side="left">
          <SheetHeader className="sr-only">
            <SheetTitle>{t('a11y.primaryNavigation')}</SheetTitle>
            <SheetDescription>{t('a11y.navigationDescription')}</SheetDescription>
          </SheetHeader>
          <Sidebar
            branding={branding}
            className="app-sidebar--mobile"
            groupLabelKey={groupLabelKey}
            navigation={navigation}
            showAccountMenu={accountMenu.sidebar}
            onNavigate={() => setNavigationOpen(false)}
          />
        </SheetContent>
        <div className="app-main">
          <AppHeader showAccountMenu={accountMenu.header} />
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
    </Sheet>
  )
}

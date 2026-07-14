import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { useThemeStore } from '@/core/theme/themeStore'
import type { ThemePreference } from '@/core/theme/themeResolver'
import { setLocale } from '@/core/i18n'
import type { Locale } from '@/core/i18n/localeResolver'

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t, i18n } = useTranslation()
  const preference = useThemeStore((state) => state.preference)
  const setPreference = useThemeStore((state) => state.setPreference)
  const locale = i18n.language === 'en-US' ? 'en-US' : 'zh-CN'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="settings-dialog">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
          <DialogDescription>{t('settings.subtitle')}</DialogDescription>
        </DialogHeader>
        <div className="settings-form">
          <label className="settings-field">
            <span className="settings-label">{t('settings.theme')}</span>
            <Select
              value={preference}
              onChange={(event) => setPreference(event.target.value as ThemePreference)}
            >
              <option value="light">{t('settings.themeLight')}</option>
              <option value="dark">{t('settings.themeDark')}</option>
              <option value="system">{t('settings.themeSystem')}</option>
            </Select>
          </label>
          <label className="settings-field">
            <span className="settings-label">{t('settings.language')}</span>
            <Select
              value={locale}
              onChange={(event) => void setLocale(event.target.value as Locale)}
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </Select>
          </label>
        </div>
      </DialogContent>
    </Dialog>
  )
}

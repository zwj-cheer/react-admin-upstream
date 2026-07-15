import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, type SelectOption } from '@/components/ui/select'
import { useThemeStore } from '@/core/theme/themeStore'
import type { ThemePreference } from '@/core/theme/themeResolver'
import { setLocale } from '@/core/i18n'
import type { Locale } from '@/core/i18n/localeResolver'

const localeOptions: SelectOption[] = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
]

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
  const themeOptions: SelectOption[] = [
    { label: t('settings.themeLight'), value: 'light' },
    { label: t('settings.themeDark'), value: 'dark' },
    { label: t('settings.themeSystem'), value: 'system' },
  ]

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
              options={themeOptions}
              value={preference}
              onChange={(value) => {
                if (value) setPreference(value as ThemePreference)
              }}
            />
          </label>
          <label className="settings-field">
            <span className="settings-label">{t('settings.language')}</span>
            <Select
              options={localeOptions}
              value={locale}
              onChange={(value) => {
                if (value) void setLocale(value as Locale)
              }}
            />
          </label>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useThemeStore } from '@/core/theme/themeStore'
import type { ThemePreference } from '@/core/theme/themeResolver'
import { setLocale } from '@/core/i18n'
import type { Locale } from '@/core/i18n/localeResolver'
import { Field, FieldGroup, FieldTitle } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

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
        <FieldGroup className="mt-5">
          <Field>
            <FieldTitle id="settings-theme">{t('settings.theme')}</FieldTitle>
            <ToggleGroup
              aria-labelledby="settings-theme"
              className="flex-wrap rounded-lg border border-[var(--border)] bg-[var(--bg)] p-1"
              type="single"
              value={preference}
              onValueChange={(value) => {
                if (value) setPreference(value as ThemePreference)
              }}
            >
              <ToggleGroupItem value="light">{t('settings.themeLight')}</ToggleGroupItem>
              <ToggleGroupItem value="dark">{t('settings.themeDark')}</ToggleGroupItem>
              <ToggleGroupItem value="system">{t('settings.themeSystem')}</ToggleGroupItem>
            </ToggleGroup>
          </Field>
          <Field>
            <FieldTitle id="settings-language">{t('settings.language')}</FieldTitle>
            <ToggleGroup
              aria-labelledby="settings-language"
              className="flex-wrap rounded-lg border border-[var(--border)] bg-[var(--bg)] p-1"
              type="single"
              value={locale}
              onValueChange={(value) => {
                if (value) void setLocale(value as Locale)
              }}
            >
              <ToggleGroupItem value="zh-CN">{t('settings.languageZhCn')}</ToggleGroupItem>
              <ToggleGroupItem value="en-US">{t('settings.languageEnUs')}</ToggleGroupItem>
            </ToggleGroup>
          </Field>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  )
}

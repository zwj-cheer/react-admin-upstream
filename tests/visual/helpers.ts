import { expect, type Page } from '@playwright/test'

export const visualViewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const

export const visualThemes = ['light', 'dark'] as const

export type VisualTheme = (typeof visualThemes)[number]
export type VisualViewportName = (typeof visualViewports)[number]['name']

/** 在应用脚本执行前固定主题，避免 system 偏好受测试机设置影响。 */
export async function setVisualTheme(page: Page, theme: VisualTheme): Promise<void> {
  await page.addInitScript((preference) => {
    localStorage.setItem('react-admin-template.theme:v1', preference)
  }, theme)
}

/** 确认启动门已经把存储偏好解析并应用到 html。 */
export async function expectVisualTheme(page: Page, theme: VisualTheme): Promise<void> {
  if (theme === 'dark') {
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  } else {
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
  }
}

/** 保留既有浅色基线命名；深色基线显式加入 dark，避免无意义地重录历史快照。 */
export function visualSnapshotName(
  pageName: string,
  theme: VisualTheme,
  viewport: VisualViewportName,
): string {
  return (
    [pageName, theme === 'dark' ? 'dark' : undefined, viewport].filter(Boolean).join('-') + '.png'
  )
}

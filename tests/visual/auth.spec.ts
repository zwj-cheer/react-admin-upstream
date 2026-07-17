import { expect, test } from '@playwright/test'
import {
  expectVisualTheme,
  setVisualTheme,
  visualSnapshotName,
  visualThemes,
  visualViewports,
} from './helpers'

for (const theme of visualThemes) {
  for (const viewport of visualViewports) {
    test(`login page - ${theme} - ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await setVisualTheme(page, theme)
      await page.goto('/login')
      await expect(page.getByRole('heading', { name: '登录 Admin Workspace' })).toBeVisible()
      await expectVisualTheme(page, theme)
      await expect(page).toHaveScreenshot(visualSnapshotName('login', theme, viewport.name), {
        animations: 'disabled',
        fullPage: true,
      })
    })
  }
}

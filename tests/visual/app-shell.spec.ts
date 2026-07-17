import { expect, test } from '@playwright/test'
import { loginAsAdmin } from '../e2e/helpers'
import {
  expectVisualTheme,
  setVisualTheme,
  visualSnapshotName,
  visualThemes,
  visualViewports,
} from './helpers'

for (const theme of visualThemes) {
  for (const viewport of visualViewports) {
    test(`users shell - ${theme} - ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await setVisualTheme(page, theme)
      await loginAsAdmin(page)
      await expect(page.getByRole('heading', { name: '用户管理' })).toBeVisible()
      await expect(page.getByRole('navigation', { name: '分页' })).toBeVisible()
      await expectVisualTheme(page, theme)
      await expect(page).toHaveScreenshot(visualSnapshotName('users', theme, viewport.name), {
        animations: 'disabled',
        fullPage: true,
      })
    })
  }
}

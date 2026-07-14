import { expect, test } from '@playwright/test'
import { loginAsAdmin } from '../e2e/helpers'

test('role management uses the shared table and action language', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await loginAsAdmin(page)
  await page.getByRole('link', { name: '角色管理' }).click()
  await expect(page).toHaveScreenshot('roles-desktop.png', {
    animations: 'disabled',
    fullPage: true,
  })
})

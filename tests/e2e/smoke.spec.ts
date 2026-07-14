import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './helpers'

test('mobile navigation opens and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await loginAsAdmin(page)
  await page.getByRole('button', { name: '打开导航菜单' }).click()
  await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('.app-sidebar')).not.toHaveClass(/is-open/)
})

import { expect, test } from '@playwright/test'
import { loginAsAdmin } from '../e2e/helpers'

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test('users shell - ' + viewport.name, async ({ page }) => {
    await page.setViewportSize(viewport)
    await loginAsAdmin(page)
    await expect(page).toHaveScreenshot('users-' + viewport.name + '.png', {
      animations: 'disabled',
      fullPage: true,
    })
  })
}

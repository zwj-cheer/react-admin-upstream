import { expect, test } from '@playwright/test'

test('login page matches the neutral prototype skin', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/login')
  await expect(page).toHaveScreenshot('login-desktop.png', {
    animations: 'disabled',
    fullPage: true,
  })
})

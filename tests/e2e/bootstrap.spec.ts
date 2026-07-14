import { expect, test } from '@playwright/test'

test('saved theme and language apply before the login application is visible', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('react-admin-template.theme', 'dark')
    localStorage.setItem('react-admin-template.locale', 'en-US')
  })
  await page.goto('/login')
  await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  await expect(page.getByRole('heading', { name: 'Sign in to Admin Workspace' })).toBeVisible()
})

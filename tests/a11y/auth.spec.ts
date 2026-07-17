import { test } from '@playwright/test'
import { createAxeBuilder, expectNoA11yViolations, waitForPageEnterAnimation } from './helpers'

test('login has no WCAG A/AA violations', async ({ page }) => {
  await page.goto('/login')
  await waitForPageEnterAnimation(page)
  const results = await createAxeBuilder(page).analyze()
  expectNoA11yViolations(results)
})

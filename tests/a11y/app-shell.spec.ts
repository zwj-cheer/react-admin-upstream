import { expect, test } from '@playwright/test'
import { loginAsAdmin } from '../e2e/helpers'
import { createAxeBuilder, expectNoA11yViolations, waitForPageEnterAnimation } from './helpers'

test('authenticated shell has no WCAG A/AA violations', async ({ page }) => {
  await loginAsAdmin(page)
  await expect(page.getByRole('heading', { name: '用户管理' })).toBeVisible()
  await waitForPageEnterAnimation(page)
  const results = await createAxeBuilder(page).analyze()
  expectNoA11yViolations(results)
})

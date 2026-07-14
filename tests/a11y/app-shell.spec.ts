import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { loginAsAdmin } from '../e2e/helpers'

test('authenticated shell has no serious WCAG A/AA violations', async ({ page }) => {
  await loginAsAdmin(page)
  await page.waitForTimeout(400)
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(
    results.violations.filter((violation) =>
      ['serious', 'critical'].includes(violation.impact ?? ''),
    ),
  ).toEqual([])
})

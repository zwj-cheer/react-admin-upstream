import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('login has no serious WCAG A/AA violations', async ({ page }) => {
  await page.goto('/login')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(
    results.violations.filter((violation) =>
      ['serious', 'critical'].includes(violation.impact ?? ''),
    ),
  ).toEqual([])
})

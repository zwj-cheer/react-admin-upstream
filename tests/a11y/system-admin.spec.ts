import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { loginAsAdmin } from '../e2e/helpers'

test('role dialog remains keyboard and screen-reader compatible', async ({ page }) => {
  await loginAsAdmin(page)
  await page.getByRole('link', { name: '角色管理' }).click()
  await page.getByRole('button', { name: '新建' }).click()
  await page.waitForTimeout(250)
  const results = await new AxeBuilder({ page })
    .include('.dialog-content')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(
    results.violations.filter((violation) =>
      ['serious', 'critical'].includes(violation.impact ?? ''),
    ),
  ).toEqual([])
})

test('management status switches expose the affected item in their name', async ({ page }) => {
  await loginAsAdmin(page)
  await page.getByRole('link', { name: '角色管理' }).click()
  await expect(page.getByRole('switch', { name: '超级管理员 状态' })).toBeVisible()

  await page.getByRole('link', { name: '菜单管理' }).click()
  await expect(page.getByRole('switch', { name: '用户管理 状态' })).toBeVisible()
})

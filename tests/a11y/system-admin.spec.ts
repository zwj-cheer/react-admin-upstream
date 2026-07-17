import { expect, test } from '@playwright/test'
import { loginAsAdmin, navigateToAdminPage } from '../e2e/helpers'
import { createAxeBuilder, expectNoA11yViolations } from './helpers'

test('role dialog remains keyboard and screen-reader compatible', async ({ page }) => {
  await loginAsAdmin(page)
  await navigateToAdminPage(page, '角色管理')
  await page.getByRole('button', { name: '新建' }).click()
  const dialog = page.getByRole('dialog', { name: '新建角色' })
  await expect(dialog).toBeVisible()
  await dialog.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  )
  const results = await createAxeBuilder(page).include('[role="dialog"]').analyze()
  expectNoA11yViolations(results)
})

test('management status switches expose the affected item in their name', async ({ page }) => {
  await loginAsAdmin(page)
  await navigateToAdminPage(page, '角色管理')
  await expect(page.getByRole('switch', { name: '超级管理员 状态' })).toBeVisible()

  await navigateToAdminPage(page, '菜单管理')
  await expect(page.getByRole('switch', { name: '用户管理 状态' })).toBeVisible()
})

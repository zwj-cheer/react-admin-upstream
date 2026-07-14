import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './helpers'

test('admin can create user, role, and registered menu through the REST adapter', async ({
  page,
}) => {
  await loginAsAdmin(page)

  await page.getByRole('button', { name: '新建' }).click()
  await page.getByLabel('名称').fill('测试用户')
  await page.getByLabel('邮箱').fill('test.user@example.com')
  await page.getByRole('button', { name: '保存' }).click()
  await expect(page.getByRole('table').getByText('test.user@example.com')).toBeVisible()

  await page.getByRole('link', { name: '角色管理' }).click()
  await page.getByRole('button', { name: '新建' }).click()
  await page.getByLabel('名称').fill('测试角色')
  await page.getByLabel('编码').fill('test_role')
  await page.getByLabel('说明').fill('自动化测试角色')
  await page.getByRole('button', { name: '保存' }).click()
  await expect(page.getByRole('table').getByText('test_role')).toBeVisible()

  await page.getByRole('link', { name: '菜单管理' }).click()
  await page.getByRole('button', { name: '新建' }).click()
  await page.getByLabel('名称').fill('测试菜单')
  await page.getByLabel('图标').fill('menu')
  await page.getByRole('button', { name: '保存' }).click()
  await expect(page.getByRole('table').getByText('测试菜单')).toBeVisible()
})

test('a rejected mutation stays retryable and reports the failure', async ({ page }) => {
  await loginAsAdmin(page)
  await page.getByRole('link', { name: '角色管理' }).click()
  await page.getByRole('button', { name: '新建' }).click()
  await page.getByLabel('名称').fill('重复角色')
  await page.getByLabel('编码').fill('admin')
  await page.getByLabel('说明').fill('触发编码冲突')
  await page.getByRole('button', { name: '保存' }).click()

  await expect(page.getByText('操作失败，请重试')).toBeVisible()
  await expect(page.getByRole('dialog')).toBeVisible()
})

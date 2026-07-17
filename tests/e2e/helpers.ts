import { expect, type Page } from '@playwright/test'

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('邮箱').fill('admin@example.com')
  await page.getByLabel('密码').fill('Admin123!')
  await page.getByRole('button', { name: '账号密码登录' }).click()
  await page.waitForURL('**/users')
}

export async function navigateToAdminPage(
  page: Page,
  name: '用户管理' | '角色管理' | '菜单管理',
): Promise<void> {
  await page.getByRole('link', { name }).click()
  await expect(page.getByRole('heading', { name })).toBeVisible()
}

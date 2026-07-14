import type { Page } from '@playwright/test'

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('邮箱').fill('admin@example.com')
  await page.getByLabel('密码').fill('Admin123!')
  await page.getByRole('button', { name: '账号密码登录' }).click()
  await page.waitForURL('**/users')
}

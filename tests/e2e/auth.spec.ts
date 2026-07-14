import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './helpers'

test('oidc-only mode displays exactly one organization login entry', async ({ page }) => {
  await page.route('**/config/runtime.json', async (route) => {
    const appOrigin = new URL(route.request().url()).origin

    await route.fulfill({
      json: {
        schemaVersion: 1,
        app: { name: 'Admin Workspace' },
        api: { baseUrl: '/api', timeoutMs: 10000 },
        auth: {
          mode: 'oidc',
          local: { csrfHeaderName: 'x-csrf-token' },
          oidc: {
            authority: `${appOrigin}/oidc`,
            clientId: 'browser-test-client',
            redirectPath: '/auth/callback',
            postLogoutRedirectPath: '/login',
            scope: 'openid profile email',
          },
        },
        defaults: { theme: 'system', locale: 'zh-CN' },
        mock: { enabled: true },
      },
    })
  })

  await page.goto('/login')

  await expect(page.getByRole('button', { name: '使用组织账号登录' })).toHaveCount(1)
  await expect(page.getByRole('button', { name: '账号密码登录' })).toHaveCount(0)
  await expect(page.getByLabel('邮箱')).toHaveCount(0)
  await expect(page.getByLabel('密码')).toHaveCount(0)
})

test('local login restores after refresh and logout clears the session', async ({ page }) => {
  await loginAsAdmin(page)
  await expect(page.getByRole('heading', { name: '用户管理' })).toBeVisible()

  await page.reload()
  await expect(page).toHaveURL(/\/users$/)
  await expect(page.getByText('admin@example.com').first()).toBeVisible()

  await page.getByRole('button', { name: '张明', exact: true }).click()
  await page.getByRole('menuitem', { name: '退出登录' }).click()
  await expect(page).toHaveURL(/\/login/)
})

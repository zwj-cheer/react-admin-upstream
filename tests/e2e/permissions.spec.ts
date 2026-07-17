import { expect, test } from '@playwright/test'

test('a read-only session hides mutations and backend access stays capability based', async ({
  page,
}) => {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      'react-admin-template.mock-session:v1',
      JSON.stringify({ source: 'local', userId: 'user-audit' }),
    )
  })
  await page.goto('/roles')
  await expect(page.getByRole('heading', { name: '角色管理' })).toBeVisible()
  await expect(page.getByRole('button', { name: '新建' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /编辑/ })).toHaveCount(0)
})

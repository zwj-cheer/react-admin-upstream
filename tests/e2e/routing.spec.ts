import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './helpers'

test('route loaders expose global pending feedback until navigation data is ready', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window)
    window.fetch = async (...args) => {
      const input = args[0]
      const url = input instanceof Request ? input.url : String(input)
      if (url.includes('/api/roles?') && url.includes('pageSize=8')) {
        await new Promise<void>((resolve) => {
          window.addEventListener('react-admin:release-roles', () => resolve(), { once: true })
        })
      }
      return originalFetch(...args)
    }
  })

  await loginAsAdmin(page)
  const header = page.getByRole('banner')
  const navigation = page.getByRole('link', { name: '角色管理' }).click()

  await expect(header).toHaveAttribute('aria-busy', 'true')
  await expect(header.getByRole('status')).toContainText('加载中')

  await page.evaluate(() => window.dispatchEvent(new Event('react-admin:release-roles')))
  await navigation

  await expect(page).toHaveURL(/\/roles$/)
  await expect(page.getByRole('heading', { name: '角色管理' })).toBeVisible()
  await expect(header).not.toHaveAttribute('aria-busy', 'true')
  await expect(header.getByRole('status')).toHaveCount(0)
})

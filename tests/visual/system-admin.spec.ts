import { expect, test } from '@playwright/test'
import { loginAsAdmin } from '../e2e/helpers'
import {
  expectVisualTheme,
  setVisualTheme,
  visualSnapshotName,
  visualThemes,
  visualViewports,
} from './helpers'

const managementPages = [
  {
    heading: '角色管理',
    name: 'roles',
    path: '/roles',
    readySwitch: '超级管理员 状态',
  },
  {
    heading: '菜单管理',
    name: 'menus',
    path: '/menus',
    readySwitch: '用户管理 状态',
  },
] as const

for (const managementPage of managementPages) {
  for (const theme of visualThemes) {
    for (const viewport of visualViewports) {
      test(`${managementPage.name} - ${theme} - ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize(viewport)
        await setVisualTheme(page, theme)
        await loginAsAdmin(page)
        await page.goto(managementPage.path)
        await expect(page.getByRole('heading', { name: managementPage.heading })).toBeVisible()
        await expect(page.getByRole('switch', { name: managementPage.readySwitch })).toBeVisible()
        await expectVisualTheme(page, theme)
        await expect(page).toHaveScreenshot(
          visualSnapshotName(managementPage.name, theme, viewport.name),
          {
            animations: 'disabled',
            fullPage: true,
          },
        )
      })
    }
  }
}

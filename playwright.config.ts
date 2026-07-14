import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:5174',
    channel: 'chrome',
    trace: 'off',
    video: 'off',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
    locale: 'zh-CN',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'e2e',
      testMatch: /e2e\/.*\.spec\.ts/,
    },
    {
      name: 'visual',
      testMatch: /visual\/.*\.spec\.ts/,
    },
    {
      name: 'a11y',
      testMatch: /a11y\/.*\.spec\.ts/,
    },
  ],
})

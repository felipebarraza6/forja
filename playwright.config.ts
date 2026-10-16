import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const BASE = `http://127.0.0.1:${PORT}/forja/`

export default defineConfig({
  testDir: './e2e',
  testIgnore: ['**/real/**'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'docs/validation-screenshots/e2e-results.json' }],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  outputDir: 'test-results',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'es-CL',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run build && npx vite preview --host 127.0.0.1 --port ${PORT}`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})

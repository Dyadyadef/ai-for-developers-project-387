import { defineConfig, devices } from '@playwright/test'

/**
 * Адреса реальных сервисов, которые Playwright поднимает сам через `webServer`.
 * Backend — ASP.NET (in-memory), frontend — Vite dev-сервер с проксированием на backend.
 */
export const FRONTEND_PORT = 5400
export const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`
export const BACKEND_URL = 'http://localhost:5002'

export default defineConfig({
  testDir: './tests',
  // In-memory backend хранит общее состояние между тестами, поэтому гоняем последовательно.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      // Реальный backend. /owner — лёгкий health-check эндпоинт.
      command: 'dotnet run --project ../backend/BookCalls.Api',
      url: `${BACKEND_URL}/owner`,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
      timeout: 180_000,
    },
    {
      // Vite dev-сервер, проксирующий API-запросы на реальный backend.
      command: `npm run dev -- --port ${FRONTEND_PORT} --strictPort`,
      cwd: '../frontend',
      url: FRONTEND_URL,
      env: { VITE_API_PROXY_TARGET: BACKEND_URL },
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
      timeout: 120_000,
    },
  ],
})

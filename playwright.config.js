import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5173',
    headless: false,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'cd frontend && npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
})
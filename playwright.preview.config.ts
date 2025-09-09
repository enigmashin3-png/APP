import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    headless: true,
    baseURL: 'http://localhost:4173',
  },
  webServer: {
    command: 'vite preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
  },
});


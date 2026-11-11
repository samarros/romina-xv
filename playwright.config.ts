import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  outputDir: './test-results/browser',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { channel: process.env.PW_CHANNEL || 'msedge', baseURL: 'http://127.0.0.1:4180/romina-xv/', headless: true, trace: 'retain-on-failure' },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4180 --strictPort --base /romina-xv/',
    url: 'http://127.0.0.1:4180/romina-xv/',
    reuseExistingServer: false,
  },
});

import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/development', outputDir: './test-results/development', workers: 1, reporter: 'list',
  use: { channel: 'msedge', headless: true, baseURL: 'http://127.0.0.1:4182' },
  webServer: { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4182 --strictPort', url: 'http://127.0.0.1:4182', reuseExistingServer: false },
});

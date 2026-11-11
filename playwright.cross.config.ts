import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/cross-browser', outputDir: './test-results/cross-browser', workers: 1, fullyParallel: false, reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4185/romina-xv/', headless: true, trace: 'retain-on-failure' },
  projects: [
    { name: 'edge', use: { browserName: 'chromium', channel: 'msedge' } },
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: { command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4185 --strictPort --base /romina-xv/', url: 'http://127.0.0.1:4185/romina-xv/', reuseExistingServer: false },
});

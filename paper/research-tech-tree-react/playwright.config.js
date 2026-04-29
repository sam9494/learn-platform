const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: [
    {
      command: 'node server/index.js',
      port: 3002,
      reuseExistingServer: true,
    },
    {
      command: 'node node_modules/vite/bin/vite.js',
      port: 5173,
      reuseExistingServer: true,
    },
  ],
});

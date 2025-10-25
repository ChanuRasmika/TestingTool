import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false, // API tests should run sequentially to avoid conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1, // Single worker for API tests to prevent database conflicts
  reporter: [
    ['html', { outputFolder: '../playwright-report/api', open: 'never' }],
    ['json', { outputFile: '../test-results/api-results.json' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:5000',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
  },
  // Ensure backend server is running
  webServer: {
    command: 'npm --prefix ../../backend run dev',
    url: 'http://localhost:5000/api/',
    reuseExistingServer: true,
    timeout: 30000,
  },
  projects: [
    {
      name: 'api-tests',
      testMatch: '**/*.api.spec.js',
    }
  ]
});
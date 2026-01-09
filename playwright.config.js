import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './test/e2e',

  // Match only test files in web directory
  testMatch: '*.test.js',

  // Maximum time one test can run
  timeout: 30000,

  // Fail fast on CI
  fullyParallel: true,

  // Retry failed tests on CI
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],

  // Start local server to serve files (required for ESM imports)
  webServer: {
    command: 'npx serve -l 3000 --no-clipboard',
    port: 3000,
    reuseExistingServer: !process.env.CI
  },

  // Shared settings for all projects
  use: {
    // Base URL for page.goto() with relative paths
    baseURL: 'http://localhost:3000',

    // Collect trace on failure for debugging
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure'
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }

    // Mobile browsers (optional - uncomment to test)
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] }
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] }
    // }
  ]
})

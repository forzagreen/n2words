import { test, expect } from '@playwright/test'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const testRunnerPath = join(__dirname, 'test-runner.html')

/**
 * Browser Compatibility Tests using Playwright
 *
 * Tests the n2words UMD bundles in real browsers (Chromium, Firefox, WebKit).
 * Validates that all 48 language converters work correctly in browser environments.
 */

// Configure test timeout for browser tests
test.setTimeout(30000)

test.describe('Browser Compatibility', () => {
  test('Chromium browser compatibility', async ({ page }) => {
    await testBrowserCompatibility(page, 'Chromium')
  })

  test('Firefox browser compatibility', async ({ page }) => {
    await testBrowserCompatibility(page, 'Firefox')
  })

  test('WebKit (Safari) browser compatibility', async ({ page }) => {
    await testBrowserCompatibility(page, 'WebKit')
  })
})

/**
 * Test n2words compatibility in a specific browser
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} browserName - Browser name for logging
 */
async function testBrowserCompatibility (page, browserName) {
  // Navigate to test runner HTML
  await page.goto(`file://${testRunnerPath}`)

  // Wait for tests to complete (status changes to "Complete")
  await page.waitForSelector('#status:has-text("Complete")', {
    timeout: 10000
  })

  // Get test status
  const statusText = await page.locator('#status').textContent()

  // Get test summary from the page
  const testSummary = await page.evaluate(() => {
    const summaryEl = document.querySelector('.summary-stats')
    return summaryEl ? summaryEl.textContent.trim() : 'No summary available'
  })

  console.log(`\n${browserName}: ${testSummary}`)

  // Verify all tests passed
  expect(statusText).toContain('All tests passed')

  // Verify no failures (✗ symbol indicates failure)
  const hasFailures = await page.locator('.fail').count()
  expect(hasFailures).toBe(0)

  // Additional validation: check that n2words is loaded
  const n2wordsLoaded = await page.evaluate(() => {
    return typeof window.n2words !== 'undefined'
  })
  expect(n2wordsLoaded).toBe(true)

  // Validate a sample conversion works
  const sampleConversion = await page.evaluate(() => {
    return window.n2words.EnglishConverter(42)
  })
  expect(sampleConversion).toBe('forty-two')
}

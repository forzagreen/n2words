import { test, expect } from '@playwright/test'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const testRunnerPath = join(__dirname, 'test-runner.html')

/**
 * Browser Compatibility Tests using Playwright
 *
 * Tests the n2words UMD bundle loads correctly in real browsers.
 * Validates that the UMD wrapper works across browser engines.
 *
 * Note: Conversion correctness is tested in integration/languages.test.js.
 * These tests focus on browser-specific UMD loading behavior only.
 */

test.setTimeout(30000)

test.describe('Browser Compatibility', () => {
  test('Chromium loads UMD bundle', async ({ page }) => {
    await testBrowserLoadsBundle(page)
  })

  test('Firefox loads UMD bundle', async ({ page }) => {
    await testBrowserLoadsBundle(page)
  })

  test('WebKit loads UMD bundle', async ({ page }) => {
    await testBrowserLoadsBundle(page)
  })
})

/**
 * Test that UMD bundle loads and exports converters in browser
 * @param {import('@playwright/test').Page} page Playwright page object
 */
async function testBrowserLoadsBundle (page) {
  // Navigate to test runner HTML
  await page.goto(`file://${testRunnerPath}`)

  // Wait for tests to complete
  await page.waitForSelector('#status:has-text("Complete")', { timeout: 10000 })

  // Get test results
  const statusText = await page.locator('#status').textContent()
  const failCount = await page.locator('.fail').count()

  // Log summary
  const summary = await page.evaluate(() => {
    const el = document.querySelector('.summary-stats')
    return el ? el.textContent.trim() : ''
  })
  console.log(`  ${summary}`)

  // Verify all HTML tests passed
  expect(statusText).toContain('All tests passed')
  expect(failCount).toBe(0)

  // Verify n2words global exists
  const n2wordsLoaded = await page.evaluate(() => {
    return typeof window.n2words === 'object' && window.n2words !== null
  })
  expect(n2wordsLoaded).toBe(true)
}

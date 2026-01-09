import { test, expect } from '@playwright/test'

/**
 * E2E Browser Tests using Playwright
 *
 * Tests both UMD and ESM bundles load correctly in real browsers.
 * Validates that the bundles work across browser engines (Chromium, Firefox, WebKit).
 *
 * Note: Conversion correctness is tested in integration/languages.test.js.
 * These tests focus on browser-specific bundle loading behavior.
 */

test.setTimeout(30000)

test.describe('UMD Bundle', () => {
  test('loads via script tag and exposes n2words global', async ({ page }) => {
    await page.goto('/test/e2e/umd-runner.html')

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

    // Verify n2words global exists with converters
    const convertersLoaded = await page.evaluate(() => {
      return typeof window.n2words === 'object' &&
             window.n2words !== null &&
             typeof window.n2words.en === 'function' &&
             typeof window.n2words.zhHans === 'function'
    })
    expect(convertersLoaded).toBe(true)
  })
})

test.describe('ESM Bundle', () => {
  test('loads via script type="module" with named exports', async ({ page }) => {
    await page.goto('/test/e2e/esm-runner.html')

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
  })
})

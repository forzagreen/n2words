import test from 'ava'
import { Browser, Builder, By, until } from 'selenium-webdriver'
import 'chromedriver'
import { cwd } from 'node:process'
import { existsSync } from 'node:fs'

// Register tests at top level for AVA to discover
test('Chrome browser compatibility', async t => {
  await testBrowser(Browser.CHROME, t)
})

// Note: EDGE requires separate installation; uncomment if available
// test('Edge browser compatibility', async t => {
//   await testBrowser(Browser.EDGE, t)
// })

test('Firefox browser compatibility', async t => {
  await testBrowser(Browser.FIREFOX, t)
})

// Note: INTERNET_EXPLORER is deprecated and no longer supported by Selenium
// SAFARI requires macOS with special setup; uncomment on macOS if available

/**
 * Use browser to confirm working state of project.
 * @param {string} browser Browser object to use.
 * @param {object} t AVA test context.
 * @see `Browser`
 */
async function testBrowser (browser, t) {
  let driver

  try {
    driver = new Builder().forBrowser(browser).build()

    await driver.get(`file://${cwd()}/test/web/index.html`)

    // Wait for all tests to complete
    await driver.wait(
      until.elementTextContains(
        driver.findElement(By.css('#status')),
        'Complete'
      ),
      10000 // 10 second timeout
    )

    // Check overall test status
    const status = await driver.findElement(By.css('#status'))
    const statusText = await status.getText()
    t.true(statusText.includes('All tests passed'), `Browser test failed. Status: ${statusText}`)

    // Get detailed test results for better error reporting
    const results = await driver.findElement(By.css('#results'))
    const resultsText = await results.getText()

    // Log results for debugging
    console.log(`${browser} test results:`)
    console.log(resultsText)

    // Verify no failures in detailed results
    t.false(resultsText.includes('✗'), `Some browser tests failed:\n${resultsText}`)
  } finally {
    if (driver) {
      await driver.close()
    }
  }
}

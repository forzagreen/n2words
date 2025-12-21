import test from 'ava'
import { Browser, Builder, By, until } from 'selenium-webdriver'
import 'chromedriver'
import { cwd } from 'node:process'
import { existsSync } from 'node:fs'

if (existsSync('./dist/n2words.js')) {
  await testBrowser(Browser.CHROME)
  // Note: EDGE requires separate installation; uncomment if available
  // await testBrowser(Browser.EDGE)
  await testBrowser(Browser.FIREFOX)
  // Note: INTERNET_EXPLORER is deprecated and no longer supported by Selenium
  // SAFARI requires macOS with special setup; uncomment on macOS if available
} else {
  console.error('ERROR: You must run "npm run web:build" first.')
}

/**
 * Use browser to confirm working state of project.
 * @param {string} browser Browser object to use.
 * @see `Browser`
 */
async function testBrowser (browser) {
  test(browser, async t => {
    let driver

    try {
      driver = new Builder().forBrowser(browser).build()

      await driver.get(`file://${cwd()}/test/web/index.html`)

      await driver.wait(
        until.elementTextContains(
          driver.findElement(By.css('#result')),
          'Result:'
        )
      )

      const result = await driver.findElement(By.css('#result'))

      t.true(await result.getText() === 'Result: Success')
    } finally {
      if (driver) {
        await driver.close()
      }
    }
  })
}

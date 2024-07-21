//// eslint-disable import/no-nodejs-modules
//// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import { Browser, Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
//// eslint-disable-next-line import/no-unassigned-import
import 'chromedriver';
import { cwd } from 'node:process';

const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--disable-web-security');

await testBrowser(Browser.CHROME, chromeOptions);

/**
 * Use browser to confirm working state of project.
 * @param {string} browser Browser object to use.
 * @param {chrome.Options} options Chrome options
 * @see `Browser`
 */
async function testBrowser(browser, options) {
  test(browser, async t => {
    const driver = new Builder()
      .forBrowser(browser)
      .setChromeOptions(options)
      .build();

    await driver.get(`file://${cwd()}/test/web/index.html`);

    // Get <p id="result">...</p> element
    const resultElement = await driver.findElement(By.css('#result'));

    // Wait till inline script writes test result
    await driver.wait(
      until.elementTextContains(
        resultElement,
        'Result:'
      )
    );

    // Check if inline test succeeded
    t.true((await resultElement.getText()) == 'Result: Success');

    await driver.close();
  });
}

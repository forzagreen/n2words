// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import test from 'ava';
import {Browser, Builder, By, until} from 'selenium-webdriver';
// eslint-disable-next-line import/no-nodejs-modules
import * as process from 'node:process';
// eslint-disable-next-line import/no-unassigned-import
import 'chromedriver';

testBrowser(Browser.CHROME);

/**
 * Test browser
 * @param {string} browser See `Browser.*`
 */
async function testBrowser(browser) {
  test(browser, async t => {
    const cwd = process.cwd();
    const driver = new Builder().forBrowser(browser).build();
    await driver.get('file://' + cwd + '/test/web/index.html');
    await driver.wait(until.elementTextContains(driver.findElement(By.css('#result')), 'Result:'));
    t.true(await (await driver.findElement(By.css('#result'))).getText() == 'Result: Success');
    await driver.close();
  });
}

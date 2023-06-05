/* eslint-disable import/no-nodejs-modules */
// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import test from 'ava';
import {Browser, Builder, By, until} from 'selenium-webdriver';
// eslint-disable-next-line import/no-unassigned-import
import 'chromedriver';
import * as process from 'node:process';
import fs from 'fs';

const file = process.cwd() + '/test/web/index.html';

if (!fs.existsSync(file)) {
  throw new Error('You must run npm run build first.');
} else {
  testBrowser(Browser.CHROME);
}

/**
 * Test browser
 * @param {string} browser See `Browser.*`
 */
async function testBrowser(browser) {
  test(browser, async t => {
    const driver = new Builder().forBrowser(browser).build();
    await driver.get('file://' + file);
    await driver.wait(until.elementTextContains(driver.findElement(By.css('#result')), 'Result:'));
    t.true(await (await driver.findElement(By.css('#result'))).getText() == 'Result: Success');
    await driver.close();
  });
}

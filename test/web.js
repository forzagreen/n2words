//// eslint-disable import/no-nodejs-modules
//// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import { Browser, Builder, By, until } from 'selenium-webdriver';
//// eslint-disable-next-line import/no-unassigned-import
import 'chromedriver';
import { cwd } from 'node:process';

await testBrowser(Browser.CHROME);

/**
 * Use browser to confirm working state of project.
 * @param {string} browser Browser object to use.
 * @see `Browser`
 */
async function testBrowser(browser) {
  test(browser, async t => {
    const options = new Chrome.Options();
    const driver = new Builder()
      .forBrowser(browser)
      .setChromeOptions(options.addArguments('--disable-web-security'))
      .build();

    await driver.get(`file://${cwd()}/test/web/index.html`);

    await driver.wait(
      until.elementTextContains(
        driver.findElement(By.css('#result')),
        'Result:'
      )
    );

    const result = await driver.findElement(By.css('#result'));

    t.true((await result.getText()) == 'Result: Success');

    await driver.close();
  });
}

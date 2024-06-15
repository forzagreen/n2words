//// eslint-disable import/max-dependencies
//// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import n2words from '../lib/n2words.js';
//// eslint-disable-next-line import/no-nodejs-modules
import * as fs from 'node:fs';

const files = fs.readdirSync('./test/i18n');

for (const file of files) {
  if (file.includes('.js')) {
    await testLanguage(file);
  }
}

/**
 * Run i18n tests for specific language
 * @param {string} file language test file to run
 */
async function testLanguage(file) {
  const language = file.replace('.js', '');

  test(language, async t => {
    const testFile = await import('./i18n/' + file);

    for (const test of testFile.default) {
      t.is(
        n2words(test[0], Object.assign({ lang: language }, test[2])),
        test[1]
      );
    }
  });
}

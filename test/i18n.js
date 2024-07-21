//// eslint-disable import/max-dependencies
//// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import n2words from '../lib/n2words.js';
//// eslint-disable-next-line import/no-nodejs-modules
import { readdirSync } from 'node:fs';

const files = readdirSync('./lib/i18n');

for (const file of files) {
  await testLanguage(file.replace('.js', ''));
}

/**
 * Run i18n tests for specific language
 * @param {string} language language test file to run
 */
async function testLanguage(language) {
  test(language, async t => {
    const { default: testFile } = await import('./i18n/' + language + '.js');

    if (testFile instanceof Error || testFile instanceof TypeError) {
      t.fail('Missing test file.');
    }

    for (const test of testFile) {
      t.is(
        await n2words(test[0], Object.assign({ lang: language }, test[2])),
        test[1]
      );
    }
  });
}

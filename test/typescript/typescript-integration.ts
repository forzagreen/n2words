/**
 * TypeScript smoke test for n2words
 * Verifies that TypeScript can import and use n2words with proper types
 */

import test from 'ava';
import n2words, { type N2WordsOptions } from 'n2words';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

test('N2WordsOptions type works', (t) => {
  // Test N2WordsOptions type compilation
  const options1: N2WordsOptions = { lang: 'en' };
  const options2: N2WordsOptions = { lang: 'fr-BE' };
  const options3: N2WordsOptions = {};

  t.truthy(options1);
  t.truthy(options2);
  t.truthy(options3);
});

test('main module import with default language', (t) => {
  const result: string = n2words(42);
  t.is(typeof result, 'string');
  t.true(result.length > 0);
});

test('main module with language option', (t) => {
  const options: N2WordsOptions = { lang: 'en' };
  const result: string = n2words(100, options);
  t.is(typeof result, 'string');
  t.true(result.length > 0);
});

test('direct language imports work', async (t) => {
  const { default: en } = await import('n2words/i18n/en');
  const { default: es } = await import('n2words/i18n/es');
  const { default: fr } = await import('n2words/i18n/fr');

  const result1: string = en(123);
  const result2: string = es(456);
  const result3: string = fr(789);

  t.is(typeof result1, 'string');
  t.is(typeof result2, 'string');
  t.is(typeof result3, 'string');
  t.true(result1.length > 0);
  t.true(result2.length > 0);
  t.true(result3.length > 0);
});

test('input type variations work', (t) => {
  // BigInt
  const result1: string = n2words(1000000n);
  t.is(typeof result1, 'string');
  t.true(result1.length > 0);

  // String input
  const result2: string = n2words('42');
  t.is(typeof result2, 'string');
  t.true(result2.length > 0);

  // Negative number
  const result3: string = n2words(-42, { lang: 'en' });
  t.is(typeof result3, 'string');
  t.true(result3.length > 0);

  // Decimal number
  const result4: string = n2words(3.14, { lang: 'en' });
  t.is(typeof result4, 'string');
  t.true(result4.length > 0);
});

test('all language imports work', async (t) => {
  // Dynamically discover all language files
  const i18nDir = join(process.cwd(), 'lib', 'i18n');
  const languageFiles = readdirSync(i18nDir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => file.replace('.js', ''))
    .sort();

  // Test all language imports with a simple number
  const testNumber = 42;
  const allLanguageTests: Array<{ lang: string; result: string }> = [];

  for (const langCode of languageFiles) {
    const { default: langFn } = await import(`n2words/i18n/${langCode}`);
    const result: string = langFn(testNumber);
    allLanguageTests.push({ lang: langCode, result });
  }

  // Verify all language imports work and return strings
  for (const test of allLanguageTests) {
    t.is(typeof test.result, 'string', `${test.lang} should return string`);
    t.true(
      test.result.length > 0,
      `${test.lang} should return non-empty string`,
    );
  }

  t.is(
    allLanguageTests.length,
    languageFiles.length,
    'All languages should be tested',
  );
});

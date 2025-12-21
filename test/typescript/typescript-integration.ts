/**
 * TypeScript integration test for n2words
 * Verifies that TypeScript can import and use n2words with proper types,
 * tests language-specific options, type constraints, and catches type regressions
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import n2words from 'n2words';
import type { N2WordsOptions, LanguageCode } from '../../typings/n2words.js';
import type { ChineseOptions } from '../../typings/languages/zh-Hans.js';
import type { SpanishOptions } from '../../typings/languages/es.js';
import type { HebrewOptions } from '../../typings/languages/he.js';
import type { DutchOptions } from '../../typings/languages/nl.js';
import type { ArabicOptions } from '../../typings/languages/ar.js';
import type { SlavicOptions } from '../../typings/languages/ru.js';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

test('N2WordsOptions type works', () => {
  // Test basic N2WordsOptions type compilation
  const options1: N2WordsOptions = { lang: 'en' };
  const options2: N2WordsOptions = { lang: 'fr-BE' };
  const options3: N2WordsOptions = {};

  // Test that LanguageCode type constrains language values
  const validLang: LanguageCode = 'zh-Hans';
  const optionsWithValidLang: N2WordsOptions = { lang: validLang };

  assert.ok(options1);
  assert.ok(options2);
  assert.ok(options3);
  assert.ok(optionsWithValidLang);
});

test('language-specific options type safety', () => {
  // Chinese options
  const chineseOptions: ChineseOptions = { formal: true };
  const chineseN2Words: N2WordsOptions = { lang: 'zh-Hans', formal: true };

  // Spanish options
  const spanishOptions: SpanishOptions = { genderStem: 'a' };
  const spanishN2Words: N2WordsOptions = { lang: 'es', genderStem: 'o' };

  // Hebrew options
  const hebrewOptions: HebrewOptions = {
    feminine: true,
    biblical: false,
    and: 'ו',
  };
  const hebrewN2Words: N2WordsOptions = {
    lang: 'he',
    feminine: true,
    biblical: true,
  };

  // Dutch options
  const dutchOptions: DutchOptions = {
    includeOptionalAnd: true,
    accentOne: true,
  };
  const dutchN2Words: N2WordsOptions = {
    lang: 'nl',
    includeOptionalAnd: false,
  };

  // Arabic options
  const arabicOptions: ArabicOptions = { feminine: true, negativeWord: 'سالب' };
  const arabicN2Words: N2WordsOptions = { lang: 'ar', feminine: false };

  // Slavic options (applies to multiple languages)
  const slavicOptions: SlavicOptions = { feminine: true };
  const russianN2Words: N2WordsOptions = { lang: 'ru', feminine: true };
  const czechN2Words: N2WordsOptions = { lang: 'cs', feminine: false };

  assert.ok(chineseOptions);
  assert.ok(chineseN2Words);
  assert.ok(spanishOptions);
  assert.ok(spanishN2Words);
  assert.ok(hebrewOptions);
  assert.ok(hebrewN2Words);
  assert.ok(dutchOptions);
  assert.ok(dutchN2Words);
  assert.ok(arabicOptions);
  assert.ok(arabicN2Words);
  assert.ok(slavicOptions);
  assert.ok(russianN2Words);
  assert.ok(czechN2Words);
});

test('function signature type constraints', () => {
  // Test that function enforces correct return type
  const result1: string = n2words(42);
  const result2: string = n2words('123.45');
  const result3: string = n2words(999n);

  // Test with options
  const result4: string = n2words(42, { lang: 'fr' });
  const result5: string = n2words(100, { lang: 'zh-Hans', formal: true });

  // These should all be strings
  assert.strictEqual(typeof result1, 'string');
  assert.strictEqual(typeof result2, 'string');
  assert.strictEqual(typeof result3, 'string');
  assert.strictEqual(typeof result4, 'string');
  assert.strictEqual(typeof result5, 'string');
});

test('main module import with default language', () => {
  const result: string = n2words(42);
  assert.strictEqual(typeof result, 'string');
  assert.ok(result.length > 0);
});

test('main module with language option', () => {
  const options: N2WordsOptions = { lang: 'en' };
  const result: string = n2words(100, options);
  assert.strictEqual(typeof result, 'string');
  assert.ok(result.length > 0);
});

test('direct language imports with type safety', async () => {
  // Test that direct imports return properly typed functions with proper option types from individual language declarations
  const { default: en } = await import('n2words/languages/en');
  const { default: es } = await import('n2words/languages/es');
  const { default: fr } = await import('n2words/languages/fr');
  const { default: zhHans } = await import('n2words/languages/zh-Hans');
  const { default: he } = await import('n2words/languages/he');

  // Test basic usage - should return strings
  const result1: string = en(123);
  const result2: string = es(456);
  const result3: string = fr(789);

  // Test with language-specific options using types from individual language declarations
  const chineseOptions: ChineseOptions = { formal: true };
  const result4: string = zhHans(100, chineseOptions);

  const hebrewOptions: HebrewOptions = { feminine: true, biblical: false };
  const result5: string = he(50, hebrewOptions);

  // Test different input types
  const result6: string = en(1000n); // BigInt
  const result7: string = fr('42.5'); // String with decimal

  const results = [
    result1,
    result2,
    result3,
    result4,
    result5,
    result6,
    result7,
  ];

  for (const result of results) {
    assert.strictEqual(typeof result, 'string');
    assert.ok(result.length > 0);
  }
});

test('input type variations with strict typing', () => {
  // Test all supported input types
  const numberInput: string = n2words(42);
  const bigintInput: string = n2words(1000000n);
  const stringInput: string = n2words('42');
  const decimalInput: string = n2words('3.14159');
  const negativeInput: string = n2words(-42, { lang: 'en' });

  // Test edge cases
  const zeroInput: string = n2words(0);
  const largeNumber: string = n2words('999999999999999999999');

  // Verify all return strings
  const results = [
    numberInput,
    bigintInput,
    stringInput,
    decimalInput,
    negativeInput,
    zeroInput,
    largeNumber,
  ];

  for (const result of results) {
    assert.strictEqual(typeof result, 'string');
    assert.ok(result.length > 0);
  }
});

test('comprehensive language import validation', async () => {
  // Dynamically discover all language files
  const languagesDir = join(process.cwd(), 'lib', 'languages');
  const languageFiles = readdirSync(languagesDir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => file.replace('.js', ''))
    .sort();

  // Test all language imports with various input types and proper typing
  const testCases = [
    { value: 42, desc: 'simple number' },
    { value: 1000n, desc: 'bigint' },
    { value: '123.45', desc: 'decimal string' },
    { value: 0, desc: 'zero' },
  ];

  const allLanguageTests: Array<{
    lang: string;
    results: Array<{ case: string; result: string }>;
  }> = [];

  for (const langCode of languageFiles) {
    try {
      const { default: langFn } = await import(`n2words/languages/${langCode}`);

      // Verify function signature - should accept (number|string|bigint, options?) and return string
      // The function should have proper TypeScript typing from automated declarations
      const results: Array<{ case: string; result: string }> = [];

      for (const testCase of testCases) {
        const result: string = langFn(testCase.value);
        results.push({ case: testCase.desc, result });
      }

      allLanguageTests.push({ lang: langCode, results });
    } catch (error) {
      assert.fail(`Failed to import language ${langCode}: ${error}`);
    }
  }

  // Verify all language imports work and return proper types
  for (const langTest of allLanguageTests) {
    for (const resultTest of langTest.results) {
      assert.strictEqual(
        typeof resultTest.result,
        'string',
        `${langTest.lang} with ${resultTest.case} should return string`,
      );
      assert.ok(
        resultTest.result.length > 0,
        `${langTest.lang} with ${resultTest.case} should return non-empty string`,
      );
    }
  }

  // Ensure we tested all discovered languages
  assert.strictEqual(
    allLanguageTests.length,
    languageFiles.length,
    'All discovered languages should be successfully tested',
  );

  // Verify minimum number of languages (should be 45 based on docs)
  assert.ok(
    allLanguageTests.length >= 45,
    `Should have at least 45 languages, found ${allLanguageTests.length}`,
  );
});

test('type regression detection', () => {
  // These tests would fail compilation if types regressed

  // Test that LanguageCode constrains lang values
  const validLanguages: LanguageCode[] = [
    'en',
    'fr',
    'zh-Hans',
    'ar',
    'he',
    'es',
  ];
  for (const lang of validLanguages) {
    const result: string = n2words(100, { lang });
    assert.strictEqual(typeof result, 'string');
  }

  // Test that language-specific options are properly typed
  const chineseResult: string = n2words(100, { lang: 'zh-Hans', formal: true });
  const spanishResult: string = n2words(100, { lang: 'es', genderStem: 'a' });
  const hebrewResult: string = n2words(100, {
    lang: 'he',
    feminine: true,
    biblical: false,
  });

  assert.strictEqual(typeof chineseResult, 'string');
  assert.strictEqual(typeof spanishResult, 'string');
  assert.strictEqual(typeof hebrewResult, 'string');

  // Test that return type is always string regardless of input type
  const results: string[] = [
    n2words(42),
    n2words('42'),
    n2words(42n),
    n2words(-42),
    n2words('123.456'),
  ];

  for (const result of results) {
    assert.strictEqual(typeof result, 'string');
    assert.ok(result.length > 0);
  }
});

test('generated typings exist and are current', () => {
  const typingsDir = join(process.cwd(), 'typings');
  const libDir = join(process.cwd(), 'lib');

  // Verify main typing file exists
  const mainTypingFile = join(typingsDir, 'n2words.d.ts');
  assert.ok(statSync(mainTypingFile).isFile(), 'Main typing file should exist');

  // Verify individual language typing files exist
  const languagesTypingsDir = join(typingsDir, 'languages');
  assert.ok(
    statSync(languagesTypingsDir).isDirectory(),
    'Languages typings directory should exist',
  );

  // Check specific language declaration files
  const keyLanguages = ['en', 'zh-Hans', 'es', 'he', 'fr', 'ar'];
  for (const lang of keyLanguages) {
    const langTypingFile = join(languagesTypingsDir, `${lang}.d.ts`);
    assert.ok(
      statSync(langTypingFile).isFile(),
      `Language typing file for ${lang} should exist`,
    );

    // Verify the content contains expected exports
    const langTypingContent = readFileSync(langTypingFile, 'utf-8');
    assert.ok(
      langTypingContent.includes('export default function') ||
        langTypingContent.includes('declare function'),
      `Language ${lang} typing should export default function`,
    );
  }

  // Verify timing relationships
  const mainSourceFile = join(libDir, 'n2words.js');
  const typingMtime = statSync(mainTypingFile).mtime;
  const sourceMtime = statSync(mainSourceFile).mtime;

  // Allow for some time difference in case of build processes
  const timeDifference = Math.abs(
    typingMtime.getTime() - sourceMtime.getTime(),
  );
  assert.ok(
    timeDifference < 60000 || typingMtime >= sourceMtime,
    'Typing file should be newer than or close to source file modification time',
  );

  // Verify typing content contains expected generated structure
  const typingContent = readFileSync(mainTypingFile, 'utf-8');

  // Check for expected generated content
  assert.ok(
    typingContent.includes('export default function'),
    'Should export default function',
  );
  assert.ok(
    typingContent.includes('export type LanguageCode'),
    'Should export LanguageCode type',
  );
  assert.ok(
    typingContent.includes('export type N2WordsOptions'),
    'Should export N2WordsOptions type',
  );
});

test('typing generation setup is correct', () => {
  // Verify the build infrastructure exists to regenerate typings
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
  );

  assert.ok(
    packageJson.scripts && packageJson.scripts['types:generate'] !== undefined,
    'types:generate script should exist in package.json',
  );

  // Verify TypeScript config exists and is configured for declaration generation
  const tsconfigPath = join(process.cwd(), 'tsconfig.json');
  assert.ok(
    statSync(tsconfigPath).isFile(),
    'tsconfig.json should exist for typing generation',
  );

  const tsconfigContent = readFileSync(tsconfigPath, 'utf-8');

  // Check for key configuration options (handling JSON with comments)
  assert.ok(
    tsconfigContent.includes('"declaration": true'),
    'TypeScript should be configured to generate declarations',
  );
  assert.ok(
    tsconfigContent.includes('"emitDeclarationOnly": true'),
    'TypeScript should be configured for declaration-only output',
  );
});

test('typings match actual language implementations', () => {
  // Verify LanguageCode type reflects all actual language files
  const languagesDir = join(process.cwd(), 'lib', 'languages');
  const actualLanguageFiles = readdirSync(languagesDir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => file.replace('.js', ''))
    .sort();

  // Read generated typings to check LanguageCode
  const typingContent = readFileSync(
    join(process.cwd(), 'typings', 'n2words.d.ts'),
    'utf-8',
  );

  // Extract LanguageCode type (simplified check)
  const languageCodeMatch = typingContent.match(
    /export type LanguageCode = ([^;]+);/,
  );
  assert.ok(
    languageCodeMatch,
    'LanguageCode type should be found in generated typings',
  );

  const languageCodeType = languageCodeMatch![1];

  // Verify key languages are included (proves generation worked)
  for (const langCode of ['en', 'zh-Hans', 'fr', 'es', 'ar', 'fr-BE']) {
    assert.ok(
      languageCodeType.includes(`"${langCode}"`),
      `LanguageCode should include "${langCode}" from actual files`,
    );
  }

  // Verify count is reasonable (should have 45+ languages)
  const typeLanguageCount = (languageCodeType.match(/"/g) || []).length / 2;
  assert.ok(
    typeLanguageCount >= 45,
    `LanguageCode should have 45+ languages, found ${typeLanguageCount}`,
  );
});

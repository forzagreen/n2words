import test from 'ava'
import { readdirSync } from 'node:fs'

/**
 * Comprehensive Language-Specific Tests
 *
 * Each language module defines an array of [input, expectedOutput, options] tuples.
 * These tests verify that each language correctly handles a comprehensive set of
 * test cases specific to that language's number formatting rules.
 *
 * Test files are located in test/fixtures/languages/*.js and are loaded dynamically.
 * Language classes are imported directly from lib/languages/*.js using the BCP 47 code.
 * Files are named with IETF BCP 47 language codes (e.g., 'en.js', 'ar.js', 'fr-BE.js')
 * following international standards for language identification.
 */

const files = readdirSync('./test/fixtures/languages')

for (const file of files) {
  if (!file.endsWith('.js')) continue
  const languageCode = file.replace('.js', '')
  // Register the test at the top level synchronously
  test(languageCode, async t => {
    const languageModule = await import(`../../lib/languages/${languageCode}.js`)
    const LanguageClass = Object.values(languageModule)[0]
    if (!LanguageClass) {
      t.fail(`Language class not found for language code: ${languageCode}`)
      return
    }
    const { default: testFile } = await import('../fixtures/languages/' + file)
    for (const testCase of testFile) {
      const [input, expected, options = {}] = testCase
      const converter = new LanguageClass(options)
      t.is(converter.convertToWords(input), expected)
    }
  })
}

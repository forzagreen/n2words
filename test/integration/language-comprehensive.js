import test from 'ava'
import * as n2words from '../../lib/n2words.js'
import { readdirSync } from 'node:fs'

/**
 * Comprehensive Language-Specific Tests
 *
 * Each language module defines an array of [input, expectedOutput, options] tuples.
 * These tests verify that each language correctly handles a comprehensive set of
 * test cases specific to that language's number formatting rules.
 *
 * Test files are located in test/fixtures/languages/*.js and are loaded dynamically.
 * This test dynamically imports all exported language converters from n2words.js.
 * Files are now named with IETF BCP 47 language codes (e.g., 'en.js', 'ar.js', 'fr-BE.js')
 * following international standards for language identification.
 */

/**
 * Converts kebab-case file name to PascalCase export name
 * @param {string} fileName - The kebab-case file name (e.g., 'belgian-french')
 * @returns {string} - The PascalCase export name (e.g., 'BelgianFrench')
 */
function fileNameToExportName (fileName) {
  return fileName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

const files = readdirSync('./test/fixtures/languages')

for (const file of files) {
  if (file.includes('.js')) {
    await testLanguage(file)
  }
}

/**
 * Run language tests for specific language
 * @param {string} file language test file to run
 */
async function testLanguage (file) {
  const languageFileName = file.replace('.js', '')
  const exportName = fileNameToExportName(languageFileName)

  const languageConverter = n2words[exportName]

  if (!languageConverter) {
    throw new Error(`Language converter '${exportName}' not found in n2words exports for file: ${languageFileName}`)
  }

  test(languageFileName, async t => {
    const { default: testFile } = await import('../fixtures/languages/' + file)

    for (const testCase of testFile) {
      const [input, expected, options = {}] = testCase
      t.is(
        languageConverter(input, options),
        expected
      )
    }
  })
}

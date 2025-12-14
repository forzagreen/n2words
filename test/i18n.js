import test from 'ava'
import n2words from '../lib/n2words.js'
import { readdirSync } from 'node:fs'

/**
 * Comprehensive Language-Specific Tests
 *
 * Each language module defines an array of [input, expectedOutput, options] tuples.
 * These tests verify that each language correctly handles a comprehensive set of
 * test cases specific to that language's number formatting rules.
 *
 * Test files are located in test/i18n/*.js and are loaded dynamically.
 */

const files = readdirSync('./test/i18n')

for (const file of files) {
  if (file.includes('.js')) {
    await testLanguage(file)
  }
}

/**
 * Run i18n tests for specific language
 * @param {string} file language test file to run
 */
async function testLanguage (file) {
  const language = file.replace('.js', '')

  test(language, async t => {
    const { default: testFile } = await import('./i18n/' + file)

    for (const test of testFile) {
      t.is(
        n2words(test[0], Object.assign({ lang: language }, test[2])),
        test[1]
      )
    }
  })
}

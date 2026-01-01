import test from 'ava'
import { readdirSync } from 'node:fs'
import * as n2words from '../../lib/n2words.js'

/**
 * Comprehensive Language-Specific Tests
 *
 * Each language module defines an array of [input, expectedOutput, options] tuples.
 * These tests verify that each language correctly handles a comprehensive set of
 * test cases specific to that language's number formatting rules.
 *
 * Test files are located in test/fixtures/languages/*.js and are loaded dynamically.
 * Converters are imported from lib/n2words.js (the public API).
 * Files are named with IETF BCP 47 language codes (e.g., 'en.js', 'ar.js', 'fr-BE.js')
 * following international standards for language identification.
 */

/**
 * Map of BCP 47 codes to converter names for lookup
 */
const codeToConverterName = {
  ar: 'Arabic',
  az: 'Azerbaijani',
  bn: 'Bangla',
  cs: 'Czech',
  da: 'Danish',
  de: 'German',
  el: 'Greek',
  en: 'English',
  es: 'Spanish',
  fa: 'Persian',
  fil: 'Filipino',
  fr: 'French',
  'fr-BE': 'FrenchBelgium',
  gu: 'Gujarati',
  hbo: 'BiblicalHebrew',
  he: 'Hebrew',
  hi: 'Hindi',
  hr: 'Croatian',
  hu: 'Hungarian',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  kn: 'Kannada',
  ko: 'Korean',
  lt: 'Lithuanian',
  lv: 'Latvian',
  mr: 'Marathi',
  ms: 'Malay',
  nb: 'NorwegianBokmal',
  nl: 'Dutch',
  pa: 'Punjabi',
  pl: 'Polish',
  pt: 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  'sr-Cyrl': 'SerbianCyrillic',
  'sr-Latn': 'SerbianLatin',
  sv: 'Swedish',
  sw: 'Swahili',
  ta: 'Tamil',
  te: 'Telugu',
  th: 'Thai',
  tr: 'Turkish',
  uk: 'Ukrainian',
  ur: 'Urdu',
  vi: 'Vietnamese',
  'zh-Hans': 'SimplifiedChinese',
  'zh-Hant': 'TraditionalChinese'
}

/**
 * Safely stringify a value for error messages (handles BigInt)
 * @param {*} value - Value to stringify
 * @returns {string} String representation
 */
function safeStringify (value) {
  if (typeof value === 'bigint') {
    return value.toString() + 'n'
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, (_key, val) =>
      typeof val === 'bigint' ? val.toString() + 'n' : val
    )
  }
  return JSON.stringify(value)
}

/**
 * Validates a test fixture file format
 * @param {Array} testFile - The imported fixture file
 * @param {string} languageCode - Language code for error messages
 * @returns {{valid: boolean, error?: string}} Validation result
 */
function validateFixture (testFile, languageCode) {
  if (!Array.isArray(testFile)) {
    return {
      valid: false,
      error: `Invalid fixture format for ${languageCode}: expected array, got ${typeof testFile}`
    }
  }

  if (testFile.length === 0) {
    return {
      valid: false,
      error: `Empty fixture file for ${languageCode}: must contain at least one test case`
    }
  }

  // Validate each test case
  for (let i = 0; i < testFile.length; i++) {
    const testCase = testFile[i]

    if (!Array.isArray(testCase)) {
      return {
        valid: false,
        error: `Invalid test case at index ${i} in ${languageCode}: expected array [input, expected, options?], got ${typeof testCase}`
      }
    }

    if (testCase.length < 2 || testCase.length > 3) {
      return {
        valid: false,
        error: `Invalid test case at index ${i} in ${languageCode}: expected 2-3 elements [input, expected, options?], got ${testCase.length}`
      }
    }

    const [input, expected, options] = testCase

    // Validate input type
    const inputType = typeof input
    if (inputType !== 'number' && inputType !== 'string' && inputType !== 'bigint') {
      return {
        valid: false,
        error: `Invalid input at index ${i} in ${languageCode}: expected number|string|bigint, got ${inputType}`
      }
    }

    // Validate expected output
    if (typeof expected !== 'string') {
      return {
        valid: false,
        error: `Invalid expected output at index ${i} in ${languageCode}: expected string, got ${typeof expected}`
      }
    }

    // Validate options if present
    if (options !== undefined && (typeof options !== 'object' || options === null || Array.isArray(options))) {
      return {
        valid: false,
        error: `Invalid options at index ${i} in ${languageCode}: expected object or undefined, got ${typeof options}`
      }
    }
  }

  return { valid: true }
}

const files = readdirSync('./test/fixtures/languages')

for (const file of files) {
  if (!file.endsWith('.js')) continue
  const languageCode = file.replace('.js', '')

  test(languageCode, async t => {
    // Get converter from public API
    const className = codeToConverterName[languageCode]
    if (!className) {
      t.fail(`No converter mapping found for language code: ${languageCode}`)
      return
    }

    const converterName = `${className}Converter`
    const converter = n2words[converterName]

    if (!converter) {
      t.fail(`Converter not found: ${converterName}`)
      return
    }

    // Import and validate fixture
    const { default: testFile } = await import('../fixtures/languages/' + file)
    const validation = validateFixture(testFile, languageCode)

    if (!validation.valid) {
      t.fail(validation.error)
      return
    }

    // Run test cases with enhanced error reporting
    for (let i = 0; i < testFile.length; i++) {
      const testCase = testFile[i]
      const [input, expected, options] = testCase

      try {
        const actual = converter(input, options)

        // Provide detailed context on failure
        t.is(actual, expected,
          `Test case ${i + 1}/${testFile.length}: ${safeStringify(input)}${
            options ? ` with options ${safeStringify(options)}` : ''
          }`
        )
      } catch (error) {
        t.fail(
          `Test case ${i + 1}/${testFile.length} threw error: ${error.message}\n` +
          `Input: ${safeStringify(input)}\n` +
          `Options: ${safeStringify(options)}\n` +
          `Expected: ${expected}`
        )
      }
    }

    // Validate minimum test coverage (at least 10 test cases per language)
    if (testFile.length < 10) {
      t.log(`Warning: ${languageCode} has only ${testFile.length} test cases. Consider adding more comprehensive coverage.`)
    }
  })
}

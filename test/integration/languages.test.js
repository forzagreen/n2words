import test from 'ava'
import { readdirSync } from 'node:fs'
import { isPlainObject } from '../../lib/utils/is-plain-object.js'
import { parseNumericValue } from '../../lib/utils/parse-numeric.js'
import { isValidLanguageCode } from '../utils/language-naming.js'
import { safeStringify } from '../utils/stringify.js'

/**
 * Checks if a value is valid input for parseNumericValue.
 */
function isValidNumericInput (value) {
  try {
    parseNumericValue(value)
    return true
  } catch {
    return false
  }
}

/**
 * Language Implementation Tests
 *
 * Tests each language converter directly by calling toWords() with test fixtures.
 * Validates language implementations conform to project standards.
 *
 * Validates:
 * - Fixture test cases (input → expected output)
 * - BCP 47 file naming convention
 * - toWords function export exists
 * - Basic sanity checks (handles zero, returns strings)
 *
 * Note: Module structure validation (imports, exports) is in api.test.js.
 */

// ============================================================================
// Fixture Validation
// ============================================================================

/**
 * Validates a test fixture file format.
 *
 * Fixtures must be arrays of test cases where each test case is:
 * - [input, expected] or [input, expected, options]
 * - input: valid numeric value (number, string, or bigint)
 * - expected: string (the expected word output)
 * - options: plain object (optional)
 *
 * @param {Array} testFile The imported fixture file (default export)
 * @param {string} languageCode Language code for error messages
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

    if (!isValidNumericInput(input)) {
      return {
        valid: false,
        error: `Invalid input at index ${i} in ${languageCode}: expected valid numeric value (number|string|bigint), got ${typeof input}`
      }
    }

    if (typeof expected !== 'string') {
      return {
        valid: false,
        error: `Invalid expected output at index ${i} in ${languageCode}: expected string, got ${typeof expected}`
      }
    }

    if (options !== undefined && !isPlainObject(options)) {
      return {
        valid: false,
        error: `Invalid options at index ${i} in ${languageCode}: expected plain object or undefined, got ${typeof options}`
      }
    }
  }

  return { valid: true }
}

// ============================================================================
// Language Tests
// ============================================================================

const files = readdirSync('./test/fixtures/languages')

for (const file of files) {
  if (!file.endsWith('.js')) continue
  const languageCode = file.replace('.js', '')

  test(languageCode, async t => {
    // Import language module
    const languageModule = await import('../../lib/languages/' + file)

    // Verify toWords export exists
    if (typeof languageModule.toWords !== 'function') {
      t.fail(`Language file ${file} does not export a toWords function`)
      return
    }

    const toWords = languageModule.toWords

    // Import and validate fixture
    const { default: testFile } = await import('../fixtures/languages/' + file)
    const validation = validateFixture(testFile, languageCode)

    if (!validation.valid) {
      t.fail(validation.error)
      return
    }

    // Run test cases by calling toWords directly
    for (let i = 0; i < testFile.length; i++) {
      const testCase = testFile[i]
      const [input, expected, options] = testCase

      try {
        // Call toWords directly (it handles parsing internally)
        const actual = options ? toWords(input, options) : toWords(input)

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

    // ========================================================================
    // Structural Validation
    // ========================================================================

    // Valid BCP 47 language code
    t.true(
      isValidLanguageCode(languageCode),
      `${languageCode} should be a valid BCP 47 tag`
    )

    // Basic sanity checks
    const zeroResult = toWords(0)
    t.is(typeof zeroResult, 'string', 'toWords(0) should return a string')
    t.true(zeroResult.length > 0, 'toWords(0) should return a non-empty string')
  })
}

test('all language files have test fixtures', t => {
  const languageFiles = readdirSync('./lib/languages').filter(f => f.endsWith('.js'))
  const fixtureFiles = readdirSync('./test/fixtures/languages').filter(f => f.endsWith('.js'))

  const missingFixtures = languageFiles.filter(f => !fixtureFiles.includes(f))
  t.deepEqual(missingFixtures, [], `Missing test fixtures for: ${missingFixtures.join(', ')}`)
})

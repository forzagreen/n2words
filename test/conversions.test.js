import test from 'ava'
import { readdirSync, readFileSync } from 'node:fs'
import { isPlainObject } from '../src/utils/is-plain-object.js'
import { isValidLanguageCode } from './helpers/language-naming.js'
import { isValidNumericInput, safeStringify } from './helpers/value-utils.js'

/**
 * Number Conversion Tests
 *
 * Tests all conversion forms (cardinal, ordinal) for each language.
 * Uses fixture files with named exports for each form.
 *
 * Fixture format (test/fixtures/{code}.js):
 *   export const cardinal = [[input, expected, options?], ...]
 *   export const ordinal = [[input, expected], ...]
 *
 * Validates:
 * - Fixture test cases (input → expected output)
 * - BCP 47 file naming convention
 * - Function exports exist
 * - Basic sanity checks
 * - JSDoc annotations for TypeScript declaration generation
 */

// ============================================================================
// Fixture Validation
// ============================================================================

/**
 * Validates a test fixture array format.
 *
 * @param {Array} testCases Array of test cases
 * @param {string} languageCode Language code for error messages
 * @param {string} form Form name (cardinal, ordinal)
 * @param {boolean} allowOptions Whether options are allowed
 * @returns {{valid: boolean, error?: string}} Validation result
 */
function validateFixture (testCases, languageCode, form, allowOptions = true) {
  if (!Array.isArray(testCases)) {
    return {
      valid: false,
      error: `Invalid ${form} fixture for ${languageCode}: expected array, got ${typeof testCases}`
    }
  }

  if (testCases.length === 0) {
    return {
      valid: false,
      error: `Empty ${form} fixture for ${languageCode}: must contain at least one test case`
    }
  }

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]

    if (!Array.isArray(testCase)) {
      return {
        valid: false,
        error: `Invalid test case at index ${i} in ${languageCode} ${form}: expected array, got ${typeof testCase}`
      }
    }

    const minElements = 2
    const maxElements = allowOptions ? 3 : 2

    if (testCase.length < minElements || testCase.length > maxElements) {
      return {
        valid: false,
        error: `Invalid test case at index ${i} in ${languageCode} ${form}: expected ${minElements}-${maxElements} elements, got ${testCase.length}`
      }
    }

    const [input, expected, options] = testCase

    if (!isValidNumericInput(input)) {
      return {
        valid: false,
        error: `Invalid input at index ${i} in ${languageCode} ${form}: expected valid numeric value, got ${typeof input}`
      }
    }

    if (typeof expected !== 'string') {
      return {
        valid: false,
        error: `Invalid expected output at index ${i} in ${languageCode} ${form}: expected string, got ${typeof expected}`
      }
    }

    if (options !== undefined && !isPlainObject(options)) {
      return {
        valid: false,
        error: `Invalid options at index ${i} in ${languageCode} ${form}: expected plain object, got ${typeof options}`
      }
    }
  }

  return { valid: true }
}

// ============================================================================
// Test Runner
// ============================================================================

/**
 * Run test cases for a conversion function.
 *
 * @param {Object} t Ava test context
 * @param {Function} fn Conversion function
 * @param {Array} testCases Test cases
 * @param {string} form Form name for error messages
 */
function runTestCases (t, fn, testCases, form) {
  for (let i = 0; i < testCases.length; i++) {
    const [input, expected, options] = testCases[i]

    try {
      const actual = options ? fn(input, options) : fn(input)

      t.is(actual, expected,
        `${form} case ${i + 1}/${testCases.length}: ${safeStringify(input)}${
          options ? ` with ${safeStringify(options)}` : ''
        }`
      )
    } catch (error) {
      t.fail(
        `${form} case ${i + 1}/${testCases.length} threw: ${error.message}\n` +
        `Input: ${safeStringify(input)}\n` +
        `Expected: ${expected}`
      )
    }
  }
}

// ============================================================================
// Language Tests
// ============================================================================

const files = readdirSync('./test/fixtures').filter(f => f.endsWith('.js'))

for (const file of files) {
  const languageCode = file.replace('.js', '')

  test(languageCode, async t => {
    // Import language module
    const languageModule = await import('../src/' + file)

    // Import fixture module
    const fixtureModule = await import('./fixtures/' + file)

    // ========================================================================
    // Cardinal Tests
    // ========================================================================

    if (fixtureModule.cardinal) {
      // Verify toCardinal export exists
      if (typeof languageModule.toCardinal !== 'function') {
        t.fail(`${file} has cardinal fixtures but does not export toCardinal`)
        return
      }

      const validation = validateFixture(fixtureModule.cardinal, languageCode, 'cardinal')
      if (!validation.valid) {
        t.fail(validation.error)
        return
      }

      runTestCases(t, languageModule.toCardinal, fixtureModule.cardinal, 'cardinal')

      // Coverage warning
      if (fixtureModule.cardinal.length < 25) {
        t.log(`Warning: ${languageCode} has only ${fixtureModule.cardinal.length} cardinal test cases.`)
      }

      // Basic sanity check
      const zeroResult = languageModule.toCardinal(0)
      t.is(typeof zeroResult, 'string', 'toCardinal(0) should return a string')
      t.true(zeroResult.length > 0, 'toCardinal(0) should return a non-empty string')
    }

    // ========================================================================
    // Ordinal Tests
    // ========================================================================

    if (fixtureModule.ordinal) {
      // Verify toOrdinal export exists
      if (typeof languageModule.toOrdinal !== 'function') {
        t.fail(`${file} has ordinal fixtures but does not export toOrdinal`)
        return
      }

      const validation = validateFixture(fixtureModule.ordinal, languageCode, 'ordinal', false)
      if (!validation.valid) {
        t.fail(validation.error)
        return
      }

      runTestCases(t, languageModule.toOrdinal, fixtureModule.ordinal, 'ordinal')

      // Test ordinal error cases
      t.throws(() => languageModule.toOrdinal(0), { instanceOf: RangeError }, 'toOrdinal(0) should throw RangeError')
      t.throws(() => languageModule.toOrdinal(-1), { instanceOf: RangeError }, 'toOrdinal(-1) should throw RangeError')
      t.throws(() => languageModule.toOrdinal(1.5), { instanceOf: RangeError }, 'toOrdinal(1.5) should throw RangeError')
    }

    // ========================================================================
    // Structural Validation
    // ========================================================================

    // Valid BCP 47 language code
    t.true(
      isValidLanguageCode(languageCode),
      `${languageCode} should be a valid BCP 47 tag`
    )

    // JSDoc validation - check toCardinal has proper type annotations
    const fileContent = readFileSync(`./src/${file}`, 'utf8')

    // Check for @param with value type
    t.regex(
      fileContent,
      /@param\s+\{number\s*\|\s*string\s*\|\s*bigint\}\s+value/,
      'toCardinal should have @param {number | string | bigint} value JSDoc'
    )

    // Check for @returns with string type
    t.regex(
      fileContent,
      /@returns\s+\{string\}/,
      'Should have @returns {string} JSDoc'
    )
  })
}

test('all language files have test fixtures', t => {
  const languageFiles = readdirSync('./src').filter(f => f.endsWith('.js'))
  const fixtureFiles = readdirSync('./test/fixtures').filter(f => f.endsWith('.js'))

  const missingFixtures = languageFiles.filter(f => !fixtureFiles.includes(f))
  t.deepEqual(missingFixtures, [], `Missing test fixtures for: ${missingFixtures.join(', ')}`)
})

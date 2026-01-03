import test from 'ava'
import { readdirSync } from 'node:fs'
import { isPlainObject } from '../../lib/utils/is-plain-object.js'
import { isValidNumericValue, parseNumericValue } from '../../lib/utils/parse-numeric.js'

/**
 * Language Implementation Tests
 *
 * Tests each language class directly by calling toWords() with pre-parsed input.
 * Validates language implementations conform to project standards.
 *
 * Validates:
 * - Fixture test cases (input → expected output)
 * - BCP 47 file naming convention
 * - Required properties (negativeWord, zeroWord, decimalSeparatorWord)
 * - Valid base class inheritance
 * - Scale words ordering (where applicable)
 * - Basic sanity checks (handles zero, returns strings)
 *
 * Note: Module structure validation (imports, exports, typedefs) is in api.test.js.
 *
 * Test fixtures: test/fixtures/languages/*.js
 * Language files: lib/languages/*.js
 */

// ============================================================================
// Constants
// ============================================================================

const VALID_BASE_CLASSES = [
  'AbstractLanguage',
  'GreedyScaleLanguage',
  'HebrewLanguage',
  'SlavicLanguage',
  'SouthAsianLanguage',
  'TurkicLanguage'
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extracts the class name from a language module's exports.
 * Language files export a single named class (e.g., `export class English`).
 *
 * @param {Object} languageModule The imported language module
 * @returns {string|null} The class name, or null if not found
 */
function getClassNameFromModule (languageModule) {
  const exportNames = Object.keys(languageModule)
  // Language files export exactly one class
  return exportNames.length === 1 ? exportNames[0] : null
}

/**
 * Get the effective base class name (handles regional variants).
 * @param {Function} LanguageClass Language class constructor
 * @returns {string|null} Base class name
 */
function getBaseClassName (LanguageClass) {
  const proto = Object.getPrototypeOf(LanguageClass)
  const baseClassName = proto?.name

  if (VALID_BASE_CLASSES.includes(baseClassName)) {
    return baseClassName
  }

  // Check grandparent for regional variants (e.g., FrenchBelgium → French → GreedyScaleLanguage)
  const grandProto = Object.getPrototypeOf(proto)
  const grandParentClassName = grandProto?.name
  if (VALID_BASE_CLASSES.includes(grandParentClassName)) {
    return grandParentClassName
  }

  return baseClassName
}

/**
 * Safely stringify a value for error messages (handles BigInt)
 * @param {*} value Value to stringify
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
 * @param {Array} testFile The imported fixture file
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

    // Validate input (must be valid numeric value, same as runtime API)
    if (!isValidNumericValue(input)) {
      return {
        valid: false,
        error: `Invalid input at index ${i} in ${languageCode}: expected valid numeric value (number|string|bigint), got ${typeof input}`
      }
    }

    // Validate expected output
    if (typeof expected !== 'string') {
      return {
        valid: false,
        error: `Invalid expected output at index ${i} in ${languageCode}: expected string, got ${typeof expected}`
      }
    }

    // Validate options if present (must be plain object, same as runtime API)
    if (options !== undefined && !isPlainObject(options)) {
      return {
        valid: false,
        error: `Invalid options at index ${i} in ${languageCode}: expected plain object or undefined, got ${typeof options}`
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
    // Import language module and extract class name from its exports
    const languageModule = await import('../../lib/languages/' + file)
    const className = getClassNameFromModule(languageModule)
    if (!className) {
      t.fail(`Could not extract class name from language file: ${file}`)
      return
    }

    // Get language class for direct testing
    const LanguageClass = languageModule[className]

    // Import and validate fixture
    const { default: testFile } = await import('../fixtures/languages/' + file)
    const validation = validateFixture(testFile, languageCode)

    if (!validation.valid) {
      t.fail(validation.error)
      return
    }

    // Run test cases by calling class directly with pre-parsed input
    for (let i = 0; i < testFile.length; i++) {
      const testCase = testFile[i]
      const [input, expected, options] = testCase

      try {
        // Parse input to normalized form (same as API boundary does)
        const { isNegative, integerPart, decimalPart } = parseNumericValue(input)

        // Create instance and call toWords() directly
        const instance = new LanguageClass(options)
        const actual = instance.toWords(isNegative, integerPart, decimalPart)

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

    const instance = new LanguageClass()

    // Valid BCP 47 language code
    try {
      const canonical = Intl.getCanonicalLocales(languageCode)
      t.true(canonical.length > 0, `${languageCode} should be a valid BCP 47 tag`)
    } catch (error) {
      t.fail(`Invalid BCP 47 language tag: ${languageCode} (${error.message})`)
    }

    // Extends valid base class
    const baseClass = getBaseClassName(LanguageClass)
    t.true(
      VALID_BASE_CLASSES.includes(baseClass),
      `${className} should extend a valid base class, got: ${baseClass}`
    )

    // Has required properties
    t.is(typeof instance.negativeWord, 'string', 'negativeWord should be a string')
    t.is(typeof instance.zeroWord, 'string', 'zeroWord should be a string')
    t.is(typeof instance.decimalSeparatorWord, 'string', 'decimalSeparatorWord should be a string')

    // integerToWords works and handles zero
    t.is(typeof instance.integerToWords, 'function', 'integerToWords should be a function')
    const zeroResult = instance.integerToWords(0n)
    t.is(typeof zeroResult, 'string', 'integerToWords(0n) should return a string')
    t.true(zeroResult.length > 0, 'integerToWords(0n) should return a non-empty string')

    // Scale words ordering (GreedyScaleLanguage/TurkicLanguage only)
    if ((baseClass === 'GreedyScaleLanguage' || baseClass === 'TurkicLanguage') &&
        'scaleWords' in instance && Array.isArray(instance.scaleWords)) {
      let previousValue = Infinity
      let orderError = null
      for (let i = 0; i < instance.scaleWords.length; i++) {
        const [value] = instance.scaleWords[i]
        if (typeof value === 'bigint' && Number(value) >= previousValue) {
          orderError = `scaleWords not in descending order at index ${i}`
          break
        }
        previousValue = Number(value)
      }
      t.is(orderError, null, orderError || 'scaleWords should be in descending order')
    }
  })
}

test('all language files have test fixtures', t => {
  const languageFiles = readdirSync('./lib/languages').filter(f => f.endsWith('.js'))
  const fixtureFiles = readdirSync('./test/fixtures/languages').filter(f => f.endsWith('.js'))

  const missingFixtures = languageFiles.filter(f => !fixtureFiles.includes(f))
  t.deepEqual(missingFixtures, [], `Missing test fixtures for: ${missingFixtures.join(', ')}`)
})

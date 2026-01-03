import test from 'ava'
import { readdirSync } from 'node:fs'
import { validateLanguageCode } from '../utils/language-naming.js'
import { parseNumericValue } from '../../lib/utils/parse-numeric.js'
import { getBaseClassName, getClassNameFromModule, VALID_BASE_CLASSES } from '../utils/language-helpers.js'
import { safeStringify } from '../utils/stringify.js'
import { validateFixture } from '../utils/validate-fixture.js'

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
 */

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
    const bcp47 = validateLanguageCode(languageCode)
    if (!bcp47.valid) {
      t.fail(bcp47.error)
    } else {
      t.pass(`${languageCode} is a valid BCP 47 tag`)
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

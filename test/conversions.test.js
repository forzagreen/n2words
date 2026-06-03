import test from 'ava'
import { readdirSync } from 'node:fs'
import { isPlainObject } from '../src/utils/is-plain-object.js'
import { getCanonicalCode, isValidLanguageCode } from './helpers/language-naming.js'
import { isValidCardinalInput, isValidOrdinalInput, safeStringify } from './helpers/value-utils.js'

/**
 * Number Conversion Tests
 *
 * Tests all conversion forms (cardinal, ordinal, etc.) for each language.
 * Uses fixture files with named exports for each form.
 *
 * Fixture format (test/fixtures/{code}.js):
 *   export const cardinal = [[input, expected, options?], ...]
 *   export const ordinal = [[input, expected, options?], ...]
 *   export const cardinalErrors = [[input, ErrorClass], ...]  // optional: inputs that must throw
 *
 * Validates:
 * - BCP 47 file naming convention
 * - Fixture ↔ export cross-validation
 * - Fixture test cases (input → expected output)
 */

// ============================================================================
// Form Configuration
// ============================================================================

/**
 * Supported conversion forms and their configurations.
 * Adding a new form only requires adding an entry here.
 */
const FORMS = {
  cardinal: {
    functionName: 'toCardinal',
    allowOptions: true,
    inputValidator: isValidCardinalInput,
    inputDescription: 'valid cardinal value',
    errorCases: null, // No standard error cases for cardinal
  },
  ordinal: {
    functionName: 'toOrdinal',
    allowOptions: true, // Allow options for future ordinal implementations
    inputValidator: isValidOrdinalInput,
    inputDescription: 'positive integer',
    errorCases: [
      { input: 0, error: RangeError, desc: 'toOrdinal(0) should throw RangeError' },
      { input: -1, error: RangeError, desc: 'toOrdinal(-1) should throw RangeError' },
      { input: 1.5, error: RangeError, desc: 'toOrdinal(1.5) should throw RangeError' },
    ],
  },
  currency: {
    functionName: 'toCurrency',
    allowOptions: true,
    inputValidator: isValidCardinalInput,
    inputDescription: 'valid currency value',
    errorCases: null,
  },
}

// ============================================================================
// Fixture Validation
// ============================================================================

/**
 * Creates a canonical key for an input value to detect duplicates.
 * Normalizes numeric types so 42, '42', and 42n are considered equivalent.
 *
 * @param {number|string|bigint} input Input value
 * @param {Object} [options] Options object
 * @returns {string} Canonical key
 */
function getInputKey(input, options) {
  // Normalize to string representation of the number
  const numStr = typeof input === 'bigint' ? input.toString() : String(input)
  // Include options in key to allow same input with different options
  const optStr = options ? JSON.stringify(options, Object.keys(options).sort()) : ''
  return `${numStr}|${optStr}`
}

/**
 * Validates a test fixture array format.
 *
 * Checks:
 * - Array structure (non-empty array of arrays)
 * - Element count (2-3 depending on allowOptions)
 * - Input is valid numeric (number, string, bigint - not NaN/Infinity)
 * - Expected is non-empty string
 * - Options is plain object with properties (if present)
 * - No duplicate input+options combinations
 * - No conflicting test cases (same input, different expected)
 *
 * @param {Array} testCases Array of test cases
 * @param {string} languageCode Language code for error messages
 * @param {string} form Form name (cardinal, ordinal)
 * @param {Object} config Form configuration
 * @param {Function} config.inputValidator Validator function for inputs
 * @param {string} config.inputDescription Description of valid input for error messages
 * @param {boolean} config.allowOptions Whether options are allowed
 * @returns {{valid: boolean, error?: string}} Validation result
 */
function validateFixture(testCases, languageCode, form, config) {
  const { inputValidator, inputDescription, allowOptions = true } = config

  if (!Array.isArray(testCases)) {
    return {
      valid: false,
      error: `Invalid ${form} fixture for ${languageCode}: expected array, got ${typeof testCases}`,
    }
  }

  if (testCases.length === 0) {
    return {
      valid: false,
      error: `Empty ${form} fixture for ${languageCode}: must contain at least one test case`,
    }
  }

  // Track seen inputs to detect duplicates and conflicts
  const seenInputs = new Map() // key -> { index, expected }

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]

    if (!Array.isArray(testCase)) {
      return {
        valid: false,
        error: `Invalid test case at index ${i} in ${languageCode} ${form}: expected array, got ${typeof testCase}`,
      }
    }

    const minElements = 2
    const maxElements = allowOptions ? 3 : 2

    if (testCase.length < minElements || testCase.length > maxElements) {
      return {
        valid: false,
        error: `Invalid test case at index ${i} in ${languageCode} ${form}: expected ${minElements}-${maxElements} elements, got ${testCase.length}`,
      }
    }

    const [input, expected, options] = testCase

    // Validate input using form-specific validator
    if (!inputValidator(input)) {
      return {
        valid: false,
        error: `Invalid input at index ${i} in ${languageCode} ${form}: expected ${inputDescription}, got ${safeStringify(input)}`,
      }
    }

    // Validate expected output
    if (typeof expected !== 'string') {
      return {
        valid: false,
        error: `Invalid expected output at index ${i} in ${languageCode} ${form}: expected string, got ${typeof expected}`,
      }
    }

    if (expected.length === 0) {
      return {
        valid: false,
        error: `Empty expected output at index ${i} in ${languageCode} ${form}: expected non-empty string`,
      }
    }

    // Validate options
    if (options !== undefined) {
      if (!isPlainObject(options)) {
        return {
          valid: false,
          error: `Invalid options at index ${i} in ${languageCode} ${form}: expected plain object, got ${typeof options}`,
        }
      }

      if (Object.keys(options).length === 0) {
        return {
          valid: false,
          error: `Empty options object at index ${i} in ${languageCode} ${form}: use undefined instead of {}`,
        }
      }
    }

    // Check for duplicates and conflicts
    const key = getInputKey(input, options)
    const existing = seenInputs.get(key)

    if (existing) {
      // A repeated input+options is invalid — whether it's an exact duplicate
      // (same expected, redundant) or a conflict (different expected). Each
      // input should appear exactly once per form.
      return {
        valid: false,
        error: existing.expected === expected
          ? `Duplicate test case at index ${i} in ${languageCode} ${form}: same as index ${existing.index}`
          : `Conflicting test cases in ${languageCode} ${form}: index ${existing.index} expects "${existing.expected}" but index ${i} expects "${expected}" for input ${safeStringify(input)}`,
      }
    }
    seenInputs.set(key, { index: i, expected })
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
function runTestCases(t, fn, testCases, form) {
  for (let i = 0; i < testCases.length; i++) {
    const [input, expected, options] = testCases[i]

    try {
      const actual = options ? fn(input, options) : fn(input)

      t.is(actual, expected,
        `${form} case ${i + 1}/${testCases.length}: ${safeStringify(input)}${
          options ? ` with ${safeStringify(options)}` : ''
        }`,
      )
    }
    catch (error) {
      t.fail(
        `${form} case ${i + 1}/${testCases.length} threw: ${error.message}\n`
        + `Input: ${safeStringify(input)}\n`
        + `Expected: ${expected}`,
      )
    }
  }
}

/**
 * Minimum fixture cases required per form — a low, deliberate floor that
 * demands more than a token value or two (a real smoke test) without pinning
 * languages to an arbitrary count. Acts as a tripwire: a new or regressed
 * fixture that drops below it fails the build.
 */
const MIN_TEST_CASES_PER_FORM = 5

/**
 * Builds the ordered list of checks (assertion thunks) for one form.
 *
 * Each returned entry is a zero-argument function. Running them in order
 * reproduces the original form-test control flow exactly, including the
 * early-skip behavior: a missing export or an invalid fixture short-circuits
 * the form (no later checks are produced).
 *
 * Returning thunks keeps the assertions out of `if` conditionals at the call
 * site (they run inside a plain loop), satisfying ava/no-conditional-assertion
 * without weakening or changing any assertion.
 *
 * @param {Object} t Ava test context
 * @param {string} file Fixture/source file name
 * @param {string} languageCode Language code under test
 * @param {string} formName Form name (cardinal, ordinal, ...)
 * @param {Object} config Form configuration
 * @param {Function|*} fn Exported conversion function (may be undefined)
 * @param {Array} fixtureData Fixture test cases for this form
 * @returns {Array<Function>} Ordered assertion thunks
 */
function planFormChecks(t, file, languageCode, formName, config, fn, fixtureData) {
  // Export validation: missing export is a single failure, then skip the form.
  if (typeof fn !== 'function') {
    return [() => t.fail(`${file} has ${formName} fixtures but does not export ${config.functionName}`)]
  }

  const checks = []

  // Fixture validation: an invalid fixture is a single failure, then skip.
  const validation = validateFixture(fixtureData, languageCode, formName, config)
  if (!validation.valid) {
    checks.push(() => t.fail(validation.error))
    return checks
  }

  // Conversion tests: one assertion per fixture case (handled in runTestCases).
  checks.push(() => runTestCases(t, fn, fixtureData, formName))

  // Coverage floor: every form must exercise more than a token value or two.
  checks.push(() => t.true(
    fixtureData.length >= MIN_TEST_CASES_PER_FORM,
    `${languageCode} ${formName} has only ${fixtureData.length} test cases (minimum ${MIN_TEST_CASES_PER_FORM})`,
  ))

  // Error cases (form-specific): one t.throws per case.
  for (const { input, error, desc } of config.errorCases ?? []) {
    checks.push(() => t.throws(() => fn(input), { instanceOf: error }, desc))
  }

  return checks
}

// ============================================================================
// Language Tests
// ============================================================================

const fixtureFiles = readdirSync('./test/fixtures').filter(f => f.endsWith('.js'))

for (const file of fixtureFiles) {
  const languageCode = file.replace('.js', '')

  test(languageCode, async (t) => {
    // Import modules
    const languageModule = await import('../src/' + file)
    const fixtureModule = await import('./fixtures/' + file)

    // ========================================================================
    // BCP 47 Validation
    // ========================================================================

    t.true(
      isValidLanguageCode(languageCode),
      `${languageCode} should be a valid BCP 47 tag`,
    )

    // ========================================================================
    // Form Tests (driven by FORMS config)
    // ========================================================================

    let hasAtLeastOneForm = false

    for (const [formName, config] of Object.entries(FORMS)) {
      const fixtureData = fixtureModule[formName]
      const fn = languageModule[config.functionName]

      // Skip if no fixture for this form
      if (!fixtureData) continue

      hasAtLeastOneForm = true

      // Plan each form's assertions as a list of thunks, then run them via a
      // loop below. Keeping the assertions inside a plain loop (rather than
      // if-blocks) avoids ava/no-conditional-assertion while preserving the
      // exact assertions and the early-skip semantics the original test had.
      const formChecks = planFormChecks(t, file, languageCode, formName, config, fn, fixtureData)
      for (const check of formChecks) {
        check()
      }
    }

    // ========================================================================
    // Out-of-range cases (e.g. scale ceilings): assert they throw
    // ========================================================================

    // A fixture may export `<form>Errors` as an array of [input, ErrorClass],
    // e.g. `export const cardinalErrors = [[10n ** 30n, RangeError]]`, for
    // inputs the form rejects (too large to spell, out of domain, …). Iterated
    // in a plain loop (not an if) so ava/no-conditional-assertion stays happy.
    for (const [formName, config] of Object.entries(FORMS)) {
      const fn = languageModule[config.functionName]
      const errorCases = fixtureModule[formName + 'Errors'] ?? []
      for (const [input, expectedError] of errorCases) {
        t.throws(
          () => fn(input),
          { instanceOf: expectedError },
          `${languageCode} ${config.functionName}(${input}) should throw ${expectedError.name}`,
        )
      }
    }

    // ========================================================================
    // Fixture ↔ Export Cross-validation
    // ========================================================================

    // Ensure at least one form is tested
    t.true(hasAtLeastOneForm, `${languageCode} fixture must export at least one form (cardinal, ordinal, etc.)`)

    // Check for exports without fixtures (potential untested code). Collect the
    // offending forms first, then assert in a loop (not an if) so the rule does
    // not flag the assertion.
    const exportsWithoutFixtures = Object.entries(FORMS).filter(([formName, config]) =>
      typeof languageModule[config.functionName] === 'function' && !fixtureModule[formName],
    )
    for (const [formName, config] of exportsWithoutFixtures) {
      t.fail(`${languageCode} exports ${config.functionName} but fixture is missing ${formName} test cases`)
    }
  })
}

// ============================================================================
// Structural Tests
// ============================================================================

test('all language files have test fixtures', (t) => {
  const languageFiles = readdirSync('./src')
    .filter(f => f.endsWith('.js') && !f.startsWith('utils'))

  const missingFixtures = languageFiles.filter(f => !fixtureFiles.includes(f))
  t.deepEqual(missingFixtures, [], `Missing test fixtures for: ${missingFixtures.join(', ')}`)
})

test('all fixture files have language modules', (t) => {
  const languageFiles = readdirSync('./src')
    .filter(f => f.endsWith('.js') && !f.startsWith('utils'))

  const missingModules = fixtureFiles.filter(f => !languageFiles.includes(f))
  t.deepEqual(missingModules, [], `Fixture files without language modules: ${missingModules.join(', ')}`)
})

test('all language files use valid BCP 47 codes', (t) => {
  const languageFiles = readdirSync('./src')
    .filter(f => f.endsWith('.js') && !f.startsWith('utils'))
    .map(f => f.replace('.js', ''))

  const invalidCodes = languageFiles.filter(code => !isValidLanguageCode(code))
  t.deepEqual(invalidCodes, [], `Invalid BCP 47 codes: ${invalidCodes.join(', ')}`)
})

test('all language files use canonical BCP 47 codes', (t) => {
  // Validity (above) accepts non-canonical casing: Intl.getCanonicalLocales
  // treats 'en-us' and 'zh-hans-cn' as valid. The project convention is the
  // canonical form (en-US, zh-Hans-CN), which lang:add produces. Guard against
  // a manually-added, mis-cased file slipping past the validity gate.
  const languageFiles = readdirSync('./src')
    .filter(f => f.endsWith('.js') && !f.startsWith('utils'))
    .map(f => f.replace('.js', ''))

  // Only flag valid-but-mis-cased codes; invalid codes (getCanonicalCode is
  // null) are the validity test's concern, so they're skipped here rather than
  // reported as a confusing "code → null". Canonicalize once per code.
  const nonCanonicalCodes = languageFiles.flatMap((code) => {
    const canonical = getCanonicalCode(code)
    return canonical && code !== canonical ? [`${code} → ${canonical}`] : []
  })
  t.deepEqual(nonCanonicalCodes, [], `Non-canonical BCP 47 codes (rename to canonical form): ${nonCanonicalCodes.join(', ')}`)
})

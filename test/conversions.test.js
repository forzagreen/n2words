import test from 'ava'
import { readdirSync, readFileSync } from 'node:fs'
import { isPlainObject } from '../src/utils/is-plain-object.js'
import { isValidLanguageCode } from './helpers/language-naming.js'
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
 *
 * Validates:
 * - BCP 47 file naming convention
 * - Fixture ↔ export cross-validation
 * - JSDoc annotations per exported function
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
    errorCases: null // No standard error cases for cardinal
  },
  ordinal: {
    functionName: 'toOrdinal',
    allowOptions: true, // Allow options for future ordinal implementations
    inputValidator: isValidOrdinalInput,
    inputDescription: 'positive integer',
    errorCases: [
      { input: 0, error: RangeError, desc: 'toOrdinal(0) should throw RangeError' },
      { input: -1, error: RangeError, desc: 'toOrdinal(-1) should throw RangeError' },
      { input: 1.5, error: RangeError, desc: 'toOrdinal(1.5) should throw RangeError' }
    ]
  },
  currency: {
    functionName: 'toCurrency',
    allowOptions: true,
    inputValidator: isValidCardinalInput,
    inputDescription: 'valid currency value',
    errorCases: null
  }
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
function getInputKey (input, options) {
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
 * @returns {{valid: boolean, error?: string, warnings?: string[]}} Validation result
 */
function validateFixture (testCases, languageCode, form, config) {
  const { inputValidator, inputDescription, allowOptions = true } = config
  const warnings = []

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

  // Track seen inputs to detect duplicates and conflicts
  const seenInputs = new Map() // key -> { index, expected }

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

    // Validate input using form-specific validator
    if (!inputValidator(input)) {
      return {
        valid: false,
        error: `Invalid input at index ${i} in ${languageCode} ${form}: expected ${inputDescription}, got ${safeStringify(input)}`
      }
    }

    // Validate expected output
    if (typeof expected !== 'string') {
      return {
        valid: false,
        error: `Invalid expected output at index ${i} in ${languageCode} ${form}: expected string, got ${typeof expected}`
      }
    }

    if (expected.length === 0) {
      return {
        valid: false,
        error: `Empty expected output at index ${i} in ${languageCode} ${form}: expected non-empty string`
      }
    }

    // Validate options
    if (options !== undefined) {
      if (!isPlainObject(options)) {
        return {
          valid: false,
          error: `Invalid options at index ${i} in ${languageCode} ${form}: expected plain object, got ${typeof options}`
        }
      }

      if (Object.keys(options).length === 0) {
        return {
          valid: false,
          error: `Empty options object at index ${i} in ${languageCode} ${form}: use undefined instead of {}`
        }
      }
    }

    // Check for duplicates and conflicts
    const key = getInputKey(input, options)
    const existing = seenInputs.get(key)

    if (existing) {
      if (existing.expected === expected) {
        // Exact duplicate - warning (redundant but not incorrect)
        warnings.push(`Duplicate test case at index ${i} in ${languageCode} ${form}: same as index ${existing.index}`)
      } else {
        // Conflict - same input, different expected output
        return {
          valid: false,
          error: `Conflicting test cases in ${languageCode} ${form}: index ${existing.index} expects "${existing.expected}" but index ${i} expects "${expected}" for input ${safeStringify(input)}`
        }
      }
    } else {
      seenInputs.set(key, { index: i, expected })
    }
  }

  return { valid: true, warnings: warnings.length > 0 ? warnings : undefined }
}

// ============================================================================
// JSDoc Validation
// ============================================================================

/**
 * Extracts the JSDoc block directly preceding a function declaration.
 *
 * @param {string} content File content
 * @param {string} functionName Function name to find
 * @returns {string|null} JSDoc block or null if not found
 */
function getJSDocForFunction (content, functionName) {
  const funcPattern = new RegExp(`function\\s+${functionName}\\s*\\(`)
  const funcMatch = funcPattern.exec(content)
  if (!funcMatch) return null

  const beforeFunc = content.substring(0, funcMatch.index)
  const jsdocPattern = /\/\*\*[\s\S]*?\*\//g
  let lastJsdoc = null
  let match
  while ((match = jsdocPattern.exec(beforeFunc)) !== null) {
    lastJsdoc = match[0]
  }

  return lastJsdoc
}

/**
 * Validates JSDoc structure for a conversion function.
 *
 * @param {string} jsdoc JSDoc content
 * @param {string} functionName Function name for error messages
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
function validateJSDoc (jsdoc, functionName) {
  const errors = []

  if (!jsdoc) {
    errors.push(`${functionName} is missing JSDoc`)
    return { valid: false, errors }
  }

  // Check for @param with value type
  if (!/@param\s+\{number\s*\|\s*string\s*\|\s*bigint\}\s+value/.test(jsdoc)) {
    errors.push(`${functionName} should have @param {number | string | bigint} value`)
  }

  // Check for @returns with string type
  if (!/@returns\s+\{string\}/.test(jsdoc)) {
    errors.push(`${functionName} should have @returns {string}`)
  }

  return { valid: errors.length === 0, errors }
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

const fixtureFiles = readdirSync('./test/fixtures').filter(f => f.endsWith('.js'))

for (const file of fixtureFiles) {
  const languageCode = file.replace('.js', '')

  test(languageCode, async t => {
    // Import modules
    const languageModule = await import('../src/' + file)
    const fixtureModule = await import('./fixtures/' + file)
    const fileContent = readFileSync(`./src/${file}`, 'utf8')

    // ========================================================================
    // BCP 47 Validation
    // ========================================================================

    t.true(
      isValidLanguageCode(languageCode),
      `${languageCode} should be a valid BCP 47 tag`
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

      // ----------------------------------------------------------------------
      // Export Validation
      // ----------------------------------------------------------------------

      if (typeof fn !== 'function') {
        t.fail(`${file} has ${formName} fixtures but does not export ${config.functionName}`)
        continue
      }

      // ----------------------------------------------------------------------
      // JSDoc Validation
      // ----------------------------------------------------------------------

      const jsdoc = getJSDocForFunction(fileContent, config.functionName)
      const jsdocValidation = validateJSDoc(jsdoc, config.functionName)
      if (!jsdocValidation.valid) {
        for (const error of jsdocValidation.errors) {
          t.fail(`${languageCode}: ${error}`)
        }
      }

      // ----------------------------------------------------------------------
      // Fixture Validation
      // ----------------------------------------------------------------------

      const validation = validateFixture(fixtureData, languageCode, formName, config)
      if (!validation.valid) {
        t.fail(validation.error)
        continue
      }

      // Log any warnings (e.g., duplicate test cases)
      if (validation.warnings) {
        for (const warning of validation.warnings) {
          t.log(`Warning: ${warning}`)
        }
      }

      // ----------------------------------------------------------------------
      // Conversion Tests
      // ----------------------------------------------------------------------

      runTestCases(t, fn, fixtureData, formName)

      // Coverage warning
      if (fixtureData.length < 25) {
        t.log(`Warning: ${languageCode} has only ${fixtureData.length} ${formName} test cases.`)
      }

      // ----------------------------------------------------------------------
      // Error Cases (form-specific)
      // ----------------------------------------------------------------------

      if (config.errorCases) {
        for (const { input, error, desc } of config.errorCases) {
          t.throws(() => fn(input), { instanceOf: error }, desc)
        }
      }
    }

    // ========================================================================
    // Fixture ↔ Export Cross-validation
    // ========================================================================

    // Ensure at least one form is tested
    t.true(hasAtLeastOneForm, `${languageCode} fixture must export at least one form (cardinal, ordinal, etc.)`)

    // Check for exports without fixtures (potential untested code)
    for (const [formName, config] of Object.entries(FORMS)) {
      const fn = languageModule[config.functionName]
      const fixtureData = fixtureModule[formName]

      if (typeof fn === 'function' && !fixtureData) {
        t.fail(`${languageCode} exports ${config.functionName} but fixture is missing ${formName} test cases`)
      }
    }
  })
}

// ============================================================================
// Structural Tests
// ============================================================================

test('all language files have test fixtures', t => {
  const languageFiles = readdirSync('./src')
    .filter(f => f.endsWith('.js') && !f.startsWith('utils'))

  const missingFixtures = languageFiles.filter(f => !fixtureFiles.includes(f))
  t.deepEqual(missingFixtures, [], `Missing test fixtures for: ${missingFixtures.join(', ')}`)
})

test('all fixture files have language modules', t => {
  const languageFiles = readdirSync('./src')
    .filter(f => f.endsWith('.js') && !f.startsWith('utils'))

  const missingModules = fixtureFiles.filter(f => !languageFiles.includes(f))
  t.deepEqual(missingModules, [], `Fixture files without language modules: ${missingModules.join(', ')}`)
})

test('all language files use valid BCP 47 codes', t => {
  const languageFiles = readdirSync('./src')
    .filter(f => f.endsWith('.js') && !f.startsWith('utils'))
    .map(f => f.replace('.js', ''))

  const invalidCodes = languageFiles.filter(code => !isValidLanguageCode(code))
  t.deepEqual(invalidCodes, [], `Invalid BCP 47 codes: ${invalidCodes.join(', ')}`)
})

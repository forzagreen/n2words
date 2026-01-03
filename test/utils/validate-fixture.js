/**
 * Test Fixture Validation
 *
 * Validates test fixture format using the same validation logic as the runtime API.
 * This ensures test fixtures are well-formed before tests run.
 */

import { isPlainObject } from '../../lib/utils/is-plain-object.js'
import { isValidNumericValue } from '../../lib/utils/parse-numeric.js'

/**
 * Validates a test fixture file format.
 *
 * Fixtures must be arrays of test cases where each test case is:
 * - [input, expected] or [input, expected, options]
 * - input: valid numeric value (number, string, or bigint)
 * - expected: string (the expected word output)
 * - options: plain object (optional)
 *
 * Uses the same validation logic as the runtime API:
 * - isValidNumericValue() for input validation
 * - isPlainObject() for options validation
 *
 * @param {Array} testFile The imported fixture file (default export)
 * @param {string} languageCode Language code for error messages
 * @returns {{valid: boolean, error?: string}} Validation result
 *
 * @example
 * const { default: fixture } = await import('./fixtures/en.js')
 * const result = validateFixture(fixture, 'en')
 * if (!result.valid) {
 *   console.error(result.error)
 * }
 */
export function validateFixture (testFile, languageCode) {
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

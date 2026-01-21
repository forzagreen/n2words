/**
 * Value Utilities
 *
 * General-purpose utilities for handling values in tests:
 * - Safe stringification (handles BigInt)
 * - Input validation
 */

import { parseCardinalValue } from '../../src/utils/parse-cardinal.js'
import { parseOrdinalValue } from '../../src/utils/parse-ordinal.js'

/**
 * Safely stringify a value for error messages.
 * Handles BigInt values which JSON.stringify cannot serialize.
 *
 * @param {*} value Value to stringify
 * @returns {string} String representation
 *
 * @example
 * safeStringify(42)           // '42'
 * safeStringify(123n)         // '123n'
 * safeStringify({ a: 1n })    // '{"a":"1n"}'
 * safeStringify([1, 2n, 3])   // '[1,"2n",3]'
 */
export function safeStringify (value) {
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
 * Checks if a value is valid input for cardinal conversion.
 *
 * @param {*} value Value to check
 * @returns {boolean} True if value is valid cardinal input
 */
export function isValidCardinalInput (value) {
  try {
    parseCardinalValue(value)
    return true
  } catch {
    return false
  }
}

/**
 * Checks if a value is valid input for ordinal conversion.
 * Ordinals require positive integers (no zero, negative, or decimals).
 *
 * @param {*} value Value to check
 * @returns {boolean} True if value is valid ordinal input
 */
export function isValidOrdinalInput (value) {
  try {
    parseOrdinalValue(value)
    return true
  } catch {
    return false
  }
}

/**
 * Safe Serialization Utilities
 *
 * Provides safe stringification for values that JSON.stringify cannot handle,
 * particularly BigInt values which are common in n2words test cases.
 */

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

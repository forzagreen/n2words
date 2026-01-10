/**
 * Checks if a value is a plain object (not null, array, or other object types).
 *
 * A plain object is one created by:
 * - Object literal: `{}`
 * - Object.create(null): null-prototype object
 *
 * This excludes arrays, class instances, Map, Set, and other object types.
 *
 * @param {*} value Value to check
 * @returns {boolean} True if value is a plain object
 */
export function isPlainObject (value) {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === null || proto === Object.prototype
}

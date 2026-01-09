import { isPlainObject } from './is-plain-object.js'

/**
 * Validates and normalizes the options parameter.
 *
 * @param {*} options The options value to validate
 * @returns {Object} A valid options object (empty object if undefined)
 * @throws {TypeError} If options is not undefined or a plain object
 */
export function validateOptions (options) {
  if (options === undefined) return {}
  if (isPlainObject(options)) return options
  throw new TypeError(
    `Invalid options: expected plain object or undefined, got ${typeof options}`
  )
}

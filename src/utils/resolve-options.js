import { isPlainObject } from './is-plain-object.js'

/**
 * Apply a form's option defaults and reject anything it doesn't declare.
 *
 * The exported defaults map (e.g. `cardinalDefaults`) is the single source of
 * truth for each option's default value — the form never restates it, and the
 * docs generator imports it rather than scraping the body. An unknown key or a
 * wrong-typed value throws loudly instead of being silently dropped.
 * @template {object} T
 * @param {T | undefined} options - Caller-provided options, or undefined
 * @param {Required<T>} defaults - The form's default for every option
 * @returns {Required<T>} The options with every default applied
 */
export function resolveOptions(options, defaults) {
  /** @type {Record<string, unknown>} */
  const resolved = { ...defaults }
  if (options === undefined) return /** @type {Required<T>} */ (resolved)

  if (!isPlainObject(options)) {
    throw new TypeError(`Invalid options: expected plain object or undefined, got ${typeof options}`)
  }
  for (const [key, value] of Object.entries(options)) {
    if (!(key in resolved)) {
      throw new RangeError(`Unknown option "${key}" — expected one of: ${Object.keys(resolved).join(', ')}`)
    }
    if (typeof value !== typeof resolved[key]) {
      throw new TypeError(`Option "${key}" must be a ${typeof resolved[key]}, got ${typeof value}`)
    }
    resolved[key] = value
  }
  return /** @type {Required<T>} */ (resolved)
}

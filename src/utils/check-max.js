/**
 * Range guard — the throwing counterpart of the scale-range producers.
 *
 * A precondition validator in the same family as `parseCardinalValue` /
 * `validateOptions`: the language calls it and it throws on a value past the
 * form's ceiling, e.g. `checkMax(integerPart, cardinalMax, decimalPart)`. The
 * `*Max` it consumes is produced by the pure helpers in `scale.js`.
 * @module check-max
 */

/**
 * Throws a `RangeError` when `value` — or its integer-spelled fraction —
 * reaches a form's ceiling (`max`, the smallest value the form refuses).
 *
 * Runs at the entry point: an O(1) short-circuit before any spelling is built —
 * the in-range path is just the bigint comparison, plus a single
 * `BigInt(fraction)` parse when an integer-spelled fraction is supplied. The
 * message renders `10^N - 1` when the ceiling is an exact power of ten,
 * otherwise the raw maximum.
 * @param {bigint} value The integer magnitude to test (integer part, dollars, …)
 * @param {bigint | null} max The form's ceiling, or `null` for no limit (never throws)
 * @param {string} [fraction] The decimal digit string — pass it **only** when the
 *   fraction is spelled via the scale builder; digit-by-digit and ordinal /
 *   currency forms omit it so long fractions stay valid.
 * @throws {RangeError} when the value is out of range
 */
export function checkMax(value, max, fraction) {
  if (max === null) return
  if (value < max && !(fraction && BigInt(fraction) >= max)) return
  const exponent = max.toString().length - 1
  const largest = max === 10n ** BigInt(exponent) ? `10^${exponent} - 1` : `${max - 1n}`
  throw new RangeError(`Number too large to convert: the largest supported value is ${largest}`)
}

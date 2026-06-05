/**
 * Range check for a parsed value against a form's ceiling.
 *
 * The counterpart to the scale-range helpers (which *produce* a form's `*Max`):
 * this *consumes* one. Pure — it returns a boolean and the caller throws, e.g.
 * `if (exceedsMax(integerPart, cardinalMax, decimalPart)) throw tooLargeError(cardinalMax)`.
 * @module exceeds-max
 */

/**
 * Whether a parsed value is out of a form's range — pure; the caller throws.
 * Pass `fraction` (the decimal digit string) only when the fraction is spelled
 * via the scale builder; digit-by-digit forms omit it so long fractions stay
 * valid. A `max` of `null` (unbounded) is never exceeded.
 * @param {bigint} value The integer magnitude to test (integer part, dollars, …)
 * @param {bigint | null} max The form's ceiling, or null for no limit
 * @param {string} [fraction] The decimal digit string, when integer-spelled
 * @returns {boolean} true if `value` — or its integer-spelled fraction — exceeds `max`
 */
export function exceedsMax(value, max, fraction) {
  if (max === null) return false
  if (value >= max) return true
  return fraction ? BigInt(fraction) >= max : false
}

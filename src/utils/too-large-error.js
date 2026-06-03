/**
 * Out-of-range error for numbers beyond a language's largest scale word.
 *
 * Spelling an arbitrary BigInt requires infinitely many scale words, so every
 * language has a ceiling. Past it, conversion throws rather than emitting
 * malformed output. This builds that error with a uniform message so every
 * language reports the condition identically — complementing the RangeErrors
 * that parse-cardinal / parse-currency / parse-ordinal already throw for
 * non-finite or out-of-domain input.
 * @module too-large-error
 */

/**
 * Builds the RangeError thrown when a value exceeds the largest scale word a
 * language can express.
 * @param {number} maxExponent The language can express values up to
 *   `10^maxExponent - 1`; values `>= 10^maxExponent` throw this error.
 * @returns {RangeError} A RangeError with a uniform, descriptive message.
 * @example
 * if (segments.length > SCALES.length + 2) throw tooLargeError(30)
 * // RangeError: Number too large to convert: the largest supported value is 10^30 - 1
 */
export function tooLargeError(maxExponent) {
  return new RangeError(
    `Number too large to convert: the largest supported value is 10^${maxExponent} - 1`,
  )
}

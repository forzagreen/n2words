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
 * Builds the RangeError thrown when a value exceeds the largest magnitude a
 * language can express.
 * @param {bigint | number} limit The ceiling value (bigint) — the smallest
 *   value the form refuses — or, for legacy call sites, its base-10 exponent.
 * @returns {RangeError} A RangeError with a uniform, descriptive message.
 * @example
 * throw tooLargeError(10n ** 30n) // ... largest supported value is 10^30 - 1
 * throw tooLargeError(30)         // (legacy) identical message
 */
export function tooLargeError(limit) {
  let largest
  if (typeof limit === 'bigint') {
    // Show "10^N - 1" when the ceiling is an exact power of ten (every decimal
    // system); otherwise the raw maximum, so the message stays honest for a
    // future non-decimal ceiling (e.g. a vigesimal 20^k).
    const exponent = limit.toString().length - 1
    largest = limit === 10n ** BigInt(exponent) ? `10^${exponent} - 1` : `${limit - 1n}`
  }
  else {
    largest = `10^${limit} - 1`
  }
  return new RangeError(`Number too large to convert: the largest supported value is ${largest}`)
}

/**
 * Currency value parsing utility.
 * Optimized parser for currency conversion - extracts dollars and cents.
 * @module parse-currency
 */

import { expandScientificNotation, hasScientificNotation, numberToString } from './expand-scientific.js'

/**
 * Parses a value for currency conversion.
 * Returns dollars and cents as separate bigints, plus negative flag.
 *
 * **Precision:** exactly two decimal digits are tracked; anything finer is
 * truncated (`'1.004'` → 1 dollar, 0 cents). That granularity is deliberate
 * and is the package's currency contract, for two reasons: it is at least as
 * fine as the minor unit of every currency n2words can name (all have an ISO
 * 4217 exponent of 2 or 0 — see `CURRENCY_EXPONENTS` in currency-vocab.js),
 * so nothing a currency could actually represent is ever lost; and float
 * input would otherwise be unusable, since `0.1 + 0.2` is
 * `0.30000000000000004` and rejecting or spelling that tail helps nobody.
 * @param {number|string|bigint} value - The value to parse
 * @returns {{isNegative: boolean, dollars: bigint, cents: bigint}} The parsed dollars and cents with a negative flag.
 * @throws {TypeError} If value is not number, string, or bigint
 * @throws {RangeError} If value is not finite
 */
export function parseCurrencyValue(value) {
  const type = typeof value

  // BigInt: whole dollars only
  if (typeof value === 'bigint') {
    return value < 0n
      ? { isNegative: true, dollars: -value, cents: 0n }
      : { isNegative: false, dollars: value, cents: 0n }
  }

  // Number: fast path for safe integers
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new RangeError('Currency must be a finite number')
    }
    if (Number.isSafeInteger(value)) {
      return value < 0
        ? { isNegative: true, dollars: BigInt(-value), cents: 0n }
        : { isNegative: false, dollars: BigInt(value), cents: 0n }
    }
    // Non-integer or unsafe: convert to string
    return parseCurrencyString(numberToString(value))
  }

  // String input
  if (typeof value === 'string') {
    return parseCurrencyString(value)
  }

  throw new TypeError(
    `Invalid value type: expected number, string, or bigint, received ${type}`,
  )
}

/**
 * Parses a string for currency conversion.
 * @param {string} value - The string to parse
 * @returns {{isNegative: boolean, dollars: bigint, cents: bigint}} The parsed dollars and cents with a negative flag.
 */
function parseCurrencyString(value) {
  let str = value.trim()

  if (str.length === 0 || Number.isNaN(Number(str))) {
    throw new RangeError(`Invalid currency format: "${value}"`)
  }

  // Expand scientific notation
  if (hasScientificNotation(str)) {
    str = expandScientificNotation(str)
  }

  // Handle negative
  const isNegative = str[0] === '-'
  if (isNegative) str = str.slice(1)

  // Split on decimal
  const dotIndex = str.indexOf('.')
  if (dotIndex === -1) {
    return { isNegative, dollars: BigInt(str), cents: 0n }
  }

  const dollarStr = str.slice(0, dotIndex) || '0'
  const decimalPart = str.slice(dotIndex + 1)

  // Truncate to 2 decimal places and pad if needed. See parseCurrencyValue's
  // "Precision" note for why truncating here is the contract, not a rounding bug.
  const centStr = (decimalPart + '00').slice(0, 2)

  return {
    isNegative,
    dollars: BigInt(dollarStr),
    cents: BigInt(centStr),
  }
}

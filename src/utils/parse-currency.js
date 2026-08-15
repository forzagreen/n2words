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
 * **Precision:** `minorDigits` decimal digits are tracked and anything finer
 * is truncated — at the default of 2, `'1.004'` is 1 dollar and 0 cents.
 * Truncating rather than rejecting is deliberate: float input would otherwise
 * be unusable, since `0.1 + 0.2` is `0.30000000000000004` and neither
 * rejecting nor spelling that tail helps anybody.
 *
 * Pass 3 for a currency whose minor unit is a thousandth (millimes, fils —
 * see `CURRENCY_EXPONENTS` in currency-vocab.js), so that `'1.500'` dinars
 * parses as 500 millimes rather than 50. Use `minorUnitDigits(currency)` to
 * derive it instead of hard-coding, and note it returns 2 — not 0 — for a
 * zero-exponent currency like JPY: those are rejected by
 * `assertCurrencyExponent`, which can only see a fraction the parser kept.
 * @param {number|string|bigint} value - The value to parse
 * @param {number} [minorDigits] - Decimal digits to track (2 or 3, default 2)
 * @returns {{isNegative: boolean, dollars: bigint, cents: bigint}} The parsed dollars and cents with a negative flag.
 * @throws {TypeError} If value is not number, string, or bigint
 * @throws {RangeError} If value is not finite
 */
export function parseCurrencyValue(value, minorDigits = 2) {
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
    return parseCurrencyString(numberToString(value), minorDigits)
  }

  // String input
  if (typeof value === 'string') {
    return parseCurrencyString(value, minorDigits)
  }

  throw new TypeError(
    `Invalid value type: expected number, string, or bigint, received ${type}`,
  )
}

/**
 * Parses a string for currency conversion.
 * @param {string} value - The string to parse
 * @param {number} minorDigits - Decimal digits to track (2 or 3)
 * @returns {{isNegative: boolean, dollars: bigint, cents: bigint}} The parsed dollars and cents with a negative flag.
 */
function parseCurrencyString(value, minorDigits) {
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

  // Truncate to minorDigits places and pad if needed. See parseCurrencyValue's
  // "Precision" note for why truncating here is the contract, not a rounding bug.
  const centStr = (decimalPart + '000').slice(0, minorDigits)

  return {
    isNegative,
    dollars: BigInt(dollarStr),
    cents: BigInt(centStr),
  }
}

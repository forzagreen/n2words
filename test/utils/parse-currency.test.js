import test from 'ava'
import { parseCurrencyValue } from '../../src/utils/parse-currency.js'

/**
 * Unit Tests for parse-currency.js
 *
 * Tests the currency value parsing utilities including:
 * - Valid types: number, string, bigint
 * - Invalid types: everything else
 * - Dollars and cents extraction
 * - Negative handling
 * - Decimal truncation to 2 places
 * - Scientific notation
 * - Edge cases
 */

// ============================================================================
// Valid Types (number, string, bigint)
// ============================================================================

test('accepts number type', t => {
  const result = parseCurrencyValue(42)
  t.deepEqual(result, { isNegative: false, dollars: 42n, cents: 0n })
})

test('accepts string type', t => {
  const result = parseCurrencyValue('42')
  t.deepEqual(result, { isNegative: false, dollars: 42n, cents: 0n })
})

test('accepts bigint type', t => {
  const result = parseCurrencyValue(42n)
  t.deepEqual(result, { isNegative: false, dollars: 42n, cents: 0n })
})

// ============================================================================
// Invalid Types - Must Reject Everything Except number, string, bigint
// ============================================================================

test('rejects null', t => {
  const error = t.throws(() => parseCurrencyValue(null), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects undefined', t => {
  const error = t.throws(() => parseCurrencyValue(undefined), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects boolean', t => {
  t.throws(() => parseCurrencyValue(true), { instanceOf: TypeError })
  t.throws(() => parseCurrencyValue(false), { instanceOf: TypeError })
})

test('rejects object', t => {
  t.throws(() => parseCurrencyValue({}), { instanceOf: TypeError })
  t.throws(() => parseCurrencyValue({ valueOf: () => 42 }), { instanceOf: TypeError })
})

test('rejects array', t => {
  t.throws(() => parseCurrencyValue([42]), { instanceOf: TypeError })
})

test('rejects function', t => {
  t.throws(() => parseCurrencyValue(() => 42), { instanceOf: TypeError })
})

// ============================================================================
// Special Numbers
// ============================================================================

test('rejects NaN', t => {
  const error = t.throws(() => parseCurrencyValue(NaN), { instanceOf: Error })
  t.regex(error.message, /finite/)
})

test('rejects Infinity', t => {
  const error = t.throws(() => parseCurrencyValue(Infinity), { instanceOf: Error })
  t.regex(error.message, /finite/)
})

test('rejects negative Infinity', t => {
  const error = t.throws(() => parseCurrencyValue(-Infinity), { instanceOf: Error })
  t.regex(error.message, /finite/)
})

// ============================================================================
// String Validation
// ============================================================================

test('rejects empty string', t => {
  const error = t.throws(() => parseCurrencyValue(''), { instanceOf: Error })
  t.regex(error.message, /Invalid currency format/)
})

test('rejects whitespace-only string', t => {
  const error = t.throws(() => parseCurrencyValue('   '), { instanceOf: Error })
  t.regex(error.message, /Invalid currency format/)
})

test('rejects non-numeric string', t => {
  const error = t.throws(() => parseCurrencyValue('abc'), { instanceOf: Error })
  t.regex(error.message, /Invalid currency format/)
})

test('trims whitespace from string', t => {
  const result = parseCurrencyValue('  42.50  ')
  t.deepEqual(result, { isNegative: false, dollars: 42n, cents: 50n })
})

// ============================================================================
// Dollars Only (whole numbers)
// ============================================================================

test('parses zero', t => {
  t.deepEqual(parseCurrencyValue(0), { isNegative: false, dollars: 0n, cents: 0n })
  t.deepEqual(parseCurrencyValue('0'), { isNegative: false, dollars: 0n, cents: 0n })
  t.deepEqual(parseCurrencyValue(0n), { isNegative: false, dollars: 0n, cents: 0n })
})

test('parses whole dollar amounts', t => {
  t.deepEqual(parseCurrencyValue(1), { isNegative: false, dollars: 1n, cents: 0n })
  t.deepEqual(parseCurrencyValue(100), { isNegative: false, dollars: 100n, cents: 0n })
  t.deepEqual(parseCurrencyValue(1000000), { isNegative: false, dollars: 1000000n, cents: 0n })
})

test('parses large bigint dollar amounts', t => {
  const result = parseCurrencyValue(1000000000000n)
  t.deepEqual(result, { isNegative: false, dollars: 1000000000000n, cents: 0n })
})

// ============================================================================
// Dollars and Cents
// ============================================================================

test('parses decimal with two places', t => {
  t.deepEqual(parseCurrencyValue(42.50), { isNegative: false, dollars: 42n, cents: 50n })
  t.deepEqual(parseCurrencyValue('42.50'), { isNegative: false, dollars: 42n, cents: 50n })
})

test('parses decimal with one place (pads to two)', t => {
  t.deepEqual(parseCurrencyValue(42.5), { isNegative: false, dollars: 42n, cents: 50n })
  t.deepEqual(parseCurrencyValue('42.5'), { isNegative: false, dollars: 42n, cents: 50n })
})

test('parses small cents', t => {
  t.deepEqual(parseCurrencyValue(0.01), { isNegative: false, dollars: 0n, cents: 1n })
  t.deepEqual(parseCurrencyValue(0.09), { isNegative: false, dollars: 0n, cents: 9n })
})

test('parses cents only', t => {
  t.deepEqual(parseCurrencyValue(0.50), { isNegative: false, dollars: 0n, cents: 50n })
  t.deepEqual(parseCurrencyValue(0.99), { isNegative: false, dollars: 0n, cents: 99n })
})

test('parses one dollar one cent', t => {
  t.deepEqual(parseCurrencyValue(1.01), { isNegative: false, dollars: 1n, cents: 1n })
})

// ============================================================================
// Decimal Truncation (more than 2 places)
// ============================================================================

test('truncates to 2 decimal places', t => {
  t.deepEqual(parseCurrencyValue(1.999), { isNegative: false, dollars: 1n, cents: 99n })
  t.deepEqual(parseCurrencyValue('1.234'), { isNegative: false, dollars: 1n, cents: 23n })
  t.deepEqual(parseCurrencyValue('0.001'), { isNegative: false, dollars: 0n, cents: 0n })
})

test('handles trailing zeros in string', t => {
  t.deepEqual(parseCurrencyValue('5.00'), { isNegative: false, dollars: 5n, cents: 0n })
  t.deepEqual(parseCurrencyValue('5.10'), { isNegative: false, dollars: 5n, cents: 10n })
})

// ============================================================================
// Negative Values
// ============================================================================

test('parses negative whole number', t => {
  t.deepEqual(parseCurrencyValue(-42), { isNegative: true, dollars: 42n, cents: 0n })
  t.deepEqual(parseCurrencyValue('-42'), { isNegative: true, dollars: 42n, cents: 0n })
})

test('parses negative bigint', t => {
  t.deepEqual(parseCurrencyValue(-100n), { isNegative: true, dollars: 100n, cents: 0n })
})

test('parses negative decimal', t => {
  t.deepEqual(parseCurrencyValue(-42.50), { isNegative: true, dollars: 42n, cents: 50n })
  t.deepEqual(parseCurrencyValue('-42.50'), { isNegative: true, dollars: 42n, cents: 50n })
})

test('parses negative cents only', t => {
  t.deepEqual(parseCurrencyValue(-0.50), { isNegative: true, dollars: 0n, cents: 50n })
})

test('handles negative zero as non-negative', t => {
  t.deepEqual(parseCurrencyValue(-0), { isNegative: false, dollars: 0n, cents: 0n })
})

// ============================================================================
// Scientific Notation
// ============================================================================

test('expands positive scientific notation', t => {
  t.deepEqual(parseCurrencyValue('1e3'), { isNegative: false, dollars: 1000n, cents: 0n })
  t.deepEqual(parseCurrencyValue('1.5e2'), { isNegative: false, dollars: 150n, cents: 0n })
})

test('expands negative exponent to decimal', t => {
  t.deepEqual(parseCurrencyValue('5e-1'), { isNegative: false, dollars: 0n, cents: 50n })
  t.deepEqual(parseCurrencyValue('1e-2'), { isNegative: false, dollars: 0n, cents: 1n })
})

test('handles negative scientific notation', t => {
  t.deepEqual(parseCurrencyValue('-1e2'), { isNegative: true, dollars: 100n, cents: 0n })
})

// ============================================================================
// Edge Cases
// ============================================================================

test('handles MAX_SAFE_INTEGER', t => {
  const result = parseCurrencyValue(Number.MAX_SAFE_INTEGER)
  t.is(result.isNegative, false)
  t.is(result.dollars, BigInt(Number.MAX_SAFE_INTEGER))
  t.is(result.cents, 0n)
})

test('handles string with leading zeros', t => {
  t.deepEqual(parseCurrencyValue('007.50'), { isNegative: false, dollars: 7n, cents: 50n })
})

test('handles leading dot notation', t => {
  t.deepEqual(parseCurrencyValue('.50'), { isNegative: false, dollars: 0n, cents: 50n })
  t.deepEqual(parseCurrencyValue('.99'), { isNegative: false, dollars: 0n, cents: 99n })
})

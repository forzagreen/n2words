import test from 'ava'
import { parseNumericValue } from '../../../lib/utils/parse-numeric.js'

/**
 * Unit Tests for parse-numeric.js
 *
 * Tests the numeric parsing utilities including:
 * - Type validation (number, string, bigint)
 * - Special number handling (NaN, Infinity)
 * - Scientific notation expansion
 * - Negative number parsing
 * - Decimal parsing
 * - Edge cases
 */

// ============================================================================
// Type Validation Tests
// ============================================================================

test('accepts number type', t => {
  const result = parseNumericValue(42)
  t.deepEqual(result, { isNegative: false, integerPart: 42n })
})

test('accepts string type', t => {
  const result = parseNumericValue('42')
  t.deepEqual(result, { isNegative: false, integerPart: 42n })
})

test('accepts bigint type', t => {
  const result = parseNumericValue(42n)
  t.deepEqual(result, { isNegative: false, integerPart: 42n })
})

test('rejects null', t => {
  const error = t.throws(() => parseNumericValue(null), { instanceOf: TypeError })
  t.is(error.message, 'Invalid value type: expected number, string, or bigint, received object')
})

test('rejects undefined', t => {
  const error = t.throws(() => parseNumericValue(undefined), { instanceOf: TypeError })
  t.is(error.message, 'Invalid value type: expected number, string, or bigint, received undefined')
})

test('rejects object', t => {
  const error = t.throws(() => parseNumericValue({}), { instanceOf: TypeError })
  t.is(error.message, 'Invalid value type: expected number, string, or bigint, received object')
})

test('rejects array', t => {
  const error = t.throws(() => parseNumericValue([42]), { instanceOf: TypeError })
  t.is(error.message, 'Invalid value type: expected number, string, or bigint, received object')
})

test('rejects symbol', t => {
  const error = t.throws(() => parseNumericValue(Symbol('test')), { instanceOf: TypeError })
  t.is(error.message, 'Invalid value type: expected number, string, or bigint, received symbol')
})

test('rejects function', t => {
  const error = t.throws(() => parseNumericValue(() => 42), { instanceOf: TypeError })
  t.is(error.message, 'Invalid value type: expected number, string, or bigint, received function')
})

// ============================================================================
// Special Number Handling
// ============================================================================

test('rejects NaN', t => {
  const error = t.throws(() => parseNumericValue(NaN), { instanceOf: Error })
  t.is(error.message, 'Number must be finite (NaN and Infinity are not supported)')
})

test('rejects Infinity', t => {
  const error = t.throws(() => parseNumericValue(Infinity), { instanceOf: Error })
  t.is(error.message, 'Number must be finite (NaN and Infinity are not supported)')
})

test('rejects negative Infinity', t => {
  const error = t.throws(() => parseNumericValue(-Infinity), { instanceOf: Error })
  t.is(error.message, 'Number must be finite (NaN and Infinity are not supported)')
})

// ============================================================================
// String Validation
// ============================================================================

test('rejects empty string', t => {
  const error = t.throws(() => parseNumericValue(''), { instanceOf: Error })
  t.is(error.message, 'Invalid number format: ""')
})

test('rejects whitespace-only string', t => {
  const error = t.throws(() => parseNumericValue('   '), { instanceOf: Error })
  t.is(error.message, 'Invalid number format: "   "')
})

test('rejects non-numeric string', t => {
  const error = t.throws(() => parseNumericValue('abc'), { instanceOf: Error })
  t.is(error.message, 'Invalid number format: "abc"')
})

test('trims whitespace from string', t => {
  const result = parseNumericValue('  42  ')
  t.deepEqual(result, { isNegative: false, integerPart: 42n })
})

test('handles string with leading zeros', t => {
  const result = parseNumericValue('00042')
  t.deepEqual(result, { isNegative: false, integerPart: 42n })
})

// ============================================================================
// Negative Number Parsing
// ============================================================================

test('parses negative number', t => {
  const result = parseNumericValue(-42)
  t.deepEqual(result, { isNegative: true, integerPart: 42n })
})

test('parses negative string', t => {
  const result = parseNumericValue('-42')
  t.deepEqual(result, { isNegative: true, integerPart: 42n })
})

test('parses negative bigint', t => {
  const result = parseNumericValue(-42n)
  t.deepEqual(result, { isNegative: true, integerPart: 42n })
})

test('handles negative zero as zero', t => {
  const result = parseNumericValue(-0)
  t.is(result.isNegative, false)
  t.is(result.integerPart, 0n)
})

// ============================================================================
// Decimal Parsing
// ============================================================================

test('parses decimal number', t => {
  const result = parseNumericValue(3.14)
  t.is(result.isNegative, false)
  t.is(result.integerPart, 3n)
  t.is(result.decimalPart, '14')
})

test('parses decimal string', t => {
  const result = parseNumericValue('3.14')
  t.is(result.isNegative, false)
  t.is(result.integerPart, 3n)
  t.is(result.decimalPart, '14')
})

test('parses negative decimal', t => {
  const result = parseNumericValue(-3.14)
  t.is(result.isNegative, true)
  t.is(result.integerPart, 3n)
  t.is(result.decimalPart, '14')
})

test('parses decimal less than 1', t => {
  const result = parseNumericValue(0.5)
  t.is(result.isNegative, false)
  t.is(result.integerPart, 0n)
  t.is(result.decimalPart, '5')
})

test('parses string with trailing decimal', t => {
  const result = parseNumericValue('42.')
  t.is(result.isNegative, false)
  t.is(result.integerPart, 42n)
  // Empty decimal part is not included
  t.is(result.decimalPart, '')
})

test('parses string with decimal zeros', t => {
  const result = parseNumericValue('42.00')
  t.is(result.isNegative, false)
  t.is(result.integerPart, 42n)
  t.is(result.decimalPart, '00')
})

test('handles very small decimals', t => {
  const result = parseNumericValue(0.000001)
  t.is(result.isNegative, false)
  t.is(result.integerPart, 0n)
  t.is(result.decimalPart, '000001')
})

// ============================================================================
// Scientific Notation
// ============================================================================

test('expands positive scientific notation', t => {
  const result = parseNumericValue(1e21)
  t.is(result.isNegative, false)
  t.is(result.integerPart, 1000000000000000000000n)
  t.is(result.decimalPart, undefined)
})

test('expands scientific notation string', t => {
  const result = parseNumericValue('1e21')
  t.is(result.isNegative, false)
  t.is(result.integerPart, 1000000000000000000000n)
})

test('expands uppercase E notation', t => {
  const result = parseNumericValue('1E21')
  t.is(result.isNegative, false)
  t.is(result.integerPart, 1000000000000000000000n)
})

test('expands negative exponent to decimal', t => {
  const result = parseNumericValue(1e-3)
  t.is(result.isNegative, false)
  t.is(result.integerPart, 0n)
  t.is(result.decimalPart, '001')
})

test('expands scientific with decimal mantissa', t => {
  const result = parseNumericValue('1.5e3')
  t.is(result.isNegative, false)
  t.is(result.integerPart, 1500n)
  t.is(result.decimalPart, undefined)
})

test('handles negative scientific notation', t => {
  const result = parseNumericValue(-1e21)
  t.is(result.isNegative, true)
  t.is(result.integerPart, 1000000000000000000000n)
})

// ============================================================================
// Large Number Handling
// ============================================================================

test('handles MAX_SAFE_INTEGER', t => {
  const result = parseNumericValue(Number.MAX_SAFE_INTEGER)
  t.is(result.isNegative, false)
  t.is(result.integerPart, BigInt(Number.MAX_SAFE_INTEGER))
})

test('handles large bigint', t => {
  const large = 123456789012345678901234567890n
  const result = parseNumericValue(large)
  t.is(result.isNegative, false)
  t.is(result.integerPart, large)
})

test('handles negative large bigint', t => {
  const large = -123456789012345678901234567890n
  const result = parseNumericValue(large)
  t.is(result.isNegative, true)
  t.is(result.integerPart, 123456789012345678901234567890n)
})

// ============================================================================
// Edge Cases
// ============================================================================

test('parses zero', t => {
  t.deepEqual(parseNumericValue(0), { isNegative: false, integerPart: 0n })
  t.deepEqual(parseNumericValue('0'), { isNegative: false, integerPart: 0n })
  t.deepEqual(parseNumericValue(0n), { isNegative: false, integerPart: 0n })
})

test('parses one', t => {
  t.deepEqual(parseNumericValue(1), { isNegative: false, integerPart: 1n })
  t.deepEqual(parseNumericValue('1'), { isNegative: false, integerPart: 1n })
  t.deepEqual(parseNumericValue(1n), { isNegative: false, integerPart: 1n })
})

test('handles shorthand decimal notation', t => {
  // -.5 is a valid JavaScript number
  const result = parseNumericValue('-.5')
  t.is(result.isNegative, true)
  t.is(result.integerPart, 0n)
  t.is(result.decimalPart, '5')
})

test('preserves decimal precision', t => {
  // 3.141592653589793 is pi with maximum JS precision
  const result = parseNumericValue(3.141592653589793)
  t.is(result.integerPart, 3n)
  t.true(result.decimalPart.startsWith('14159265358979'))
})

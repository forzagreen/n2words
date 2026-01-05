import test from 'ava'
import { parseNumericValue } from '../../../lib/utils/parse-numeric.js'

/**
 * Unit Tests for parse-numeric.js
 *
 * Tests the numeric parsing utilities including:
 * - Valid types: number, string, bigint
 * - Invalid types: everything else
 * - Special number handling (NaN, Infinity)
 * - Scientific notation expansion
 * - Negative number parsing
 * - Decimal parsing
 * - Edge cases
 */

// ============================================================================
// Valid Types (number, string, bigint)
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

// ============================================================================
// Invalid Types - Must Reject Everything Except number, string, bigint
// ============================================================================

test('rejects null', t => {
  const error = t.throws(() => parseNumericValue(null), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects undefined', t => {
  const error = t.throws(() => parseNumericValue(undefined), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects boolean true', t => {
  const error = t.throws(() => parseNumericValue(true), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects boolean false', t => {
  const error = t.throws(() => parseNumericValue(false), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects plain object', t => {
  const error = t.throws(() => parseNumericValue({}), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects object with valueOf', t => {
  // Objects with valueOf should NOT be auto-converted
  const error = t.throws(() => parseNumericValue({ valueOf: () => 42 }), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects object with toString', t => {
  // Objects with toString should NOT be auto-converted
  const error = t.throws(() => parseNumericValue({ toString: () => '42' }), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects array', t => {
  const error = t.throws(() => parseNumericValue([42]), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects empty array', t => {
  const error = t.throws(() => parseNumericValue([]), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects symbol', t => {
  const error = t.throws(() => parseNumericValue(Symbol('test')), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects function', t => {
  const error = t.throws(() => parseNumericValue(() => 42), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects arrow function', t => {
  const error = t.throws(() => parseNumericValue(() => {}), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects Date object', t => {
  const error = t.throws(() => parseNumericValue(new Date()), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects RegExp', t => {
  const error = t.throws(() => parseNumericValue(/\d+/), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects Map', t => {
  const error = t.throws(() => parseNumericValue(new Map()), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects Set', t => {
  const error = t.throws(() => parseNumericValue(new Set()), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects Error object', t => {
  const error = t.throws(() => parseNumericValue(new Error('test')), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects Promise', t => {
  const error = t.throws(() => parseNumericValue(Promise.resolve(42)), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects Number object wrapper', t => {
  // new Number(42) is an object, not a primitive number
  const error = t.throws(() => parseNumericValue(new Number(42)), { instanceOf: TypeError }) // eslint-disable-line no-new-wrappers
  t.regex(error.message, /Invalid value type/)
})

test('rejects String object wrapper', t => {
  // new String('42') is an object, not a primitive string
  const error = t.throws(() => parseNumericValue(new String('42')), { instanceOf: TypeError }) // eslint-disable-line no-new-wrappers
  t.regex(error.message, /Invalid value type/)
})

test('rejects class instance', t => {
  class MyNumber {
    constructor (value) { this.value = value }
    valueOf () { return this.value }
  }
  const error = t.throws(() => parseNumericValue(new MyNumber(42)), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

// ============================================================================
// Invalid Number Values (NaN, Infinity)
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
// Invalid String Values
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

test('rejects string with letters mixed in', t => {
  const error = t.throws(() => parseNumericValue('12abc34'), { instanceOf: Error })
  t.is(error.message, 'Invalid number format: "12abc34"')
})

test('accepts hex string (parsed via Number)', t => {
  // 0xFF = 255 in decimal
  const result = parseNumericValue('0xFF')
  t.deepEqual(result, { isNegative: false, integerPart: 255n })
})

test('accepts binary string (parsed via Number)', t => {
  // 0b101 = 5 in decimal
  const result = parseNumericValue('0b101')
  t.deepEqual(result, { isNegative: false, integerPart: 5n })
})

test('accepts octal string (parsed via Number)', t => {
  // 0o777 = 511 in decimal
  const result = parseNumericValue('0o777')
  t.deepEqual(result, { isNegative: false, integerPart: 511n })
})

// ============================================================================
// Valid String Parsing
// ============================================================================

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

test('handles MIN_SAFE_INTEGER', t => {
  const result = parseNumericValue(Number.MIN_SAFE_INTEGER)
  t.is(result.isNegative, true)
  t.is(result.integerPart, BigInt(-Number.MIN_SAFE_INTEGER))
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
  const result = parseNumericValue('-.5')
  t.is(result.isNegative, true)
  t.is(result.integerPart, 0n)
  t.is(result.decimalPart, '5')
})

test('handles leading dot notation', t => {
  const result = parseNumericValue('.5')
  t.is(result.isNegative, false)
  t.is(result.integerPart, 0n)
  t.is(result.decimalPart, '5')
})

test('preserves decimal precision', t => {
  const result = parseNumericValue(3.141592653589793)
  t.is(result.integerPart, 3n)
  t.true(result.decimalPart.startsWith('14159265358979'))
})

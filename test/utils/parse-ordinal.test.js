import test from 'ava'
import { parseOrdinalValue } from '../../src/utils/parse-ordinal.js'

/**
 * Unit Tests for parse-ordinal.js
 *
 * Tests the ordinal value parsing utilities including:
 * - Valid types: number, string, bigint (positive integers only)
 * - Invalid types: everything else
 * - Rejection of zero, negatives, decimals
 * - Scientific notation handling
 * - Edge cases
 *
 * Key difference from parse-cardinal: returns bigint directly, not an object.
 */

// ============================================================================
// Valid Inputs - Positive Integers
// ============================================================================

test('accepts positive number', t => {
  t.is(parseOrdinalValue(42), 42n)
})

test('accepts positive string', t => {
  t.is(parseOrdinalValue('42'), 42n)
})

test('accepts positive bigint', t => {
  t.is(parseOrdinalValue(42n), 42n)
})

test('accepts 1 (smallest valid ordinal)', t => {
  t.is(parseOrdinalValue(1), 1n)
  t.is(parseOrdinalValue('1'), 1n)
  t.is(parseOrdinalValue(1n), 1n)
})

test('trims whitespace from string', t => {
  t.is(parseOrdinalValue('  42  '), 42n)
})

test('handles string with leading zeros', t => {
  t.is(parseOrdinalValue('00042'), 42n)
})

// ============================================================================
// Invalid Types - Must Reject Everything Except number, string, bigint
// ============================================================================

test('rejects null', t => {
  const error = t.throws(() => parseOrdinalValue(null), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects undefined', t => {
  const error = t.throws(() => parseOrdinalValue(undefined), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects boolean true', t => {
  const error = t.throws(() => parseOrdinalValue(true), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects boolean false', t => {
  const error = t.throws(() => parseOrdinalValue(false), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects plain object', t => {
  const error = t.throws(() => parseOrdinalValue({}), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects object with valueOf', t => {
  const error = t.throws(() => parseOrdinalValue({ valueOf: () => 42 }), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects array', t => {
  const error = t.throws(() => parseOrdinalValue([42]), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects symbol', t => {
  const error = t.throws(() => parseOrdinalValue(Symbol('test')), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects function', t => {
  const error = t.throws(() => parseOrdinalValue(() => 42), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects Date object', t => {
  const error = t.throws(() => parseOrdinalValue(new Date()), { instanceOf: TypeError })
  t.regex(error.message, /Invalid value type/)
})

test('rejects Number object wrapper', t => {
  const error = t.throws(() => parseOrdinalValue(new Number(42)), { instanceOf: TypeError }) // eslint-disable-line no-new-wrappers
  t.regex(error.message, /Invalid value type/)
})

test('rejects String object wrapper', t => {
  const error = t.throws(() => parseOrdinalValue(new String('42')), { instanceOf: TypeError }) // eslint-disable-line no-new-wrappers
  t.regex(error.message, /Invalid value type/)
})

// ============================================================================
// Zero Rejection - Zero is not a valid ordinal
// ============================================================================

test('rejects zero number', t => {
  const error = t.throws(() => parseOrdinalValue(0), { instanceOf: RangeError })
  t.regex(error.message, /positive integers/)
})

test('rejects zero string', t => {
  const error = t.throws(() => parseOrdinalValue('0'), { instanceOf: RangeError })
  t.regex(error.message, /positive integers/)
})

test('rejects zero bigint', t => {
  const error = t.throws(() => parseOrdinalValue(0n), { instanceOf: RangeError })
  t.regex(error.message, /positive integers/)
})

test('rejects negative zero', t => {
  const error = t.throws(() => parseOrdinalValue(-0), { instanceOf: RangeError })
  t.regex(error.message, /positive integers/)
})

// ============================================================================
// Negative Number Rejection
// ============================================================================

test('rejects negative number', t => {
  const error = t.throws(() => parseOrdinalValue(-42), { instanceOf: RangeError })
  t.regex(error.message, /positive integers/)
})

test('rejects negative string', t => {
  const error = t.throws(() => parseOrdinalValue('-42'), { instanceOf: RangeError })
  t.regex(error.message, /cannot be negative/)
})

test('rejects negative bigint', t => {
  const error = t.throws(() => parseOrdinalValue(-42n), { instanceOf: RangeError })
  t.regex(error.message, /positive integers/)
})

test('rejects -1', t => {
  t.throws(() => parseOrdinalValue(-1), { instanceOf: RangeError })
  t.throws(() => parseOrdinalValue('-1'), { instanceOf: RangeError })
  t.throws(() => parseOrdinalValue(-1n), { instanceOf: RangeError })
})

// ============================================================================
// Decimal Rejection - Ordinals must be whole numbers
// ============================================================================

test('rejects decimal number', t => {
  const error = t.throws(() => parseOrdinalValue(3.14), { instanceOf: RangeError })
  t.regex(error.message, /whole numbers/)
})

test('rejects decimal string', t => {
  const error = t.throws(() => parseOrdinalValue('3.14'), { instanceOf: RangeError })
  t.regex(error.message, /whole numbers/)
})

test('rejects 1.5', t => {
  const error = t.throws(() => parseOrdinalValue(1.5), { instanceOf: RangeError })
  t.regex(error.message, /whole numbers/)
})

test('rejects 0.5', t => {
  const error = t.throws(() => parseOrdinalValue(0.5), { instanceOf: RangeError })
  t.regex(error.message, /whole numbers/)
})

test('rejects string with decimal point', t => {
  const error = t.throws(() => parseOrdinalValue('42.0'), { instanceOf: RangeError })
  t.regex(error.message, /whole numbers/)
})

test('rejects string with trailing decimal', t => {
  const error = t.throws(() => parseOrdinalValue('42.'), { instanceOf: RangeError })
  t.regex(error.message, /whole numbers/)
})

test('rejects string with leading decimal', t => {
  const error = t.throws(() => parseOrdinalValue('.5'), { instanceOf: RangeError })
  t.regex(error.message, /whole numbers/)
})

// ============================================================================
// Special Number Rejection (NaN, Infinity)
// ============================================================================

test('rejects NaN', t => {
  const error = t.throws(() => parseOrdinalValue(NaN), { instanceOf: RangeError })
  t.regex(error.message, /finite numbers/)
})

test('rejects Infinity', t => {
  const error = t.throws(() => parseOrdinalValue(Infinity), { instanceOf: RangeError })
  t.regex(error.message, /finite numbers/)
})

test('rejects negative Infinity', t => {
  const error = t.throws(() => parseOrdinalValue(-Infinity), { instanceOf: RangeError })
  t.regex(error.message, /finite numbers/)
})

// ============================================================================
// Invalid String Values
// ============================================================================

test('rejects empty string', t => {
  const error = t.throws(() => parseOrdinalValue(''), { instanceOf: RangeError })
  t.regex(error.message, /empty strings/)
})

test('rejects whitespace-only string', t => {
  const error = t.throws(() => parseOrdinalValue('   '), { instanceOf: RangeError })
  t.regex(error.message, /empty strings/)
})

test('rejects non-numeric string', t => {
  const error = t.throws(() => parseOrdinalValue('abc'), { instanceOf: RangeError })
  t.regex(error.message, /Invalid ordinal format/)
})

test('rejects string with letters mixed in', t => {
  const error = t.throws(() => parseOrdinalValue('12abc34'), { instanceOf: RangeError })
  t.regex(error.message, /Invalid ordinal format/)
})

// ============================================================================
// Scientific Notation - Only valid if result is positive integer
// ============================================================================

test('accepts positive integer scientific notation string', t => {
  t.is(parseOrdinalValue('1e3'), 1000n)
})

test('accepts uppercase E notation', t => {
  t.is(parseOrdinalValue('1E3'), 1000n)
})

test('rejects scientific notation with decimal mantissa', t => {
  // '1.5e2' contains a decimal point, rejected before scientific notation handling
  const error = t.throws(() => parseOrdinalValue('1.5e2'), { instanceOf: RangeError })
  t.regex(error.message, /whole numbers/)
})

test('rejects scientific notation resulting in decimal', t => {
  const error = t.throws(() => parseOrdinalValue('1e-3'), { instanceOf: RangeError })
  t.regex(error.message, /positive integers/)
})

test('rejects zero in scientific notation', t => {
  const error = t.throws(() => parseOrdinalValue('0e5'), { instanceOf: RangeError })
  t.regex(error.message, /positive integers/)
})

test('rejects negative scientific notation', t => {
  const error = t.throws(() => parseOrdinalValue('-1e3'), { instanceOf: RangeError })
  t.regex(error.message, /cannot be negative/)
})

// ============================================================================
// Large Number Handling
// ============================================================================

test('handles MAX_SAFE_INTEGER', t => {
  t.is(parseOrdinalValue(Number.MAX_SAFE_INTEGER), BigInt(Number.MAX_SAFE_INTEGER))
})

test('handles large bigint', t => {
  const large = 123456789012345678901234567890n
  t.is(parseOrdinalValue(large), large)
})

test('handles large string', t => {
  const largeStr = '123456789012345678901234567890'
  t.is(parseOrdinalValue(largeStr), 123456789012345678901234567890n)
})

// ============================================================================
// Hex, Binary, Octal Strings - Should work if result is positive integer
// ============================================================================

test('accepts hex string (BigInt parses 0x prefix)', t => {
  // BigInt() can parse hex strings directly: 0xFF = 255
  t.is(parseOrdinalValue('0xFF'), 255n)
  t.is(parseOrdinalValue('0xff'), 255n)
})

test('accepts binary string (BigInt parses 0b prefix)', t => {
  // BigInt() can parse binary strings directly: 0b101 = 5
  t.is(parseOrdinalValue('0b101'), 5n)
})

test('accepts octal string (BigInt parses 0o prefix)', t => {
  // BigInt() can parse octal strings directly: 0o777 = 511
  t.is(parseOrdinalValue('0o777'), 511n)
})

// ============================================================================
// Return Type Verification
// ============================================================================

test('returns bigint, not object', t => {
  const result = parseOrdinalValue(42)
  t.is(typeof result, 'bigint')
  t.is(result, 42n)
})

test('returns exact bigint value, not wrapped', t => {
  const result = parseOrdinalValue(1)
  t.true(result === 1n)
  t.false(typeof result === 'object')
})

// ============================================================================
// Edge Cases
// ============================================================================

test('handles very large positive integer', t => {
  const huge = 10n ** 100n
  t.is(parseOrdinalValue(huge), huge)
})

test('handles string representation of very large number', t => {
  const hugeStr = '1' + '0'.repeat(100)
  t.is(parseOrdinalValue(hugeStr), 10n ** 100n)
})

test('rejects number just below 1', t => {
  t.throws(() => parseOrdinalValue(0.999999), { instanceOf: RangeError })
})

test('rejects negative number close to zero', t => {
  t.throws(() => parseOrdinalValue(-0.001), { instanceOf: RangeError })
})

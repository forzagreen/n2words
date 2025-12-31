import test from 'ava'
import * as n2words from '../../lib/n2words.js'

/**
 * Unit Tests for n2words.js (Public API)
 *
 * Tests the public API layer including:
 * 1. Converter exports (all languages properly exported as functions)
 * 2. Input validation (early rejection of invalid inputs at API boundary)
 * 3. Options support (gender, formal, custom separators, etc.)
 * 4. Basic conversion functionality across all languages
 */

// ============================================================================
// Expected Converters (dynamically loaded from n2words entry point)
// ============================================================================

// Dynamically get all converters from the n2words entry point
// This ensures the test stays in sync with the actual exports
const expectedConverters = Object.keys(n2words)
  .filter(name => name.endsWith('Converter'))
  .sort()

// ============================================================================
// Converter Export Tests
// ============================================================================

test('all expected language converters are exported as functions', t => {
  const actualExports = Object.keys(n2words).sort()

  // Verify exact match
  t.deepEqual(actualExports, expectedConverters, 'All expected converters should be exported')

  // Verify each is a function
  for (const converterName of expectedConverters) {
    t.is(typeof n2words[converterName], 'function', `${converterName} should be a function`)
  }
})

// ============================================================================
// Basic Functionality Tests (using English as reference)
// ============================================================================

test('EnglishConverter converts basic numbers correctly', t => {
  const { EnglishConverter } = n2words
  t.is(EnglishConverter(0), 'zero')
  t.is(EnglishConverter(1), 'one')
  t.is(EnglishConverter(10), 'ten')
  t.is(EnglishConverter(21), 'twenty-one')
  t.is(EnglishConverter(100), 'one hundred')
  t.is(EnglishConverter(101), 'one hundred and one')
  t.is(EnglishConverter(1000), 'one thousand')
})

test('EnglishConverter handles negative numbers', t => {
  const { EnglishConverter } = n2words
  t.is(EnglishConverter(-1), 'minus one')
  t.is(EnglishConverter(-42), 'minus forty-two')
  t.is(EnglishConverter(-100), 'minus one hundred')
})

test('EnglishConverter handles decimal numbers', t => {
  const { EnglishConverter } = n2words
  t.is(EnglishConverter(1.5), 'one point five')
  t.is(EnglishConverter(3.14), 'three point fourteen')
  t.is(EnglishConverter(0.5), 'zero point five')
})

test('EnglishConverter handles BigInt values', t => {
  const { EnglishConverter } = n2words
  t.is(EnglishConverter(1000000n), 'one million')
  t.is(EnglishConverter(1000000000n), 'one billion')
  t.is(EnglishConverter(1000000000000n), 'one trillion')
})

test('EnglishConverter handles string input', t => {
  const { EnglishConverter } = n2words
  t.is(EnglishConverter('42'), 'forty-two')
  t.is(EnglishConverter('100'), 'one hundred')
  t.is(EnglishConverter('1000'), 'one thousand')
})

test('converters accept options parameter', t => {
  const { EnglishConverter, ArabicConverter } = n2words
  // Options should be accepted without throwing
  t.notThrows(() => EnglishConverter(42, {}))
  t.notThrows(() => EnglishConverter(42, { someOption: true }))
  t.notThrows(() => ArabicConverter(42, { gender: 'feminine' }))
})

test('options affect converter output', t => {
  // Test that options DO change output (without asserting specific option names)
  const { ArabicConverter } = n2words
  const withoutOptions = ArabicConverter(1)
  const withOptions = ArabicConverter(1, { gender: 'feminine' })

  // Options should affect the output
  t.is(typeof withoutOptions, 'string')
  t.is(typeof withOptions, 'string')
  t.not(withoutOptions, withOptions, 'Options should affect output')
})

// ============================================================================
// Cross-Language Smoke Tests
// ============================================================================

test('each converter can convert zero', t => {
  for (const converterName of expectedConverters) {
    const converter = n2words[converterName]
    const result = converter(0)

    t.is(
      typeof result,
      'string',
      `${converterName}(0) should return a string`
    )
    t.true(
      result.length > 0,
      `${converterName}(0) should return a non-empty string`
    )
  }
})

test('each converter can convert one', t => {
  for (const converterName of expectedConverters) {
    const converter = n2words[converterName]
    const result = converter(1)

    t.is(
      typeof result,
      'string',
      `${converterName}(1) should return a string`
    )
    t.true(
      result.length > 0,
      `${converterName}(1) should return a non-empty string`
    )
  }
})

test('each converter can convert ten', t => {
  for (const converterName of expectedConverters) {
    const converter = n2words[converterName]
    const result = converter(10)

    t.is(
      typeof result,
      'string',
      `${converterName}(10) should return a string`
    )
    t.true(
      result.length > 0,
      `${converterName}(10) should return a non-empty string`
    )
  }
})

test('each converter can convert one hundred', t => {
  for (const converterName of expectedConverters) {
    const converter = n2words[converterName]
    const result = converter(100)

    t.is(
      typeof result,
      'string',
      `${converterName}(100) should return a string`
    )
    t.true(
      result.length > 0,
      `${converterName}(100) should return a non-empty string`
    )
  }
})

test('each converter can convert one thousand', t => {
  for (const converterName of expectedConverters) {
    const converter = n2words[converterName]
    const result = converter(1000)

    t.is(
      typeof result,
      'string',
      `${converterName}(1000) should return a string`
    )
    t.true(
      result.length > 0,
      `${converterName}(1000) should return a non-empty string`
    )
  }
})

test('converters return different results for different inputs', t => {
  const { EnglishConverter } = n2words

  const zero = EnglishConverter(0)
  const one = EnglishConverter(1)
  const ten = EnglishConverter(10)
  const hundred = EnglishConverter(100)

  // All should be different from each other
  t.not(zero, one)
  t.not(zero, ten)
  t.not(zero, hundred)
  t.not(one, ten)
  t.not(one, hundred)
  t.not(ten, hundred)
})

test('converters are consistent across multiple calls', t => {
  const { EnglishConverter } = n2words

  const result1 = EnglishConverter(42)
  const result2 = EnglishConverter(42)
  const result3 = EnglishConverter(42)

  t.is(result1, result2)
  t.is(result2, result3)
  t.is(result1, 'forty-two')
})

test('converters handle large numbers', t => {
  const { EnglishConverter } = n2words

  const million = EnglishConverter(1000000)
  const billion = EnglishConverter(1000000000)

  t.is(typeof million, 'string')
  t.is(typeof billion, 'string')
  t.true(million.length > 0)
  t.true(billion.length > 0)
  t.not(million, billion)
})

// ============================================================================
// Options Inheritance Tests
// ============================================================================
//
// These tests verify that the public API correctly passes options to language
// classes and that options are properly inherited through base classes.
//
// Specific option behaviors are tested in integration tests with fixtures.
// ============================================================================

test('options are passed to language classes', t => {
  // Test that options object is successfully passed through the converter
  const { SimplifiedChineseConverter } = n2words

  // Should not throw when passing options
  t.notThrows(() => SimplifiedChineseConverter(1, { formal: true }))
  t.notThrows(() => SimplifiedChineseConverter(1, { formal: false }))

  // Options should affect output
  const formal = SimplifiedChineseConverter(1, { formal: true })
  const common = SimplifiedChineseConverter(1, { formal: false })
  t.not(formal, common, 'Options should affect converter output')
})

test('options work across different base classes', t => {
  // Test GreedyScaleLanguage (Spanish)
  const { SpanishConverter } = n2words
  const spanishDefault = SpanishConverter(1)
  const spanishWithOption = SpanishConverter(1, { gender: 'feminine' })
  t.is(typeof spanishDefault, 'string')
  t.is(typeof spanishWithOption, 'string')

  // Test SlavicLanguage (Russian)
  const { RussianConverter } = n2words
  const russianDefault = RussianConverter(1)
  const russianWithOption = RussianConverter(1, { gender: 'feminine' })
  t.is(typeof russianDefault, 'string')
  t.is(typeof russianWithOption, 'string')

  // Test TurkicLanguage (Turkish)
  const { TurkishConverter } = n2words
  const turkishDefault = TurkishConverter(23)
  const turkishWithOption = TurkishConverter(23, { dropSpaces: true })
  t.is(typeof turkishDefault, 'string')
  t.is(typeof turkishWithOption, 'string')
  t.not(turkishDefault, turkishWithOption, 'Options should change output across base classes')
})

// ============================================================================
// Public API Input Validation Tests
// ============================================================================
//
// Validation happens at the API boundary (n2words.js makeConverter function).
// These tests verify that invalid inputs are rejected early with clear errors.
// ============================================================================

// Invalid number types (NaN, Infinity)

test('rejects NaN', t => {
  const { EnglishConverter } = n2words
  const error = t.throws(() => EnglishConverter(NaN), { instanceOf: Error })
  t.is(error.message, 'Number must be finite (NaN and Infinity are not supported)')
})

test('rejects Infinity', t => {
  const { EnglishConverter } = n2words
  const error = t.throws(() => EnglishConverter(Infinity), { instanceOf: Error })
  t.is(error.message, 'Number must be finite (NaN and Infinity are not supported)')
})

test('rejects negative Infinity', t => {
  const { EnglishConverter } = n2words
  const error = t.throws(() => EnglishConverter(-Infinity), { instanceOf: Error })
  t.is(error.message, 'Number must be finite (NaN and Infinity are not supported)')
})

// Invalid string formats

test('rejects empty string', t => {
  const { EnglishConverter } = n2words
  const error = t.throws(() => EnglishConverter(''), { instanceOf: Error })
  t.is(error.message, 'Invalid number format: ""')
})

test('rejects whitespace-only string', t => {
  const { EnglishConverter } = n2words
  const error = t.throws(() => EnglishConverter('   '), { instanceOf: Error })
  t.is(error.message, 'Invalid number format: "   "')
})

test('rejects non-numeric string', t => {
  const { EnglishConverter } = n2words
  const error = t.throws(() => EnglishConverter('abc'), { instanceOf: Error })
  t.is(error.message, 'Invalid number format: "abc"')
})

// Invalid types

test('rejects null', t => {
  const { EnglishConverter } = n2words
  const error = t.throws(() => EnglishConverter(null), { instanceOf: TypeError })
  t.is(error.message, 'Invalid value type: expected number, string, or bigint, received object')
})

test('rejects undefined', t => {
  const { EnglishConverter } = n2words
  const error = t.throws(() => EnglishConverter(undefined), { instanceOf: TypeError })
  t.is(error.message, 'Invalid value type: expected number, string, or bigint, received undefined')
})

test('rejects object', t => {
  const { EnglishConverter } = n2words
  const error = t.throws(() => EnglishConverter({}), { instanceOf: TypeError })
  t.is(error.message, 'Invalid value type: expected number, string, or bigint, received object')
})

test('rejects array', t => {
  const { EnglishConverter } = n2words
  const error = t.throws(() => EnglishConverter([42]), { instanceOf: TypeError })
  t.is(error.message, 'Invalid value type: expected number, string, or bigint, received object')
})

test('rejects symbol', t => {
  const { EnglishConverter } = n2words
  const error = t.throws(() => EnglishConverter(Symbol('test')), { instanceOf: TypeError })
  t.is(error.message, 'Invalid value type: expected number, string, or bigint, received symbol')
})

test('rejects function', t => {
  const { EnglishConverter } = n2words
  const error = t.throws(() => EnglishConverter(() => 42), { instanceOf: TypeError })
  t.is(error.message, 'Invalid value type: expected number, string, or bigint, received function')
})

// Valid inputs (acceptance tests)

test('accepts valid number', t => {
  const { EnglishConverter } = n2words
  t.is(EnglishConverter(42), 'forty-two')
})

test('accepts valid string', t => {
  const { EnglishConverter } = n2words
  t.is(EnglishConverter('42'), 'forty-two')
})

test('accepts string with whitespace', t => {
  const { EnglishConverter } = n2words
  t.is(EnglishConverter('  42  '), 'forty-two')
})

test('accepts bigint', t => {
  const { EnglishConverter } = n2words
  t.is(EnglishConverter(42n), 'forty-two')
})

test('accepts large bigint', t => {
  const { EnglishConverter } = n2words
  const result = EnglishConverter(123456789012345678901234567890n)
  t.truthy(result)
  t.is(typeof result, 'string')
})

// ============================================================================
// Edge Case Tests
// ============================================================================

test('handles very small decimals', t => {
  const { EnglishConverter } = n2words
  t.is(EnglishConverter(0.000001), 'zero point zero zero zero zero zero one')
})

test('handles numbers with many decimal places', t => {
  const { EnglishConverter } = n2words
  const result = EnglishConverter(3.141592653589793)
  t.is(typeof result, 'string')
  t.true(result.startsWith('three point'))
})

test('handles negative zero', t => {
  const { EnglishConverter } = n2words
  // -0 should be treated as 0
  t.is(EnglishConverter(-0), 'zero')
})

test('handles string with leading zeros', t => {
  const { EnglishConverter } = n2words
  t.is(EnglishConverter('00042'), 'forty-two')
  t.is(EnglishConverter('0100'), 'one hundred')
})

test('handles string with decimal but no fractional part', t => {
  const { EnglishConverter } = n2words
  // Note: '42.0' is treated as having a decimal part (point zero)
  t.is(EnglishConverter('42.0'), 'forty-two point zero')
  t.is(EnglishConverter('42.00'), 'forty-two point zero zero')
})

test('handles trailing decimal point', t => {
  const { EnglishConverter } = n2words
  // Trailing decimal without digits is treated as whole number
  t.is(EnglishConverter('42.'), 'forty-two')
})

test('handles Maximum safe integer boundary', t => {
  const { EnglishConverter } = n2words
  const maxSafe = Number.MAX_SAFE_INTEGER // 2^53 - 1
  const result = EnglishConverter(maxSafe)
  t.is(typeof result, 'string')
  t.true(result.length > 0)
})

test('handles numbers beyond MAX_SAFE_INTEGER using BigInt', t => {
  const { EnglishConverter } = n2words
  const beyondSafe = BigInt(Number.MAX_SAFE_INTEGER) + 1n
  const result = EnglishConverter(beyondSafe)
  t.is(typeof result, 'string')
  t.true(result.length > 0)
})

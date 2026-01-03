import test from 'ava'
import { readFileSync } from 'node:fs'
import * as n2words from '../../lib/n2words.js'

/**
 * Unit Tests for n2words.js (Public API)
 *
 * Tests the public API layer including:
 * 1. Converter exports (all languages properly exported as functions)
 * 2. Options support (gender, formal, custom separators, etc.)
 * 3. Basic conversion functionality via converters
 * 4. Module structure (alphabetical ordering of imports/exports)
 *
 * Note: Input parsing and validation is tested in utils/parse-numeric.test.js
 */

const n2wordsContent = readFileSync('./lib/n2words.js', 'utf8')

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

test('each converter handles basic values (0, 1, 10, 100, 1000)', t => {
  const testValues = [0, 1, 10, 100, 1000]
  for (const converterName of expectedConverters) {
    const converter = n2words[converterName]
    for (const value of testValues) {
      const result = converter(value)
      t.is(typeof result, 'string', `${converterName}(${value}) should return a string`)
      t.true(result.length > 0, `${converterName}(${value}) should return a non-empty string`)
    }
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

test('converters handle scientific notation from Number.toString()', t => {
  const { EnglishConverter } = n2words

  // Numbers >= 1e21 trigger scientific notation in Number.toString()
  t.is(EnglishConverter(1e21), 'one sextillion')
  t.is(EnglishConverter(1e22), 'ten sextillion')

  // Numbers < 1e-6 also trigger scientific notation
  t.is(EnglishConverter(1e-7), 'zero point zero zero zero zero zero zero one')
  t.is(EnglishConverter(1.5e-7), 'zero point zero zero zero zero zero zero fifteen')

  // Edge cases at boundaries
  t.is(EnglishConverter(1e20), 'one hundred quintillion') // Just below scientific notation
  t.is(EnglishConverter(1e-6), 'zero point zero zero zero zero zero one') // At the boundary
})

test('converters handle scientific notation in string input', t => {
  const { EnglishConverter } = n2words

  // String input with scientific notation
  t.is(EnglishConverter('1e21'), 'one sextillion')
  t.is(EnglishConverter('1E21'), 'one sextillion') // Uppercase E
  t.is(EnglishConverter('-1e21'), 'minus one sextillion')
  t.is(EnglishConverter('1.5e3'), 'one thousand five hundred')
  t.is(EnglishConverter('1e-3'), 'zero point zero zero one')
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
// Module Structure Tests
// ============================================================================

test('imports are alphabetically ordered', t => {
  const importSection = n2wordsContent.match(/\/\/ Language Imports[\s\S]*?(?=\/\/ ===)/)?.[0]
  if (!importSection) {
    t.pass('No import section marker found')
    return
  }

  const imports = [...importSection.matchAll(/import\s+{\s*(\w+)\s*}/g)].map(m => m[1])
  const sorted = [...imports].sort((a, b) => a.localeCompare(b))
  t.deepEqual(imports, sorted, 'Language imports should be alphabetically ordered')
})

test('exports are alphabetically ordered', t => {
  const exportSection = n2wordsContent.match(/export\s*{([\s\S]*?)}/)?.[1]
  if (!exportSection) {
    t.fail('No export section found')
    return
  }

  const exports = exportSection
    .split(',')
    .map(e => e.trim())
    .filter(e => e.length > 0)

  const sorted = [...exports].sort((a, b) => a.localeCompare(b))
  t.deepEqual(exports, sorted, 'Exports should be alphabetically ordered')
})

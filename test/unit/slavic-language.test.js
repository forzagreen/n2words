import test from 'ava'
import { SlavicLanguage } from '../../lib/classes/slavic-language.js'

/**
 * Unit Tests for SlavicLanguage
 *
 * Tests Slavic language patterns including:
 * - Three-form pluralization (singular/few/many)
 * - Gender-aware number forms
 * - Chunk-based decomposition
 * - Hundreds, tens, ones patterns
 * - Constructor options (gender option)
 */

// ============================================================================
// Test Implementation
// ============================================================================

// Concrete test implementation
class TestSlavicLanguage extends SlavicLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'

  onesWords = {
    1: 'one-m',
    2: 'two-m',
    3: 'three-m',
    4: 'four-m',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine'
  }

  onesFeminineWords = {
    1: 'one-f',
    2: 'two-f',
    3: 'three-f',
    4: 'four-f',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine'
  }

  teensWords = {
    0: 'ten',
    1: 'eleven',
    2: 'twelve',
    3: 'thirteen',
    4: 'fourteen',
    5: 'fifteen',
    6: 'sixteen',
    7: 'seventeen',
    8: 'eighteen',
    9: 'nineteen'
  }

  twentiesWords = {
    2: 'twenty',
    3: 'thirty',
    4: 'forty',
    5: 'fifty',
    6: 'sixty',
    7: 'seventy',
    8: 'eighty',
    9: 'ninety'
  }

  hundredsWords = {
    1: 'one-hundred',
    2: 'two-hundred',
    3: 'three-hundred',
    4: 'four-hundred',
    5: 'five-hundred',
    6: 'six-hundred',
    7: 'seven-hundred',
    8: 'eight-hundred',
    9: 'nine-hundred'
  }

  pluralForms = {
    1: ['thousand-sing', 'thousand-few', 'thousand-many'],
    2: ['million-sing', 'million-few', 'million-many'],
    3: ['billion-sing', 'billion-few', 'billion-many']
  }

  // Simulate Russian-style feminine thousands for testing
  scaleGenders = {
    1: true // thousands are feminine
  }
}

// ============================================================================
// Basic Conversion Tests
// ============================================================================

test('integerToWords returns zero word for 0', t => {
  const lang = new TestSlavicLanguage()
  t.is(lang.integerToWords(0n), 'zero')
})

test('integerToWords handles single digits with masculine forms', t => {
  const lang = new TestSlavicLanguage({ gender: 'masculine' })
  t.is(lang.integerToWords(1n), 'one-m')
  t.is(lang.integerToWords(2n), 'two-m')
  t.is(lang.integerToWords(5n), 'five')
})

test('integerToWords handles single digits with feminine option', t => {
  const lang = new TestSlavicLanguage({ gender: 'feminine' })
  t.is(lang.integerToWords(1n), 'one-f')
  t.is(lang.integerToWords(2n), 'two-f')
  t.is(lang.integerToWords(5n), 'five')
})

test('integerToWords handles teens (10-19)', t => {
  const lang = new TestSlavicLanguage()
  t.is(lang.integerToWords(10n), 'ten')
  t.is(lang.integerToWords(11n), 'eleven')
  t.is(lang.integerToWords(15n), 'fifteen')
  t.is(lang.integerToWords(19n), 'nineteen')
})

test('integerToWords handles twenties', t => {
  const lang = new TestSlavicLanguage()
  t.is(lang.integerToWords(20n), 'twenty')
  t.is(lang.integerToWords(21n), 'twenty one-m')
  t.is(lang.integerToWords(25n), 'twenty five')
  t.is(lang.integerToWords(99n), 'ninety nine')
})

test('integerToWords handles hundreds', t => {
  const lang = new TestSlavicLanguage()
  t.is(lang.integerToWords(100n), 'one-hundred')
  t.is(lang.integerToWords(200n), 'two-hundred')
  t.is(lang.integerToWords(500n), 'five-hundred')
})

test('integerToWords handles hundreds with remainder', t => {
  const lang = new TestSlavicLanguage()
  t.is(lang.integerToWords(123n), 'one-hundred twenty three-m')
  t.is(lang.integerToWords(456n), 'four-hundred fifty six')
})

// ============================================================================
// Gender Tests
// ============================================================================

test('integerToWords uses feminine forms for thousands segment', t => {
  const lang = new TestSlavicLanguage({ gender: 'masculine' })
  // 1001 = 1 thousand + 1 ones
  // Thousands segment (1) should use feminine form
  const result = lang.integerToWords(1001n)
  t.true(result.includes('one-f')) // Feminine for thousand segment
  t.true(result.includes('thousand'))
})

test('uses ones array when segmentIndex is 0 and gender is masculine', t => {
  const lang = new TestSlavicLanguage({ gender: 'masculine' })
  // 1 (segmentIndex 0) should use masculine form
  t.is(lang.integerToWords(1n), 'one-m')
  t.is(lang.integerToWords(2n), 'two-m')
})

test('uses onesFeminine when segmentIndex is 0 and gender is feminine', t => {
  const lang = new TestSlavicLanguage({ gender: 'feminine' })
  // 1 (segmentIndex 0) should use feminine form
  t.is(lang.integerToWords(1n), 'one-f')
  t.is(lang.integerToWords(2n), 'two-f')
})

test('thousands segment always uses feminine forms regardless of gender option', t => {
  const langMasc = new TestSlavicLanguage({ gender: 'masculine' })
  const langFem = new TestSlavicLanguage({ gender: 'feminine' })

  // 1001 has segmentIndex 1 for thousands, should use feminine
  const resultMasc = langMasc.integerToWords(1001n)
  const resultFem = langFem.integerToWords(1001n)

  t.true(resultMasc.includes('one-f'), 'Thousands segment should use feminine in masculine mode')
  t.true(resultFem.includes('one-f'), 'Thousands segment should use feminine in feminine mode')
})

// ============================================================================
// Segmentation Tests
// ============================================================================

test('splitToSegments handles numbers less than segment size', t => {
  const lang = new TestSlavicLanguage()
  t.deepEqual(lang.splitToSegments('123', 3), [123n])
  t.deepEqual(lang.splitToSegments('1', 3), [1n])
})

test('splitToSegments handles exact segment multiples', t => {
  const lang = new TestSlavicLanguage()
  t.deepEqual(lang.splitToSegments('123456', 3), [123n, 456n])
})

test('splitToSegments handles numbers with remainder', t => {
  const lang = new TestSlavicLanguage()
  t.deepEqual(lang.splitToSegments('1234567', 3), [1n, 234n, 567n])
  t.deepEqual(lang.splitToSegments('12345678', 3), [12n, 345n, 678n])
})

test('extractDigits extracts ones, tens, hundreds correctly', t => {
  const lang = new TestSlavicLanguage()
  t.deepEqual(lang.extractDigits(0n), [0n, 0n, 0n])
  t.deepEqual(lang.extractDigits(5n), [5n, 0n, 0n])
  t.deepEqual(lang.extractDigits(23n), [3n, 2n, 0n])
  t.deepEqual(lang.extractDigits(456n), [6n, 5n, 4n])
  t.deepEqual(lang.extractDigits(999n), [9n, 9n, 9n])
})

// ============================================================================
// Pluralization Tests
// ============================================================================

test('pluralize returns singular form for 1, 21, 31, etc.', t => {
  const lang = new TestSlavicLanguage()
  const forms = ['sing', 'few', 'many']

  t.is(lang.pluralize(1n, forms), 'sing')
  t.is(lang.pluralize(21n, forms), 'sing')
  t.is(lang.pluralize(31n, forms), 'sing')
  t.is(lang.pluralize(101n, forms), 'sing')
})

test('pluralize returns few form for 2-4, 22-24, etc.', t => {
  const lang = new TestSlavicLanguage()
  const forms = ['sing', 'few', 'many']

  t.is(lang.pluralize(2n, forms), 'few')
  t.is(lang.pluralize(3n, forms), 'few')
  t.is(lang.pluralize(4n, forms), 'few')
  t.is(lang.pluralize(22n, forms), 'few')
  t.is(lang.pluralize(23n, forms), 'few')
  t.is(lang.pluralize(24n, forms), 'few')
  t.is(lang.pluralize(104n, forms), 'few')
})

test('pluralize returns many form for 0, 5-20, 25-30, etc.', t => {
  const lang = new TestSlavicLanguage()
  const forms = ['sing', 'few', 'many']

  t.is(lang.pluralize(0n, forms), 'many')
  t.is(lang.pluralize(5n, forms), 'many')
  t.is(lang.pluralize(10n, forms), 'many')
  t.is(lang.pluralize(11n, forms), 'many') // Special case: 11-19
  t.is(lang.pluralize(15n, forms), 'many')
  t.is(lang.pluralize(20n, forms), 'many')
  t.is(lang.pluralize(25n, forms), 'many')
  t.is(lang.pluralize(100n, forms), 'many')
})

test('pluralize handles 11-19 as special case (always many)', t => {
  const lang = new TestSlavicLanguage()
  const forms = ['sing', 'few', 'many']

  for (let i = 11; i <= 19; i++) {
    t.is(lang.pluralize(BigInt(i), forms), 'many', `${i} should use many form`)
  }

  // Also test 111-119
  for (let i = 111; i <= 119; i++) {
    t.is(lang.pluralize(BigInt(i), forms), 'many', `${i} should use many form`)
  }
})

test('handles thousands with correct pluralization', t => {
  const lang = new TestSlavicLanguage()

  // 1000 should use singular form
  const result1 = lang.integerToWords(1000n)
  t.true(result1.includes('thousand-sing'))

  // 2000 should use few form
  const result2 = lang.integerToWords(2000n)
  t.true(result2.includes('thousand-few'))

  // 5000 should use many form
  const result5 = lang.integerToWords(5000n)
  t.true(result5.includes('thousand-many'))
})

// ============================================================================
// Large Number Tests
// ============================================================================

test('handles millions with correct pluralization', t => {
  const lang = new TestSlavicLanguage()

  // 1,000,000
  const result1 = lang.integerToWords(1000000n)
  t.true(result1.includes('million-sing'))

  // 2,000,000
  const result2 = lang.integerToWords(2000000n)
  t.true(result2.includes('million-few'))

  // 5,000,000
  const result5 = lang.integerToWords(5000000n)
  t.true(result5.includes('million-many'))
})

test('skips zero segments', t => {
  const lang = new TestSlavicLanguage()
  // 1,000,001 should skip the middle zero segment
  const result = lang.integerToWords(1000001n)
  t.false(result.includes('zero'))
  t.true(result.includes('million'))
  t.true(result.includes('one'))
})

test('handles complex numbers with all components', t => {
  const lang = new TestSlavicLanguage()
  // 1,234,567 = 1 million, 234 thousand, 567
  const result = lang.integerToWords(1234567n)
  t.true(result.includes('million'))
  t.true(result.includes('thousand'))
})

test('handles very large numbers', t => {
  const lang = new TestSlavicLanguage()
  // 1 billion
  const result = lang.integerToWords(1000000000n)
  t.true(result.includes('billion'))
})

// ============================================================================
// Integration Tests
// ============================================================================

test('integrates with AbstractLanguage for negative numbers', t => {
  const lang = new TestSlavicLanguage()
  const result = lang.toWords(true, 42n)
  t.true(result.startsWith('minus'))
})

test('integrates with AbstractLanguage for decimals', t => {
  const lang = new TestSlavicLanguage()
  const result = lang.toWords(false, 3n, '14')
  t.true(result.includes('point'))
})

// ============================================================================
// Constructor and Options Tests
// ============================================================================

test('constructor defaults to masculine gender', t => {
  const lang = new TestSlavicLanguage()
  t.is(lang.options.gender, 'masculine')
})

test('constructor accepts gender option', t => {
  const langMasc = new TestSlavicLanguage({ gender: 'masculine' })
  t.is(langMasc.options.gender, 'masculine')

  const langFem = new TestSlavicLanguage({ gender: 'feminine' })
  t.is(langFem.options.gender, 'feminine')
})

test('constructor merges default and user options', t => {
  const lang = new TestSlavicLanguage({ gender: 'feminine', customOption: true })
  t.is(lang.options.gender, 'feminine')
  t.is(lang.options.customOption, true)
})

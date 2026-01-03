import test from 'ava'
import { AbstractLanguage } from '../../../lib/classes/abstract-language.js'

/**
 * Unit Tests for AbstractLanguage
 *
 * Tests the base class framework that all language converters extend.
 * AbstractLanguage handles:
 * - Negative number prefixing
 * - Decimal conversion (grouped and per-digit modes)
 * - Options management
 * - Word assembly with configurable separators
 *
 * Note: Input parsing/validation is tested in utils/parse-numeric.test.js.
 * These tests focus on toWords() which receives pre-normalized input.
 */

// ============================================================================
// Test Fixtures
// ============================================================================

/**
 * Basic test implementation with grouped decimal mode (default).
 * Supports gender option to verify options flow through correctly.
 */
class TestLanguage extends AbstractLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'
  wordSeparator = ' '

  constructor (options = {}) {
    super()
    this.setOptions({ gender: 'masculine' }, options)
  }

  integerToWords (n) {
    if (n === 0n) return this.zeroWord
    if (this.options.gender === 'feminine') return `feminine-${n}`
    return `num-${n}`
  }
}

/**
 * Test implementation with per-digit decimal mode.
 * Used by Japanese, Thai, Greek, Hebrew, etc.
 */
class TestLanguagePerDigit extends AbstractLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'
  wordSeparator = ' '
  usePerDigitDecimals = true

  integerToWords (n) {
    if (n === 0n) return this.zeroWord
    return `num-${n}`
  }
}

/**
 * Test implementation with custom decimalIntegerToWords override.
 * Used by Romanian (masculine decimals regardless of gender option).
 */
class TestLanguageDecimalOverride extends AbstractLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'
  wordSeparator = ' '

  integerToWords (n) {
    if (n === 0n) return this.zeroWord
    return `whole-${n}`
  }

  decimalIntegerToWords (n) {
    if (n === 0n) return this.zeroWord
    return `decimal-${n}`
  }
}

/**
 * Test implementation with custom word separator.
 * Used for verifying separator customization (e.g., CJK languages use '').
 */
class TestLanguageCustomSeparator extends AbstractLanguage {
  negativeWord = 'MINUS'
  decimalSeparatorWord = 'DOT'
  zeroWord = 'ZERO'
  wordSeparator = '|'

  integerToWords (n) {
    if (n === 0n) return this.zeroWord
    return `NUM${n}`
  }
}

// ============================================================================
// Abstract Method Enforcement
// ============================================================================

test('integerToWords throws if not implemented', t => {
  const lang = new AbstractLanguage()
  const error = t.throws(() => lang.integerToWords(42n))
  t.is(error.message, 'integerToWords() must be implemented by subclass')
})

// ============================================================================
// Options System
// ============================================================================

test('setOptions merges defaults with user options', t => {
  const lang = new AbstractLanguage()
  lang.setOptions({ foo: 'default', bar: 1 }, { bar: 2, baz: 'new' })
  t.deepEqual(lang.options, { foo: 'default', bar: 2, baz: 'new' })
})

test('setOptions with empty defaults', t => {
  const lang = new AbstractLanguage()
  lang.setOptions({}, { option: 'value' })
  t.deepEqual(lang.options, { option: 'value' })
})

test('setOptions with empty user options', t => {
  const lang = new AbstractLanguage()
  lang.setOptions({ default: 'value' }, {})
  t.deepEqual(lang.options, { default: 'value' })
})

test('setOptions with no parameters', t => {
  const lang = new AbstractLanguage()
  lang.setOptions()
  t.deepEqual(lang.options, {})
})

test('setOptions with undefined parameters', t => {
  const lang = new AbstractLanguage()
  lang.setOptions(undefined, undefined)
  t.deepEqual(lang.options, {})
})

test('options getter provides read-only access', t => {
  const lang = new TestLanguage({ gender: 'feminine' })
  t.is(lang.options.gender, 'feminine')
})

test('constructor integrates setOptions correctly', t => {
  const lang = new TestLanguage({ gender: 'feminine' })
  t.is(lang.integerToWords(42n), 'feminine-42')

  const lang2 = new TestLanguage() // uses default
  t.is(lang2.integerToWords(42n), 'num-42')
})

// ============================================================================
// toWords() - Core Flow
// ============================================================================

test('toWords converts positive integers', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(false, 42n), 'num-42')
  t.is(lang.toWords(false, 1n), 'num-1')
  t.is(lang.toWords(false, 1000000n), 'num-1000000')
})

test('toWords converts zero', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(false, 0n), 'zero')
})

test('toWords prefixes negative numbers', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(true, 42n), 'minus num-42')
  t.is(lang.toWords(true, 1n), 'minus num-1')
})

test('toWords handles negative zero as positive', t => {
  // Note: The API normalizes -0 before calling toWords, so isNegative=false for zero
  const lang = new TestLanguage()
  t.is(lang.toWords(false, 0n), 'zero')
})

test('toWords handles very large BigInt values', t => {
  const lang = new TestLanguage()
  const huge = 123456789012345678901234567890n
  t.is(lang.toWords(false, huge), `num-${huge}`)
})

// ============================================================================
// Decimal Handling - Grouped Mode (default)
// ============================================================================

test('grouped mode: basic decimals', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(false, 3n, '14'), 'num-3 point num-14')
  t.is(lang.toWords(false, 42n, '7'), 'num-42 point num-7')
})

test('grouped mode: preserves leading zeros individually', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(false, 3n, '05'), 'num-3 point zero num-5')
  t.is(lang.toWords(false, 1n, '001'), 'num-1 point zero zero num-1')
  t.is(lang.toWords(false, 0n, '007'), 'zero point zero zero num-7')
})

test('grouped mode: all zeros in decimal', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(false, 1n, '000'), 'num-1 point zero zero zero')
})

test('grouped mode: negative decimals', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(true, 3n, '14'), 'minus num-3 point num-14')
  t.is(lang.toWords(true, 0n, '5'), 'minus zero point num-5')
})

test('grouped mode: decimal less than 1', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(false, 0n, '5'), 'zero point num-5')
  t.is(lang.toWords(false, 0n, '05'), 'zero point zero num-5')
})

// ============================================================================
// Decimal Handling - Per-Digit Mode
// ============================================================================

test('per-digit mode: each digit converted separately', t => {
  const lang = new TestLanguagePerDigit()
  t.is(lang.toWords(false, 3n, '14'), 'num-3 point num-1 num-4')
  t.is(lang.toWords(false, 1n, '234'), 'num-1 point num-2 num-3 num-4')
})

test('per-digit mode: leading zeros preserved', t => {
  const lang = new TestLanguagePerDigit()
  t.is(lang.toWords(false, 0n, '05'), 'zero point zero num-5')
  t.is(lang.toWords(false, 1n, '007'), 'num-1 point zero zero num-7')
})

test('per-digit mode: all zeros', t => {
  const lang = new TestLanguagePerDigit()
  t.is(lang.toWords(false, 1n, '000'), 'num-1 point zero zero zero')
})

test('per-digit mode: negative decimals', t => {
  const lang = new TestLanguagePerDigit()
  t.is(lang.toWords(true, 3n, '14'), 'minus num-3 point num-1 num-4')
})

// ============================================================================
// decimalDigitsToWords Helper
// ============================================================================

test('decimalDigitsToWords: grouped mode returns array', t => {
  const lang = new TestLanguage()
  t.deepEqual(lang.decimalDigitsToWords('14'), ['num-14'])
  t.deepEqual(lang.decimalDigitsToWords('05'), ['zero', 'num-5'])
  t.deepEqual(lang.decimalDigitsToWords('000'), ['zero', 'zero', 'zero'])
})

test('decimalDigitsToWords: per-digit mode returns array', t => {
  const lang = new TestLanguagePerDigit()
  t.deepEqual(lang.decimalDigitsToWords('14'), ['num-1', 'num-4'])
  t.deepEqual(lang.decimalDigitsToWords('05'), ['zero', 'num-5'])
})

// ============================================================================
// decimalIntegerToWords Hook
// ============================================================================

test('decimalIntegerToWords defaults to integerToWords', t => {
  const lang = new TestLanguage()
  t.is(lang.decimalIntegerToWords(42n), 'num-42')
  t.is(lang.decimalIntegerToWords(0n), 'zero')
})

test('decimalIntegerToWords override affects decimal conversion', t => {
  const lang = new TestLanguageDecimalOverride()
  // Integer uses integerToWords
  t.is(lang.integerToWords(42n), 'whole-42')
  // Decimal uses decimalIntegerToWords
  t.is(lang.decimalIntegerToWords(42n), 'decimal-42')
})

test('decimalIntegerToWords override integrates with grouped mode', t => {
  const lang = new TestLanguageDecimalOverride()
  t.is(lang.toWords(false, 3n, '14'), 'whole-3 point decimal-14')
  // Note: integerToWords(0n) returns zeroWord, not 'whole-0'
  t.is(lang.toWords(false, 0n, '05'), 'zero point zero decimal-5')
})

test('decimalIntegerToWords override integrates with per-digit mode', t => {
  class TestPerDigitWithOverride extends AbstractLanguage {
    negativeWord = 'minus'
    decimalSeparatorWord = 'point'
    zeroWord = 'zero'
    wordSeparator = ' '
    usePerDigitDecimals = true

    integerToWords (n) {
      return n === 0n ? this.zeroWord : `whole-${n}`
    }

    decimalIntegerToWords (n) {
      return n === 0n ? this.zeroWord : `d${n}`
    }
  }

  const lang = new TestPerDigitWithOverride()
  t.is(lang.toWords(false, 1n, '23'), 'whole-1 point d2 d3')
})

// ============================================================================
// wordSeparator Customization
// ============================================================================

test('custom wordSeparator used throughout output', t => {
  const lang = new TestLanguageCustomSeparator()
  t.is(lang.toWords(false, 42n), 'NUM42')
  t.is(lang.toWords(true, 42n), 'MINUS|NUM42')
  t.is(lang.toWords(false, 3n, '14'), 'NUM3|DOT|NUM14')
  t.is(lang.toWords(true, 3n, '14'), 'MINUS|NUM3|DOT|NUM14')
})

test('empty wordSeparator (CJK style)', t => {
  class TestNoSeparator extends AbstractLanguage {
    negativeWord = '负'
    decimalSeparatorWord = '点'
    zeroWord = '零'
    wordSeparator = ''

    integerToWords (n) {
      return n === 0n ? this.zeroWord : `数${n}`
    }
  }

  const lang = new TestNoSeparator()
  t.is(lang.toWords(false, 42n), '数42')
  t.is(lang.toWords(true, 42n), '负数42')
  t.is(lang.toWords(false, 3n, '14'), '数3点数14')
})

// ============================================================================
// Edge Cases
// ============================================================================

test('empty decimalPart is treated as no decimal', t => {
  const lang = new TestLanguage()
  // Empty string should be falsy, so no decimal processing
  t.is(lang.toWords(false, 42n, ''), 'num-42')
})

test('undefined decimalPart is treated as no decimal', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(false, 42n, undefined), 'num-42')
})

test('single digit decimal', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(false, 1n, '5'), 'num-1 point num-5')
})

test('long decimal preserves all digits', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(false, 1n, '123456789'), 'num-1 point num-123456789')
})

test('decimal with many leading zeros', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(false, 1n, '00001'), 'num-1 point zero zero zero zero num-1')
})

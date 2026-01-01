import test from 'ava'
import { AbstractLanguage } from '../../lib/classes/abstract-language.js'

/**
 * Unit Tests for AbstractLanguage
 *
 * Tests the base class functionality including:
 * - Sign handling (negative numbers)
 * - Decimal handling (grouped and per-digit modes)
 * - Constructor options validation
 * - Abstract method enforcement
 *
 * Note: Input validation and normalization are tested in n2words.test.js
 * since that logic now lives in the public API wrapper (makeConverter).
 * These tests focus on the toWords() method which receives pre-normalized input.
 */

// Concrete test implementation for testing abstract class
class TestLanguage extends AbstractLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'
  wordSeparator = ' '

  constructor (options = {}) {
    super()
    this.setOptions({
      gender: 'masculine'
    }, options)
  }

  // Simple implementation: just return the number as string
  integerToWords (wholeNumber) {
    if (this.options.gender === 'feminine') return `feminine-number-${wholeNumber}`
    if (wholeNumber === 0n) return this.zeroWord
    return `number-${wholeNumber}`
  }
}

// Test implementation with per-digit decimal mode
class TestLanguagePerDigit extends AbstractLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'
  usePerDigitDecimals = true

  integerToWords (wholeNumber) {
    if (wholeNumber === 0n) return this.zeroWord
    return `number-${wholeNumber}`
  }
}

test('constructor accepts valid options object', t => {
  t.notThrows(() => new TestLanguage({}))
  t.notThrows(() => new TestLanguage({ someOption: true }))
})

test('abstract class throws error if integerToWords not implemented', t => {
  const lang = new AbstractLanguage()
  t.throws(() => lang.integerToWords(42n), {
    message: 'integerToWords() must be implemented by subclass'
  })
})

test('toWords handles positive whole numbers', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(false, 42n), 'number-42')
  t.is(lang.toWords(false, 0n), 'zero')
  t.is(lang.toWords(false, 100n), 'number-100')
  t.is(lang.toWords(false, 1000000n), 'number-1000000')
})

test('toWords handles negative numbers', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(true, 42n), 'minus number-42')
  t.is(lang.toWords(true, 1n), 'minus number-1')
  t.is(lang.toWords(true, 100n), 'minus number-100')
  t.is(lang.toWords(true, 1000n), 'minus number-1000')
})

test('toWords handles decimal numbers in grouped mode', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(false, 3n, '14'), 'number-3 point number-14')
  t.is(lang.toWords(false, 0n, '5'), 'zero point number-5')
  t.is(lang.toWords(false, 42n, '7'), 'number-42 point number-7')
})

test('toWords handles leading zeros in decimals (grouped mode)', t => {
  const lang = new TestLanguage()
  // Leading zeros preserved, remaining grouped
  t.is(lang.toWords(false, 3n, '05'), 'number-3 point zero number-5')
  t.is(lang.toWords(false, 1n, '001'), 'number-1 point zero zero number-1')
})

test('toWords handles negative decimals', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(true, 3n, '14'), 'minus number-3 point number-14')
  t.is(lang.toWords(true, 0n, '5'), 'minus zero point number-5')
})

test('per-digit decimal mode converts each digit separately', t => {
  const lang = new TestLanguagePerDigit()
  t.is(lang.toWords(false, 3n, '14'), 'number-3 point number-1 number-4')
  t.is(lang.toWords(false, 0n, '05'), 'zero point zero number-5')
  t.is(lang.toWords(false, 1n, '234'), 'number-1 point number-2 number-3 number-4')
})

test('decimalDigitsToWords in per-digit mode', t => {
  const lang = new TestLanguagePerDigit()
  const result = lang.decimalDigitsToWords('14')
  t.deepEqual(result, ['number-1', 'number-4'])
})

test('decimalDigitsToWords in grouped mode with leading zeros', t => {
  const lang = new TestLanguage()
  const result = lang.decimalDigitsToWords('05')
  t.deepEqual(result, ['zero', 'number-5'])
})

test('decimalDigitsToWords in grouped mode without leading zeros', t => {
  const lang = new TestLanguage()
  const result = lang.decimalDigitsToWords('14')
  t.deepEqual(result, ['number-14'])
})

test('decimalDigitsToWords handles all zeros', t => {
  const lang = new TestLanguage()
  const result = lang.decimalDigitsToWords('000')
  t.deepEqual(result, ['zero', 'zero', 'zero'])
})

test('wordSeparator is used correctly', t => {
  class TestLangCustomSeparator extends AbstractLanguage {
    negativeWord = 'MINUS'
    decimalSeparatorWord = 'DOT'
    zeroWord = 'ZERO'
    wordSeparator = '|'
    integerToWords (n) { return `NUM${n}` }
  }
  const lang = new TestLangCustomSeparator()
  t.is(lang.toWords(true, 3n, '14'), 'MINUS|NUM3|DOT|NUM14')
})

test('handles very large bigint values', t => {
  const lang = new TestLanguage()
  const huge = 123456789012345678901234567890n
  t.is(lang.toWords(false, huge), `number-${huge}`)
})

test('zero returns zeroWord', t => {
  const lang = new TestLanguage()
  t.is(lang.toWords(false, 0n), 'zero')
})

test('setOptions merges defaults with user options', t => {
  const lang = new AbstractLanguage()
  lang.setOptions({ foo: 'default', bar: 1 }, { bar: 2, baz: 'new' })

  t.deepEqual(lang.options, { foo: 'default', bar: 2, baz: 'new' })
})

test('setOptions handles empty defaults', t => {
  const lang = new AbstractLanguage()
  lang.setOptions({}, { option: 'value' })

  t.deepEqual(lang.options, { option: 'value' })
})

test('setOptions handles empty user options', t => {
  const lang = new AbstractLanguage()
  lang.setOptions({ default: 'value' }, {})

  t.deepEqual(lang.options, { default: 'value' })
})

test('constructor properly applies options via setOptions', t => {
  const lang = new TestLanguage({ gender: 'feminine' })
  t.is(lang.integerToWords(42n), 'feminine-number-42')

  const lang2 = new TestLanguage({ gender: 'masculine' })
  t.is(lang2.integerToWords(42n), 'number-42')
})

test('setOptions handles no parameters', t => {
  const lang = new AbstractLanguage()
  lang.setOptions()

  t.deepEqual(lang.options, {})
})

test('setOptions handles undefined parameters', t => {
  const lang = new AbstractLanguage()
  lang.setOptions(undefined, undefined)

  t.deepEqual(lang.options, {})
})

test('options getter returns read-only access to options', t => {
  const lang = new TestLanguage({ gender: 'feminine' })
  t.is(lang.options.gender, 'feminine')
})

// ============================================================================
// decimalIntegerToWords Tests
// ============================================================================

test('decimalIntegerToWords defaults to integerToWords', t => {
  const lang = new TestLanguage()
  // Without override, should delegate to integerToWords
  t.is(lang.decimalIntegerToWords(42n), 'number-42')
  t.is(lang.decimalIntegerToWords(0n), 'zero')
})

test('decimalIntegerToWords can be overridden for custom decimal behavior', t => {
  // Language that uses different forms for decimals
  class TestLangWithDecimalOverride extends AbstractLanguage {
    negativeWord = 'minus'
    decimalSeparatorWord = 'point'
    zeroWord = 'zero'

    integerToWords (n) {
      return `whole-${n}`
    }

    // Override: decimals use different format
    decimalIntegerToWords (n) {
      return `decimal-${n}`
    }
  }

  const lang = new TestLangWithDecimalOverride()
  t.is(lang.integerToWords(42n), 'whole-42')
  t.is(lang.decimalIntegerToWords(42n), 'decimal-42')
})

test('decimalDigitsToWords uses decimalIntegerToWords in grouped mode', t => {
  class TestLangWithDecimalOverride extends AbstractLanguage {
    negativeWord = 'minus'
    decimalSeparatorWord = 'point'
    zeroWord = 'zero'

    integerToWords (n) {
      return `whole-${n}`
    }

    decimalIntegerToWords (n) {
      return `decimal-${n}`
    }
  }

  const lang = new TestLangWithDecimalOverride()
  // Grouped mode should use decimalIntegerToWords
  t.deepEqual(lang.decimalDigitsToWords('14'), ['decimal-14'])
  t.deepEqual(lang.decimalDigitsToWords('05'), ['zero', 'decimal-5'])
})

test('full decimal conversion uses decimalIntegerToWords', t => {
  class TestLangWithDecimalOverride extends AbstractLanguage {
    negativeWord = 'minus'
    decimalSeparatorWord = 'point'
    zeroWord = 'zero'

    integerToWords (n) {
      return `whole-${n}`
    }

    decimalIntegerToWords (n) {
      return `decimal-${n}`
    }
  }

  const lang = new TestLangWithDecimalOverride()
  // Full conversion: whole uses integerToWords, decimal uses decimalIntegerToWords
  t.is(lang.toWords(false, 3n, '14'), 'whole-3 point decimal-14')
  t.is(lang.toWords(false, 0n, '5'), 'whole-0 point decimal-5')
})

test('decimalIntegerToWords with per-digit mode uses hook for each digit', t => {
  class TestLangPerDigitWithOverride extends AbstractLanguage {
    negativeWord = 'minus'
    decimalSeparatorWord = 'point'
    zeroWord = 'zero'
    usePerDigitDecimals = true

    integerToWords (n) {
      return `whole-${n}`
    }

    decimalIntegerToWords (n) {
      return `d${n}`
    }
  }

  const lang = new TestLangPerDigitWithOverride()
  // Per-digit mode uses convertDigitToWord which delegates to decimalIntegerToWords
  t.is(lang.toWords(false, 1n, '23'), 'whole-1 point d2 d3')
})

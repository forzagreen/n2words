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
 * These tests focus on the convert() method which receives pre-normalized input.
 */

// Concrete test implementation for testing abstract class
class TestLanguage extends AbstractLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'
  wordSeparator = ' '

  constructor (options = {}) {
    super()
    this.options = this.mergeOptions({
      gender: 'masculine'
    }, options)
  }

  // Simple implementation: just return the number as string
  convertWholePart (wholeNumber) {
    if (this.options.gender === 'feminine') return `feminine-number-${wholeNumber}`
    if (wholeNumber === 0n) return this.zeroWord
    return `number-${wholeNumber}`
  }
}

// Test implementation with custom digits array
class TestLanguageWithDigits extends AbstractLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'
  digits = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']

  convertWholePart (wholeNumber) {
    return `whole-${wholeNumber}`
  }
}

// Test implementation with per-digit decimal mode
class TestLanguagePerDigit extends AbstractLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'
  convertDecimalsPerDigit = true
  digits = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']

  convertWholePart (wholeNumber) {
    return `whole-${wholeNumber}`
  }
}

test('constructor accepts valid options object', t => {
  t.notThrows(() => new TestLanguage({}))
  t.notThrows(() => new TestLanguage({ someOption: true }))
})

test('abstract class throws error if convertWholePart not implemented', t => {
  const lang = new AbstractLanguage()
  t.throws(() => lang.convertWholePart(42n), {
    message: 'convertWholePart() must be implemented by subclass'
  })
})

test('convert handles positive whole numbers', t => {
  const lang = new TestLanguage()
  t.is(lang.convert(false, 42n), 'number-42')
  t.is(lang.convert(false, 0n), 'zero')
  t.is(lang.convert(false, 100n), 'number-100')
  t.is(lang.convert(false, 1000000n), 'number-1000000')
})

test('convert handles negative numbers', t => {
  const lang = new TestLanguage()
  t.is(lang.convert(true, 42n), 'minus number-42')
  t.is(lang.convert(true, 1n), 'minus number-1')
  t.is(lang.convert(true, 100n), 'minus number-100')
  t.is(lang.convert(true, 1000n), 'minus number-1000')
})

test('convert handles decimal numbers in grouped mode', t => {
  const lang = new TestLanguage()
  t.is(lang.convert(false, 3n, '14'), 'number-3 point number-14')
  t.is(lang.convert(false, 0n, '5'), 'zero point number-5')
  t.is(lang.convert(false, 42n, '7'), 'number-42 point number-7')
})

test('convert handles leading zeros in decimals (grouped mode)', t => {
  const lang = new TestLanguage()
  // Leading zeros preserved, remaining grouped
  t.is(lang.convert(false, 3n, '05'), 'number-3 point zero number-5')
  t.is(lang.convert(false, 1n, '001'), 'number-1 point zero zero number-1')
})

test('convert handles negative decimals', t => {
  const lang = new TestLanguage()
  t.is(lang.convert(true, 3n, '14'), 'minus number-3 point number-14')
  t.is(lang.convert(true, 0n, '5'), 'minus zero point number-5')
})

test('caches whole number correctly', t => {
  const lang = new TestLanguage()
  lang.convert(false, 42n)
  t.is(lang.cachedWholeNumber, 42n)

  lang.convert(false, 100n, '5')
  t.is(lang.cachedWholeNumber, 100n)

  // convert() receives already-positive wholeNumber (sign is passed as isNegative flag)
  lang.convert(true, 50n)
  t.is(lang.cachedWholeNumber, 50n)
})

test('convertDigitToWord returns zeroWord for 0', t => {
  const lang = new TestLanguageWithDigits()
  t.is(lang.convertDigitToWord(0n), 'zero')
})

test('convertDigitToWord uses digits array (length 10)', t => {
  const lang = new TestLanguageWithDigits()
  t.is(lang.convertDigitToWord(1n), 'one')
  t.is(lang.convertDigitToWord(5n), 'five')
  t.is(lang.convertDigitToWord(9n), 'nine')
})

test('convertDigitToWord uses digits array (length 9)', t => {
  class TestLang extends AbstractLanguage {
    digits = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
    zeroWord = 'zero'
    convertWholePart (n) { return String(n) }
  }
  const lang = new TestLang()
  t.is(lang.convertDigitToWord(0n), 'zero')
  t.is(lang.convertDigitToWord(1n), 'one')
  t.is(lang.convertDigitToWord(5n), 'five')
  t.is(lang.convertDigitToWord(9n), 'nine')
})

test('convertDigitToWord falls back to convertWholePart when no digits array', t => {
  const lang = new TestLanguage()
  t.is(lang.convertDigitToWord(5n), 'number-5')
  t.is(lang.convertDigitToWord(9n), 'number-9')
})

test('per-digit decimal mode converts each digit separately', t => {
  const lang = new TestLanguagePerDigit()
  t.is(lang.convert(false, 3n, '14'), 'whole-3 point one four')
  t.is(lang.convert(false, 0n, '05'), 'whole-0 point zero five')
  t.is(lang.convert(false, 1n, '234'), 'whole-1 point two three four')
})

test('decimalDigitsToWords in per-digit mode', t => {
  const lang = new TestLanguagePerDigit()
  const result = lang.decimalDigitsToWords('14')
  t.deepEqual(result, ['one', 'four'])
})

test('decimalDigitsToWords in grouped mode with leading zeros', t => {
  const lang = new TestLanguageWithDigits()
  const result = lang.decimalDigitsToWords('05')
  t.deepEqual(result, ['zero', 'whole-5'])
})

test('decimalDigitsToWords in grouped mode without leading zeros', t => {
  const lang = new TestLanguageWithDigits()
  const result = lang.decimalDigitsToWords('14')
  t.deepEqual(result, ['whole-14'])
})

test('decimalDigitsToWords handles all zeros', t => {
  const lang = new TestLanguageWithDigits()
  const result = lang.decimalDigitsToWords('000')
  t.deepEqual(result, ['zero', 'zero', 'zero'])
})

test('wordSeparator is used correctly', t => {
  class TestLangCustomSeparator extends AbstractLanguage {
    negativeWord = 'MINUS'
    decimalSeparatorWord = 'DOT'
    zeroWord = 'ZERO'
    wordSeparator = '|'
    convertWholePart (n) { return `NUM${n}` }
  }
  const lang = new TestLangCustomSeparator()
  t.is(lang.convert(true, 3n, '14'), 'MINUS|NUM3|DOT|NUM14')
})

test('handles very large bigint values', t => {
  const lang = new TestLanguage()
  const huge = 123456789012345678901234567890n
  t.is(lang.convert(false, huge), `number-${huge}`)
})

test('zero returns zeroWord', t => {
  const lang = new TestLanguage()
  t.is(lang.convert(false, 0n), 'zero')
})

test('mergeOptions merges defaults with user options', t => {
  const lang = new TestLanguage()
  const defaults = { foo: 'default', bar: 1 }
  const userOptions = { bar: 2, baz: 'new' }
  const merged = lang.mergeOptions(defaults, userOptions)

  t.deepEqual(merged, { foo: 'default', bar: 2, baz: 'new' })
})

test('mergeOptions handles empty defaults', t => {
  const lang = new TestLanguage()
  const merged = lang.mergeOptions({}, { option: 'value' })

  t.deepEqual(merged, { option: 'value' })
})

test('mergeOptions handles empty user options', t => {
  const lang = new TestLanguage()
  const merged = lang.mergeOptions({ default: 'value' }, {})

  t.deepEqual(merged, { default: 'value' })
})

test('constructor properly applies options via mergeOptions', t => {
  const lang = new TestLanguage({ gender: 'feminine' })
  t.is(lang.convertWholePart(42n), 'feminine-number-42')

  const lang2 = new TestLanguage({ gender: 'masculine' })
  t.is(lang2.convertWholePart(42n), 'number-42')
})

test('mergeOptions handles no parameters', t => {
  const lang = new TestLanguage()
  const merged = lang.mergeOptions()

  t.deepEqual(merged, {})
})

test('mergeOptions handles undefined parameters', t => {
  const lang = new TestLanguage()
  const merged = lang.mergeOptions(undefined, undefined)

  t.deepEqual(merged, {})
})

// ============================================================================
// convertDecimalWholePart Tests
// ============================================================================

test('convertDecimalWholePart defaults to convertWholePart', t => {
  const lang = new TestLanguage()
  // Without override, should delegate to convertWholePart
  t.is(lang.convertDecimalWholePart(42n), 'number-42')
  t.is(lang.convertDecimalWholePart(0n), 'zero')
})

test('convertDecimalWholePart can be overridden for custom decimal behavior', t => {
  // Language that uses different forms for decimals
  class TestLangWithDecimalOverride extends AbstractLanguage {
    negativeWord = 'minus'
    decimalSeparatorWord = 'point'
    zeroWord = 'zero'

    convertWholePart (n) {
      return `whole-${n}`
    }

    // Override: decimals use different format
    convertDecimalWholePart (n) {
      return `decimal-${n}`
    }
  }

  const lang = new TestLangWithDecimalOverride()
  t.is(lang.convertWholePart(42n), 'whole-42')
  t.is(lang.convertDecimalWholePart(42n), 'decimal-42')
})

test('decimalDigitsToWords uses convertDecimalWholePart in grouped mode', t => {
  class TestLangWithDecimalOverride extends AbstractLanguage {
    negativeWord = 'minus'
    decimalSeparatorWord = 'point'
    zeroWord = 'zero'

    convertWholePart (n) {
      return `whole-${n}`
    }

    convertDecimalWholePart (n) {
      return `decimal-${n}`
    }
  }

  const lang = new TestLangWithDecimalOverride()
  // Grouped mode should use convertDecimalWholePart
  t.deepEqual(lang.decimalDigitsToWords('14'), ['decimal-14'])
  t.deepEqual(lang.decimalDigitsToWords('05'), ['zero', 'decimal-5'])
})

test('convertDigitToWord uses convertDecimalWholePart when no digits array', t => {
  class TestLangWithDecimalOverride extends AbstractLanguage {
    negativeWord = 'minus'
    decimalSeparatorWord = 'point'
    zeroWord = 'zero'

    convertWholePart (n) {
      return `whole-${n}`
    }

    convertDecimalWholePart (n) {
      return `decimal-${n}`
    }
  }

  const lang = new TestLangWithDecimalOverride()
  // Per-digit conversion should use convertDecimalWholePart
  t.is(lang.convertDigitToWord(5n), 'decimal-5')
  t.is(lang.convertDigitToWord(0n), 'zero') // Zero still uses zeroWord
})

test('full decimal conversion uses convertDecimalWholePart', t => {
  class TestLangWithDecimalOverride extends AbstractLanguage {
    negativeWord = 'minus'
    decimalSeparatorWord = 'point'
    zeroWord = 'zero'

    convertWholePart (n) {
      return `whole-${n}`
    }

    convertDecimalWholePart (n) {
      return `decimal-${n}`
    }
  }

  const lang = new TestLangWithDecimalOverride()
  // Full conversion: whole uses convertWholePart, decimal uses convertDecimalWholePart
  t.is(lang.convert(false, 3n, '14'), 'whole-3 point decimal-14')
  t.is(lang.convert(false, 0n, '5'), 'whole-0 point decimal-5')
})

test('convertDecimalWholePart with per-digit mode uses hook for each digit', t => {
  class TestLangPerDigitWithOverride extends AbstractLanguage {
    negativeWord = 'minus'
    decimalSeparatorWord = 'point'
    zeroWord = 'zero'
    convertDecimalsPerDigit = true

    convertWholePart (n) {
      return `whole-${n}`
    }

    convertDecimalWholePart (n) {
      return `d${n}`
    }
  }

  const lang = new TestLangPerDigitWithOverride()
  // Per-digit mode uses convertDigitToWord which delegates to convertDecimalWholePart
  t.is(lang.convert(false, 1n, '23'), 'whole-1 point d2 d3')
})

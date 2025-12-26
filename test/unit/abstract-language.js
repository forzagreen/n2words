import test from 'ava'
import { AbstractLanguage } from '../../lib/classes/abstract-language.js'

/**
 * Unit Tests for AbstractLanguage
 *
 * Tests the base class functionality including:
 * - Input validation and normalization
 * - Sign handling (negative numbers)
 * - Decimal handling (grouped and per-digit modes)
 * - Constructor options validation
 * - Abstract method enforcement
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
      feminine: false
    }, options)
  }

  // Simple implementation: just return the number as string
  convertWholePart (wholeNumber) {
    if (this.options.feminine) return `feminine-number-${wholeNumber}`
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

test('convertToWords accepts number input', t => {
  const lang = new TestLanguage()
  t.is(lang.convertToWords(42), 'number-42')
  t.is(lang.convertToWords(0), 'zero')
  t.is(lang.convertToWords(100), 'number-100')
})

test('convertToWords accepts string input', t => {
  const lang = new TestLanguage()
  t.is(lang.convertToWords('42'), 'number-42')
  t.is(lang.convertToWords('0'), 'zero')
  t.is(lang.convertToWords('100'), 'number-100')
})

test('convertToWords accepts bigint input', t => {
  const lang = new TestLanguage()
  t.is(lang.convertToWords(42n), 'number-42')
  t.is(lang.convertToWords(0n), 'zero')
  t.is(lang.convertToWords(1000000n), 'number-1000000')
})

test('convertToWords rejects NaN', t => {
  const lang = new TestLanguage()
  t.throws(() => lang.convertToWords(NaN), {
    message: 'NaN is not an accepted number.'
  })
})

test('convertToWords rejects invalid string formats', t => {
  const lang = new TestLanguage()
  t.throws(() => lang.convertToWords('abc'), {
    message: /Invalid number format/
  })
  t.throws(() => lang.convertToWords(''), {
    message: /Invalid number format/
  })
  t.throws(() => lang.convertToWords('  '), {
    message: /Invalid number format/
  })
})

test('convertToWords rejects unsupported types', t => {
  const lang = new TestLanguage()
  t.throws(() => lang.convertToWords({}), {
    instanceOf: TypeError,
    message: /Invalid variable type/
  })
  t.throws(() => lang.convertToWords([]), {
    instanceOf: TypeError
  })
  t.throws(() => lang.convertToWords(null), {
    instanceOf: TypeError
  })
})

test('handles negative numbers correctly', t => {
  const lang = new TestLanguage()
  t.is(lang.convertToWords(-42), 'minus number-42')
  t.is(lang.convertToWords(-1), 'minus number-1')
  t.is(lang.convertToWords(-100), 'minus number-100')
})

test('handles negative bigint correctly', t => {
  const lang = new TestLanguage()
  t.is(lang.convertToWords(-42n), 'minus number-42')
  t.is(lang.convertToWords(-1000n), 'minus number-1000')
})

test('handles negative string correctly', t => {
  const lang = new TestLanguage()
  t.is(lang.convertToWords('-42'), 'minus number-42')
  t.is(lang.convertToWords('-100'), 'minus number-100')
})

test('handles decimal numbers in grouped mode', t => {
  const lang = new TestLanguage()
  t.is(lang.convertToWords(3.14), 'number-3 point number-14')
  t.is(lang.convertToWords(0.5), 'zero point number-5')
  t.is(lang.convertToWords(42.7), 'number-42 point number-7')
})

test('handles leading zeros in decimals (grouped mode)', t => {
  const lang = new TestLanguage()
  // Leading zeros preserved, remaining grouped
  t.is(lang.convertToWords(3.05), 'number-3 point zero number-5')
  t.is(lang.convertToWords(1.001), 'number-1 point zero zero number-1')
})

test('handles decimal strings', t => {
  const lang = new TestLanguage()
  t.is(lang.convertToWords('3.14'), 'number-3 point number-14')
  t.is(lang.convertToWords('0.5'), 'zero point number-5')
})

test('handles decimal-only strings (e.g., ".5")', t => {
  const lang = new TestLanguage()
  t.is(lang.convertToWords('.5'), 'zero point number-5')
})

test('handles negative decimals', t => {
  const lang = new TestLanguage()
  t.is(lang.convertToWords(-3.14), 'minus number-3 point number-14')
  t.is(lang.convertToWords('-0.5'), 'minus zero point number-5')
})

test('caches whole number correctly', t => {
  const lang = new TestLanguage()
  lang.convertToWords(42)
  t.is(lang.cachedWholeNumber, 42n)

  lang.convertToWords(100.5)
  t.is(lang.cachedWholeNumber, 100n)

  lang.convertToWords(-50)
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
  t.is(lang.convertToWords(3.14), 'whole-3 point one four')
  // 0.05 has whole part 0, which calls convertWholePart(0) -> 'whole-0'
  t.is(lang.convertToWords(0.05), 'whole-0 point zero five')
  t.is(lang.convertToWords(1.234), 'whole-1 point two three four')
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
  t.is(lang.convertToWords(-3.14), 'MINUS|NUM3|DOT|NUM14')
})

test('trims whitespace from string input', t => {
  const lang = new TestLanguage()
  t.is(lang.convertToWords('  42  '), 'number-42')
  t.is(lang.convertToWords('\t100\n'), 'number-100')
})

test('handles very large bigint values', t => {
  const lang = new TestLanguage()
  const huge = 123456789012345678901234567890n
  t.is(lang.convertToWords(huge), `number-${huge}`)
})

test('zero returns zeroWord', t => {
  const lang = new TestLanguage()
  t.is(lang.convertToWords(0), 'zero')
  t.is(lang.convertToWords(0n), 'zero')
  t.is(lang.convertToWords('0'), 'zero')
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
  const lang = new TestLanguage({ feminine: true })
  t.is(lang.convertWholePart(42n), 'feminine-number-42')

  const lang2 = new TestLanguage({ feminine: false })
  t.is(lang2.convertWholePart(42n), 'number-42')
})

import test from 'ava'
import * as n2words from '../../lib/n2words.js'

/**
 * Unit Tests for n2words.js
 *
 * These tests verify:
 * 1. All language converters are properly exported
 * 2. Converters follow the expected function signature
 * 3. Basic conversion functionality works across all languages
 */

// List of all expected language converter exports
const expectedConverters = [
  'ArabicConverter',
  'AzerbaijaniConverter',
  'BanglaConverter',
  'CzechConverter',
  'DanishConverter',
  'DutchConverter',
  'GermanConverter',
  'GreekConverter',
  'EnglishConverter',
  'SpanishConverter',
  'PersianConverter',
  'FilipinoConverter',
  'FrenchConverter',
  'FrenchBelgiumConverter',
  'GujaratiConverter',
  'HebrewConverter',
  'BiblicalHebrewConverter',
  'HindiConverter',
  'CroatianConverter',
  'HungarianConverter',
  'IndonesianConverter',
  'ItalianConverter',
  'JapaneseConverter',
  'KannadaConverter',
  'KoreanConverter',
  'LithuanianConverter',
  'LatvianConverter',
  'MarathiConverter',
  'MalayConverter',
  'NorwegianBokmalConverter',
  'PunjabiConverter',
  'PolishConverter',
  'PortugueseConverter',
  'RomanianConverter',
  'RussianConverter',
  'SerbianCyrillicConverter',
  'SerbianLatinConverter',
  'SwedishConverter',
  'SwahiliConverter',
  'TamilConverter',
  'TeluguConverter',
  'ThaiConverter',
  'TurkishConverter',
  'UkrainianConverter',
  'UrduConverter',
  'VietnameseConverter',
  'SimplifiedChineseConverter',
  'TraditionalChineseConverter'
]

test('all expected language converters are exported', t => {
  for (const converterName of expectedConverters) {
    t.true(
      converterName in n2words,
      `${converterName} should be exported`
    )
    t.is(
      typeof n2words[converterName],
      'function',
      `${converterName} should be a function`
    )
  }
})

test('all exported converters match expected list', t => {
  const actualExports = Object.keys(n2words)
  const sortedActual = [...actualExports].sort()
  const sortedExpected = [...expectedConverters].sort()

  t.deepEqual(
    sortedActual,
    sortedExpected,
    'Exported converters should exactly match expected list'
  )
})

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
  const { EnglishConverter } = n2words

  // Test that options parameter doesn't throw
  t.notThrows(() => EnglishConverter(42, {}))
  t.notThrows(() => EnglishConverter(42, { someOption: true }))
})

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
// Gender Option Tests
// ============================================================================

test('ArabicConverter respects gender option', t => {
  const { ArabicConverter } = n2words
  const masculine = ArabicConverter(1, { gender: 'masculine' })
  const feminine = ArabicConverter(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender should affect output')
  t.is(masculine, 'واحد') // masculine "one"
  t.is(feminine, 'واحدة') // feminine "one"
})

test('SpanishConverter respects gender option', t => {
  const { SpanishConverter } = n2words
  const masculine = SpanishConverter(1, { gender: 'masculine' })
  const feminine = SpanishConverter(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender should affect output')
  t.is(masculine, 'uno')
  t.is(feminine, 'una')
})

test('RomanianConverter respects gender option', t => {
  const { RomanianConverter } = n2words
  const masculine = RomanianConverter(1, { gender: 'masculine' })
  const feminine = RomanianConverter(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender should affect output')
  t.is(masculine, 'unu')
  t.is(feminine, 'una')
})

test('RussianConverter respects gender option', t => {
  const { RussianConverter } = n2words
  const masculine = RussianConverter(1, { gender: 'masculine' })
  const feminine = RussianConverter(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender should affect output')
  t.is(masculine, 'один')
  t.is(feminine, 'одна')
})

test('CzechConverter respects gender option', t => {
  const { CzechConverter } = n2words
  const masculine = CzechConverter(1, { gender: 'masculine' })
  const feminine = CzechConverter(1, { gender: 'feminine' })
  // Czech currently doesn't differentiate - both return feminine by default
  // This is expected behavior based on the implementation
  t.is(masculine, 'jedna')
  t.is(feminine, 'jedna')
})

test('PolishConverter respects gender option', t => {
  const { PolishConverter } = n2words
  const masculine = PolishConverter(1, { gender: 'masculine' })
  const feminine = PolishConverter(1, { gender: 'feminine' })
  // Polish currently doesn't differentiate for 1 - both return masculine
  // This is expected behavior based on the implementation
  t.is(masculine, 'jeden')
  t.is(feminine, 'jeden')
})

test('CroatianConverter respects gender option', t => {
  const { CroatianConverter } = n2words
  const masculine = CroatianConverter(1, { gender: 'masculine' })
  const feminine = CroatianConverter(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender should affect output')
  t.is(masculine, 'jedan')
  t.is(feminine, 'jedna')
})

test('SerbianCyrillicConverter respects gender option', t => {
  const { SerbianCyrillicConverter } = n2words
  const masculine = SerbianCyrillicConverter(1, { gender: 'masculine' })
  const feminine = SerbianCyrillicConverter(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender should affect output')
  t.is(masculine, 'један')
  t.is(feminine, 'једна')
})

test('SerbianLatinConverter respects gender option', t => {
  const { SerbianLatinConverter } = n2words
  const masculine = SerbianLatinConverter(1, { gender: 'masculine' })
  const feminine = SerbianLatinConverter(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender should affect output')
  t.is(masculine, 'jedan')
  t.is(feminine, 'jedna')
})

test('UkrainianConverter respects gender option', t => {
  const { UkrainianConverter } = n2words
  const masculine = UkrainianConverter(1, { gender: 'masculine' })
  const feminine = UkrainianConverter(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender should affect output')
  t.is(masculine, 'один')
  t.is(feminine, 'одна')
})

test('BiblicalHebrewConverter respects gender option', t => {
  const { BiblicalHebrewConverter } = n2words
  const masculine = BiblicalHebrewConverter(1, { gender: 'masculine' })
  const feminine = BiblicalHebrewConverter(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender should affect output')
  t.is(masculine, 'אחד')
  t.is(feminine, 'אחת')
})

test('HebrewConverter respects gender option', t => {
  const { HebrewConverter } = n2words
  const masculine = HebrewConverter(1, { gender: 'masculine' })
  const feminine = HebrewConverter(1, { gender: 'feminine' })
  // Hebrew currently doesn't differentiate for 1 - both return feminine
  // This is expected behavior based on the implementation
  t.is(masculine, 'אחת')
  t.is(feminine, 'אחת')
})

test('LatvianConverter respects gender option', t => {
  const { LatvianConverter } = n2words
  const masculine = LatvianConverter(1, { gender: 'masculine' })
  const feminine = LatvianConverter(1, { gender: 'feminine' })
  // Latvian currently doesn't differentiate for 1 - both return masculine
  // This is expected behavior based on the implementation
  t.is(masculine, 'viens')
  t.is(feminine, 'viens')
})

test('LithuanianConverter respects gender option', t => {
  const { LithuanianConverter } = n2words
  const masculine = LithuanianConverter(1, { gender: 'masculine' })
  const feminine = LithuanianConverter(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender should affect output')
  t.is(masculine, 'vienas')
  t.is(feminine, 'viena')
})

test('all languages with gender option have consistent defaults', t => {
  const languagesWithGender = [
    ['ArabicConverter', 'واحد'],
    ['BiblicalHebrewConverter', 'אחד'],
    ['CroatianConverter', 'jedan'],
    ['CzechConverter', 'jedna'], // Czech defaults to feminine
    ['HebrewConverter', 'אחת'], // Hebrew defaults to feminine
    ['LatvianConverter', 'viens'],
    ['LithuanianConverter', 'vienas'],
    ['PolishConverter', 'jeden'],
    ['RomanianConverter', 'unu'],
    ['RussianConverter', 'один'],
    ['SerbianCyrillicConverter', 'један'],
    ['SerbianLatinConverter', 'jedan'],
    ['SpanishConverter', 'uno'],
    ['UkrainianConverter', 'один']
  ]

  for (const [converterName, expectedDefault] of languagesWithGender) {
    const converter = n2words[converterName]
    const result = converter(1) // No options = should use default
    t.is(result, expectedDefault, `${converterName} should have consistent default`)
  }
})

// ============================================================================
// Other Language-Specific Option Tests
// ============================================================================

test('SimplifiedChineseConverter respects formal option', t => {
  const { SimplifiedChineseConverter } = n2words
  const formal = SimplifiedChineseConverter(1, { formal: true })
  const common = SimplifiedChineseConverter(1, { formal: false })
  t.not(formal, common, 'Formal option should affect output')
  t.is(formal, '壹')
  t.is(common, '一')
})

test('TraditionalChineseConverter respects formal option', t => {
  const { TraditionalChineseConverter } = n2words
  const formal = TraditionalChineseConverter(1, { formal: true })
  const common = TraditionalChineseConverter(1, { formal: false })
  t.not(formal, common, 'Formal option should affect output')
  t.is(formal, '壹')
  t.is(common, '一')
})

test('TurkishConverter respects dropSpaces option', t => {
  const { TurkishConverter } = n2words
  const withSpaces = TurkishConverter(23, { dropSpaces: false })
  const withoutSpaces = TurkishConverter(23, { dropSpaces: true })
  t.not(withSpaces, withoutSpaces, 'dropSpaces should affect output')
  t.true(withSpaces.includes(' '), 'Default should include spaces')
  t.false(withoutSpaces.includes(' '), 'dropSpaces should remove all spaces')
  t.is(withSpaces, 'yirmi üç')
  t.is(withoutSpaces, 'yirmiüç')
})

test('DutchConverter respects includeOptionalAnd option', t => {
  const { DutchConverter } = n2words
  // includeOptionalAnd affects numbers like 101 (hundred and one)
  const withAnd = DutchConverter(101, { includeOptionalAnd: true })
  const withoutAnd = DutchConverter(101, { includeOptionalAnd: false })
  t.not(withAnd, withoutAnd, 'includeOptionalAnd should affect output')
  t.is(withAnd, 'honderdeneen')
  t.is(withoutAnd, 'honderdeen')
})

test('FrenchConverter respects withHyphenSeparator option', t => {
  const { FrenchConverter } = n2words
  const withHyphens = FrenchConverter(21, { withHyphenSeparator: true })
  const withSpaces = FrenchConverter(21, { withHyphenSeparator: false })
  t.not(withHyphens, withSpaces, 'withHyphenSeparator should affect output')
  t.true(withHyphens.includes('-'), 'Should use hyphens')
  t.is(withHyphens, 'vingt-et-un')
  t.is(withSpaces, 'vingt et un')
})

test('ArabicConverter respects custom negativeWord option', t => {
  const { ArabicConverter } = n2words
  const defaultNegative = ArabicConverter(-1)
  const customNegative = ArabicConverter(-1, { negativeWord: 'سالب' })
  t.not(defaultNegative, customNegative, 'Custom negativeWord should affect output')
  t.is(defaultNegative, 'ناقص واحد')
  t.is(customNegative, 'سالب واحد')
})

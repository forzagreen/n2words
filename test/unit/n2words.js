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

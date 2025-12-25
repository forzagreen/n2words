// TypeScript integration tests to verify type safety and basic functionality

import test from 'ava'

import {
  EnglishConverter,
  FrenchConverter,
  GermanConverter,
  SpanishConverter,
  ItalianConverter,
  PortugueseConverter,
  RussianConverter,
  ArabicConverter,
  JapaneseConverter,
  SimplifiedChineseConverter,
  TraditionalChineseConverter
} from '../../lib/n2words.js'

import type {
  NumericValue,
  ConverterOptions,
  ConverterFunction
} from '../../lib/n2words.js'

test('English conversion', (t) => {
  const result: string = EnglishConverter(42)
  t.is(typeof result, 'string')
  t.is(result, 'forty-two')
})

test('French conversion', (t) => {
  const result: string = FrenchConverter(42)
  t.is(typeof result, 'string')
  t.is(result, 'quarante-deux')
})

test('German conversion', (t) => {
  const result: string = GermanConverter(42)
  t.is(typeof result, 'string')
  t.is(result, 'zweiundvierzig')
})

test('Spanish conversion', (t) => {
  const result: string = SpanishConverter(42)
  t.is(typeof result, 'string')
  t.is(result, 'cuarenta y dos')
})

test('numeric inputs and BigInt', (t) => {
  t.is(EnglishConverter(123), 'one hundred and twenty-three')
  t.is(EnglishConverter(-5), 'minus five')
  t.is(EnglishConverter(0), 'zero')
  t.is(EnglishConverter(1000000), 'one million')
  t.is(EnglishConverter(BigInt(999)), 'nine hundred and ninety-nine')
})

test('options handling', (t) => {
  t.is(EnglishConverter(100, {}), 'one hundred')
  t.is(EnglishConverter(100), 'one hundred')
})

test('return types for converters', (t) => {
  const converters = [
    EnglishConverter,
    FrenchConverter,
    GermanConverter,
    SpanishConverter,
    ItalianConverter,
    PortugueseConverter,
    RussianConverter,
    ArabicConverter,
    JapaneseConverter,
    SimplifiedChineseConverter,
    TraditionalChineseConverter
  ]

  for (const converter of converters) {
    const result: string = converter(42)
    t.is(typeof result, 'string')
    t.true(result.length > 0)
  }
})

test('all converters exported as functions', (t) => {
  const converters = {
    EnglishConverter,
    FrenchConverter,
    GermanConverter,
    SpanishConverter,
    ItalianConverter,
    PortugueseConverter,
    RussianConverter,
    ArabicConverter,
    JapaneseConverter,
    SimplifiedChineseConverter,
    TraditionalChineseConverter
  }

  for (const [name, converter] of Object.entries(converters)) {
    t.is(typeof converter, 'function', `${name} should be a function`)
  }
})

test('edge cases', (t) => {
  t.true(EnglishConverter(42.7).length > 0)
  t.is(EnglishConverter(1), 'one')
  t.is(EnglishConverter(7), 'seven')
})

test('consistency', (t) => {
  const input = 777
  t.is(EnglishConverter(input), EnglishConverter(input))
  t.not(EnglishConverter(100), EnglishConverter(200))
})

test('exported types usage', (t) => {
  const testValues: NumericValue[] = [42, BigInt(100), '123']

  for (const value of testValues) {
    const result: string = EnglishConverter(value as any)
    t.is(typeof result, 'string')
    t.true(result.length > 0)
  }

  const options: ConverterOptions = {}
  t.is(EnglishConverter(42, options), 'forty-two')

  const myConverter: ConverterFunction = EnglishConverter
  t.is(myConverter(100), 'one hundred')

  const converters: ConverterFunction[] = [EnglishConverter, FrenchConverter, GermanConverter]
  const input: NumericValue = 7
  for (const converter of converters) {
    const result: string = converter(input as any)
    t.is(typeof result, 'string')
    t.true(result.length > 0)
  }

  function convertAndFormat(value: NumericValue, converter: ConverterFunction): string {
    return converter(value as any).toUpperCase()
  }

  t.is(convertAndFormat(42, EnglishConverter), 'FORTY-TWO')
})

test('language-specific options', (t) => {
  // Valid options should work
  t.is(typeof ArabicConverter(1, { feminine: true }), 'string')
  t.is(typeof ArabicConverter(1, { feminine: false }), 'string')
  t.is(typeof SimplifiedChineseConverter(123, { formal: true }), 'string')
  t.is(typeof SimplifiedChineseConverter(123, { formal: false }), 'string')

  // Test actual functionality
  const masculine = ArabicConverter(1)
  const feminine = ArabicConverter(1, { feminine: true })
  t.not(masculine, feminine, 'Feminine option should change output')

  const formal = SimplifiedChineseConverter(123)
  const common = SimplifiedChineseConverter(123, { formal: false })
  t.not(formal, common, 'Formal option should change output')

  t.pass('Language-specific options work correctly')
})

test('type safety for numeric inputs', (t) => {
  // All valid NumericValue types should work
  t.is(typeof EnglishConverter(42), 'string')
  t.is(typeof EnglishConverter('42'), 'string')
  t.is(typeof EnglishConverter(42n), 'string')

  // Verify actual conversion
  t.is(EnglishConverter(42), 'forty-two')
  t.is(EnglishConverter('42'), 'forty-two')
  t.is(EnglishConverter(42n), 'forty-two')

  t.pass('All NumericValue types convert correctly')
})

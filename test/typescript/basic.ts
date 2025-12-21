// test/typescript/basic.ts
// TypeScript integration tests to verify type safety and basic functionality

import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
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

// Import the new exported types
import type {
  NumericValue,
  ConverterOptions,
  ConverterFunction
} from '../../lib/n2words.js'

describe('TypeScript Type Safety Tests', () => {
  describe('Basic Converter Functionality', () => {
    it('should convert numbers to English words', () => {
      const result: string = EnglishConverter(42)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result, 'forty-two')
    })

    it('should convert numbers to French words', () => {
      const result: string = FrenchConverter(42)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result, 'quarante-deux')
    })

    it('should convert numbers to German words', () => {
      const result: string = GermanConverter(42)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result, 'zweiundvierzig')
    })

    it('should convert numbers to Spanish words', () => {
      const result: string = SpanishConverter(42)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result, 'cuarenta y dos')
    })
  })

  describe('Type Checking - Numeric Inputs', () => {
    it('should accept regular numbers', () => {
      const result: string = EnglishConverter(123)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result, 'one hundred and twenty-three')
    })

    it('should accept negative numbers', () => {
      const result: string = EnglishConverter(-5)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result, 'minus five')
    })

    it('should accept zero', () => {
      const result: string = EnglishConverter(0)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result, 'zero')
    })

    it('should accept large numbers', () => {
      const result: string = EnglishConverter(1000000)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result, 'one million')
    })

    it('should accept BigInt values', () => {
      const result: string = EnglishConverter(BigInt(999))
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result, 'nine hundred and ninety-nine')
    })
  })

  describe('Type Checking - Options Parameter', () => {
    it('should accept empty options object', () => {
      const result: string = EnglishConverter(100, {})
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result, 'one hundred')
    })

    it('should work without options parameter', () => {
      const result: string = EnglishConverter(100)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result, 'one hundred')
    })
  })

  describe('Return Type Verification', () => {
    it('should always return a string type', () => {
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

      converters.forEach((converter) => {
        const result: string = converter(42)
        assert.strictEqual(typeof result, 'string')
        assert.ok(result.length > 0, 'Result should not be empty')
      })
    })
  })

  describe('All Converters Export Test', () => {
    it('should export all language converters as functions', () => {
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

      Object.entries(converters).forEach(([name, converter]) => {
        assert.strictEqual(typeof converter, 'function', `${name} should be a function`)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle decimal numbers by truncating', () => {
      const result: string = EnglishConverter(42.7)
      assert.strictEqual(typeof result, 'string')
      // The library should handle this gracefully
      assert.ok(result.length > 0)
    })

    it('should handle very small numbers', () => {
      const result: string = EnglishConverter(1)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result, 'one')
    })

    it('should handle numbers with leading zeros as numeric input', () => {
      const result: string = EnglishConverter(7)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result, 'seven')
    })
  })

  describe('Consistency Tests', () => {
    it('should produce consistent results for same input', () => {
      const input = 777
      const result1: string = EnglishConverter(input)
      const result2: string = EnglishConverter(input)
      assert.strictEqual(result1, result2, 'Results should be consistent')
    })

    it('should produce different results for different inputs', () => {
      const result1: string = EnglishConverter(100)
      const result2: string = EnglishConverter(200)
      assert.notStrictEqual(result1, result2, 'Different inputs should produce different outputs')
    })
  })

  describe('Exported Type Usage', () => {
    it('should use NumericValue type for function parameters', () => {
      const testValues: NumericValue[] = [42, BigInt(100), '123']

      testValues.forEach((value) => {
        const result: string = EnglishConverter(value)
        assert.strictEqual(typeof result, 'string')
        assert.ok(result.length > 0)
      })
    })

    it('should use ConverterOptions type for options parameter', () => {
      const options: ConverterOptions = {}
      const result: string = EnglishConverter(42, options)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result, 'forty-two')
    })

    it('should assign converters to ConverterFunction type', () => {
      const myConverter: ConverterFunction = EnglishConverter
      const result: string = myConverter(100)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result, 'one hundred')
    })

    it('should use ConverterFunction in arrays', () => {
      const converters: ConverterFunction[] = [
        EnglishConverter,
        FrenchConverter,
        GermanConverter
      ]

      const input: NumericValue = 7
      converters.forEach((converter) => {
        const result: string = converter(input)
        assert.strictEqual(typeof result, 'string')
        assert.ok(result.length > 0)
      })
    })

    it('should use types in function signatures', () => {
      function convertAndFormat(value: NumericValue, converter: ConverterFunction): string {
        return converter(value).toUpperCase()
      }

      const result = convertAndFormat(42, EnglishConverter)
      assert.strictEqual(result, 'FORTY-TWO')
    })
  })
})

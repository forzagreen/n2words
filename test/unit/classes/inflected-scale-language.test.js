import test from 'ava'
import { ScaleLanguage } from '../../../lib/classes/scale-language.js'

/**
 * Unit Tests for ScaleLanguage Inflection Features
 *
 * Tests the inflected scale language algorithm:
 * - Segment-based decomposition (hundreds, tens, ones)
 * - Gender-aware number forms (masculine/feminine for 1-4)
 * - Scale word gender (thousands feminine in Russian-style languages)
 * - Multi-form pluralization via pluralize() method
 * - omitOneBeforeScale behavior (Polish-style)
 *
 * Used by: Slavic languages (Russian, Polish, etc.), Baltic languages (Latvian, Lithuanian)
 *
 * For inflection, subclasses define:
 * - onesWords, onesFeminineWords, teensWords, tensWords, hundredsWords
 * - pluralForms: mapping segment indices to [singular, few, many]
 */

// ============================================================================
// Test Fixtures
// ============================================================================

/**
 * Minimal fixture with gender support and feminine thousands.
 * Only includes digits 1-5 since higher digits don't affect gender.
 */
class TestInflectedLanguage extends ScaleLanguage {
  negativeWord = 'minus'
  decimalSeparatorWord = 'point'
  zeroWord = 'zero'

  onesWords = {
    1: 'one-m',
    2: 'two-m',
    3: 'three-m',
    4: 'four-m',
    5: 'five'
  }

  onesFeminineWords = {
    1: 'one-f',
    2: 'two-f',
    3: 'three-f',
    4: 'four-f',
    5: 'five'
  }

  teensWords = {
    0: 'ten',
    1: 'eleven',
    2: 'twelve',
    3: 'thirteen',
    4: 'fourteen',
    5: 'fifteen'
  }

  tensWords = {
    2: 'twenty',
    3: 'thirty',
    4: 'forty',
    5: 'fifty'
  }

  hundredsWords = {
    1: 'one-hundred',
    2: 'two-hundred',
    3: 'three-hundred',
    4: 'four-hundred',
    5: 'five-hundred'
  }

  pluralForms = {
    1: ['thousand-sing', 'thousand-few', 'thousand-many'],
    2: ['million-sing', 'million-few', 'million-many'],
    3: ['billion-sing', 'billion-few', 'billion-many']
  }

  // Russian-style: thousands are feminine
  scaleGenders = { 1: true }
}

/**
 * Fixture with omitOneBeforeScale enabled (Polish-style).
 * Says "tysiąc" instead of "jeden tysiąc" for 1000.
 */
class TestOmitOneLanguage extends TestInflectedLanguage {
  omitOneBeforeScale = true
}

// ============================================================================
// Gender System
// ============================================================================

test('ones segment uses masculine forms by default', t => {
  const lang = new TestInflectedLanguage()
  t.is(lang.integerToWords(1n), 'one-m')
  t.is(lang.integerToWords(2n), 'two-m')
  t.is(lang.integerToWords(4n), 'four-m')
})

test('ones segment uses feminine forms with gender option', t => {
  const lang = new TestInflectedLanguage({ gender: 'feminine' })
  t.is(lang.integerToWords(1n), 'one-f')
  t.is(lang.integerToWords(2n), 'two-f')
  t.is(lang.integerToWords(4n), 'four-f')
})

test('thousands segment uses scaleGenders setting', t => {
  const lang = new TestInflectedLanguage()
  // 1000 should use feminine form for "1" because scaleGenders[1] = true
  const result = lang.integerToWords(1000n)
  t.true(result.includes('one-f'))
})

test('thousands segment ignores gender option', t => {
  // Even with masculine gender option, thousands use scaleGenders
  const langMasc = new TestInflectedLanguage({ gender: 'masculine' })
  const langFem = new TestInflectedLanguage({ gender: 'feminine' })

  const resultMasc = langMasc.integerToWords(2001n)
  const resultFem = langFem.integerToWords(2001n)

  // Both should have feminine "two-f" for thousands segment
  t.true(resultMasc.includes('two-f'))
  t.true(resultFem.includes('two-f'))

  // But ones segment differs based on gender option
  t.true(resultMasc.includes('one-m'))
  t.true(resultFem.includes('one-f'))
})

test('millions segment uses masculine forms (not in scaleGenders)', t => {
  const lang = new TestInflectedLanguage()
  // scaleGenders only has { 1: true }, so millions (index 2) are masculine
  const result = lang.integerToWords(2000000n)
  t.true(result.includes('two-m'))
})

// ============================================================================
// omitOneBeforeScale
// ============================================================================

test('omitOneBeforeScale omits one before thousands', t => {
  const lang = new TestOmitOneLanguage()
  const result = lang.integerToWords(1000n)
  // Should have "thousand-sing" without "one-f" before it
  t.true(result.includes('thousand-sing'))
  t.false(result.includes('one-f'))
  t.false(result.includes('one-m'))
})

test('omitOneBeforeScale omits one before millions', t => {
  const lang = new TestOmitOneLanguage()
  const result = lang.integerToWords(1000000n)
  t.true(result.includes('million-sing'))
  t.false(result.includes('one-m'))
})

test('omitOneBeforeScale keeps multipliers > 1', t => {
  const lang = new TestOmitOneLanguage()
  const result = lang.integerToWords(2000n)
  t.true(result.includes('two-f'))
  t.true(result.includes('thousand-few'))
})

test('omitOneBeforeScale does not affect ones segment', t => {
  const lang = new TestOmitOneLanguage()
  // 1001 = 1 thousand + 1
  const result = lang.integerToWords(1001n)
  // Should omit "one" before thousand but include "one" in ones segment
  t.true(result.includes('thousand-sing'))
  t.true(result.includes('one-m'))
  // Count occurrences - should have exactly one "one"
  const matches = result.match(/one-m/g)
  t.is(matches?.length, 1)
})

test('omitOneBeforeScale disabled by default', t => {
  const lang = new TestInflectedLanguage()
  const result = lang.integerToWords(1000n)
  // Should have "one-f" before "thousand-sing"
  t.true(result.includes('one-f'))
  t.true(result.includes('thousand-sing'))
})

// ============================================================================
// pluralize() Hook
// ============================================================================

test('pluralize uses default inflection rules', t => {
  const lang = new TestInflectedLanguage()
  const forms = ['sing', 'few', 'many']

  // Singular: 1, 21, 31, etc. (ends in 1, except 11)
  t.is(lang.pluralize(1n, forms), 'sing')
  t.is(lang.pluralize(21n, forms), 'sing')
  t.is(lang.pluralize(101n, forms), 'sing')

  // Few: 2-4, 22-24, etc. (ends in 2-4, except 12-14)
  t.is(lang.pluralize(2n, forms), 'few')
  t.is(lang.pluralize(3n, forms), 'few')
  t.is(lang.pluralize(4n, forms), 'few')
  t.is(lang.pluralize(22n, forms), 'few')

  // Many: 0, 5-20, 25-30, etc.
  t.is(lang.pluralize(0n, forms), 'many')
  t.is(lang.pluralize(5n, forms), 'many')
  t.is(lang.pluralize(10n, forms), 'many')
  t.is(lang.pluralize(11n, forms), 'many') // teens always many
  t.is(lang.pluralize(12n, forms), 'many')
  t.is(lang.pluralize(19n, forms), 'many')
  t.is(lang.pluralize(20n, forms), 'many')
  t.is(lang.pluralize(111n, forms), 'many') // ends in 11
})

// ============================================================================
// Constructor Options
// ============================================================================

test('constructor defaults to masculine gender', t => {
  const lang = new TestInflectedLanguage()
  t.is(lang.options.gender, 'masculine')
})

test('constructor accepts gender option', t => {
  const lang = new TestInflectedLanguage({ gender: 'feminine' })
  t.is(lang.options.gender, 'feminine')
})

test('constructor merges user options with defaults', t => {
  const lang = new TestInflectedLanguage({ gender: 'feminine', custom: true })
  t.is(lang.options.gender, 'feminine')
  t.is(lang.options.custom, true)
})

// ============================================================================
// Inheritance
// ============================================================================

test('inherits AbstractLanguage properties', t => {
  const lang = new TestInflectedLanguage()
  t.is(lang.negativeWord, 'minus')
  t.is(lang.decimalSeparatorWord, 'point')
  t.is(lang.zeroWord, 'zero')
  t.is(lang.wordSeparator, ' ')
})

test('inherits toWords from AbstractLanguage', t => {
  const lang = new TestInflectedLanguage()
  t.is(typeof lang.toWords, 'function')

  // Handles negatives
  const negative = lang.toWords(true, 5n)
  t.true(negative.includes('minus'))

  // Handles decimals
  const decimal = lang.toWords(false, 3n, '14')
  t.true(decimal.includes('point'))
})

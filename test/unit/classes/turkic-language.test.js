import test from 'ava'
import { TurkicLanguage } from '../../../lib/classes/turkic-language.js'

/**
 * Unit Tests for TurkicLanguage
 *
 * Tests the Turkic number construction algorithm:
 * - Implicit 'bir' (one) omitted before hundreds and thousands
 * - Explicit 'bir' kept before millions and higher
 * - Space-separated word combinations
 *
 * TurkicLanguage extends ScaleLanguage and uses segment-based decomposition
 * for high performance with Turkic grammar rules in joinSegments().
 *
 * Note: Scale word ordering is tested in integration tests for real implementations.
 */

// ============================================================================
// Test Fixtures
// ============================================================================

/**
 * Minimal fixture with Turkish-style vocabulary.
 * Uses structured word objects for ScaleLanguage pattern.
 */
class TestTurkicLanguage extends TurkicLanguage {
  negativeWord = 'eksi'
  decimalSeparatorWord = 'nokta'
  zeroWord = 'sıfır'

  onesWords = {
    1: 'bir',
    2: 'iki',
    3: 'üç',
    4: 'dört',
    5: 'beş',
    6: 'altı',
    7: 'yedi',
    8: 'sekiz',
    9: 'dokuz'
  }

  teensWords = {
    0: 'on',
    1: 'on bir',
    2: 'on iki',
    3: 'on üç',
    4: 'on dört',
    5: 'on beş',
    6: 'on altı',
    7: 'on yedi',
    8: 'on sekiz',
    9: 'on dokuz'
  }

  tensWords = {
    2: 'yirmi',
    3: 'otuz',
    4: 'kırk',
    5: 'elli',
    6: 'altmış',
    7: 'yetmiş',
    8: 'seksen',
    9: 'doksan'
  }

  hundredWord = 'yüz'
  thousandWord = 'bin'
  scaleWords = ['milyon', 'milyar']
}

// ============================================================================
// Implicit "bir" (joinSegments behavior)
// ============================================================================

test('implicit bir omitted for 100 in full conversion', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(100n), 'yüz')
})

test('implicit bir omitted for 1000 in full conversion', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(1000n), 'bin')
})

test('multiplier kept for multiples of 100', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(200n), 'iki yüz')
  t.is(lang.integerToWords(500n), 'beş yüz')
})

test('multiplier kept for multiples of 1000', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(2000n), 'iki bin')
  t.is(lang.integerToWords(5000n), 'beş bin')
})

test('explicit bir kept before millions', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(1_000_000n), 'bir milyon')
})

test('explicit bir kept before billions', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(1_000_000_000n), 'bir milyar')
})

// ============================================================================
// Compound numbers
// ============================================================================

test('tens and ones combinations', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(21n), 'yirmi bir')
  t.is(lang.integerToWords(55n), 'elli beş')
  t.is(lang.integerToWords(99n), 'doksan dokuz')
})

test('hundreds with tens and ones', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(123n), 'yüz yirmi üç')
  t.is(lang.integerToWords(456n), 'dört yüz elli altı')
})

test('thousands with smaller units', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.integerToWords(1001n), 'bin bir')
  t.is(lang.integerToWords(1234n), 'bin iki yüz otuz dört')
  t.is(lang.integerToWords(2345n), 'iki bin üç yüz kırk beş')
})

// ============================================================================
// wordSeparator
// ============================================================================

test('wordSeparator used for joining', t => {
  class CustomSeparatorLanguage extends TestTurkicLanguage {
    wordSeparator = '-'
  }
  const lang = new CustomSeparatorLanguage()
  t.is(lang.integerToWords(23n), 'yirmi-üç')
})

// ============================================================================
// Inheritance
// ============================================================================

test('inherits ScaleLanguage methods', t => {
  const lang = new TestTurkicLanguage()
  t.is(typeof lang.segmentToWords, 'function')
  t.is(typeof lang.joinSegments, 'function')
  t.is(typeof lang.scaleWordForIndex, 'function')
})

test('inherits AbstractLanguage properties', t => {
  const lang = new TestTurkicLanguage()
  t.is(lang.negativeWord, 'eksi')
  t.is(lang.decimalSeparatorWord, 'nokta')
  t.is(lang.zeroWord, 'sıfır')
  t.is(lang.wordSeparator, ' ')
})

test('inherits toWords from AbstractLanguage', t => {
  const lang = new TestTurkicLanguage()
  t.is(typeof lang.toWords, 'function')

  // Handles negatives
  const negative = lang.toWords(true, 5n)
  t.true(negative.includes('eksi'))

  // Handles decimals
  const decimal = lang.toWords(false, 3n, '15')
  t.true(decimal.includes('nokta'))
})

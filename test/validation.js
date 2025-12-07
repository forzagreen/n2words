import test from 'ava'
import n2words from '../lib/n2words.js'

/**
 * Input Validation and Number Type Tests
 *
 * Tests for:
 * - Number type handling (BigInt, negative numbers, decimals)
 * - Decimal precision and leading zeros
 * - Options validation and null handling
 */

/* BigInt and Numeric Type Support */

test('validation › BigInt input and thousand grouping', t => {
  t.is(n2words(1_000_000n, { lang: 'en' }), 'one million')
  t.is(n2words(1001n, { lang: 'en' }), 'one thousand and one')
})

test('validation › negative BigInt', t => {
  t.is(n2words(-100n, { lang: 'en' }), 'minus one hundred')
})

/* Decimal Handling */

test('validation › decimal leading zeros preserved', t => {
  // '3.005' should preserve two leading zeros in the fractional part
  t.is(n2words('3.005', { lang: 'en' }), 'three point zero zero five')
  t.is(n2words('0.0001', { lang: 'en' }), 'zero point zero zero zero one')
})

test('validation › zero-only fractional part', t => {
  // If fractional part is all zeros, the decimal words should be repeated zeros
  t.is(n2words('1.00', { lang: 'en' }), 'one point zero zero')
})

/* Options Validation */

test('validation › null options treated as default', t => {
  // Passing null as options should act like no options (not throw)
  t.is(n2words(5, null), 'five')
})

test('validation › invalid options type throws', t => {
  t.throws(() => n2words(2, 123), { instanceOf: TypeError })
})

import test from 'ava'
import { English } from '../../lib/n2words.js'

/**
 * Input Validation and Number Type Tests
 *
 * Tests for:
 * - Number type handling (BigInt, negative numbers, decimals)
 * - Decimal precision and leading zeros
 * - Options validation and null handling
 */

/* BigInt and Numeric Type Support */

test('BigInt input and thousand grouping', t => {
  t.is(English(1_000_000n), 'one million')
  t.is(English(1001n), 'one thousand and one')
})

test('negative BigInt', t => {
  t.is(English(-100n), 'minus one hundred')
})

/* Decimal Handling */

test('decimal leading zeros preserved', t => {
  // '3.005' should preserve two leading zeros in the fractional part
  t.is(English('3.005'), 'three point zero zero five')
  t.is(English('0.0001'), 'zero point zero zero zero one')
})

test('zero-only fractional part', t => {
  // If fractional part is all zeros, the decimal words should be repeated zeros
  t.is(English('1.00'), 'one point zero zero')
})

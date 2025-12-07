import test from 'ava'
import n2words from '../lib/n2words.js'

/**
 * Core API Tests
 *
 * Tests for fundamental API functionality:
 * - Default language behavior
 * - Language fallback with locale variants
 * - String number input validation and normalization
 */

// Default language and basic conversion
test('api › english is default', t => {
  t.is(n2words(12), 'twelve')
  t.is(n2words(356), 'three hundred and fifty-six')
})

// Language fallback and locale variants
test('api › lang fallback', t => {
  t.is(n2words(70, { lang: 'fr' }), 'soixante-dix')
  t.is(n2words(70, { lang: 'fr-XX' }), 'soixante-dix')
  t.is(n2words(70, { lang: 'fr-BE' }), 'septante')
  t.is(n2words(70, { lang: 'fr-BE-XX' }), 'septante')
  t.is(n2words(70, { lang: 'fr-BE-XX-XX-XX-XX-XX' }), 'septante')
})

// Input format validation
test('api › accept valid string numbers', t => {
  t.is(n2words('12'), 'twelve')
  t.is(n2words('0012'), 'twelve')
  t.is(n2words('.1'), 'zero point one')
  t.is(n2words(' -12.6 '), 'minus twelve point six')
  t.is(n2words(' -12.606'), 'minus twelve point six hundred and six')
})

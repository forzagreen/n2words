import test from 'ava'
import { English } from '../../lib/n2words.js'

/**
 * Core API Tests
 *
 * Tests for fundamental API functionality:
 * - Default language behavior
 * - String number input validation and normalization
 */

// Default language and basic conversion
test('english is default', t => {
  t.is(English(12), 'twelve')
  t.is(English(356), 'three hundred and fifty-six')
})

// Input format validation
test('accept valid string numbers', t => {
  t.is(English('12'), 'twelve')
  t.is(English('0012'), 'twelve')
  t.is(English('.1'), 'zero point one')
  t.is(English(' -12.6 '), 'minus twelve point six')
  t.is(English(' -12.606'), 'minus twelve point six hundred and six')
})

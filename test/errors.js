import test from 'ava'
import n2words from '../lib/n2words.js'

/**
 * Error Handling Tests
 *
 * Tests for error conditions and invalid inputs:
 * - Unsupported language codes
 * - Invalid options objects
 * - Invalid number formats and types
 */

// Invalid language codes
test('unsupported language', t => {
  t.throws(
    () => {
      n2words(2, { lang: 'aaa' })
    },
    { instanceOf: Error }
  )
})

// Invalid options format
test('options must be object', t => {
  t.throws(
    () => {
      n2words(2, 'en')
    },
    { instanceOf: Error }
  )
})

// Invalid number formats
test('invalid number format', t => {
  t.throws(
    () => {
      n2words('foobar')
    },
    { instanceOf: Error }
  )
})

test('non-numeric types', t => {
  t.throws(
    () => {
      n2words(false)
    },
    { instanceOf: Error }
  )
})

test('string with units', t => {
  t.throws(
    () => {
      n2words('3px')
    },
    { instanceOf: Error }
  )
})

test('NaN', t => {
  t.throws(
    () => {
      n2words(Number.NaN)
    },
    { instanceOf: Error }
  )
})

test('empty string', t => {
  t.throws(
    () => {
      n2words('')
    },
    { instanceOf: Error }
  )
})

test('whitespace only', t => {
  t.throws(
    () => {
      n2words(' ')
    },
    { instanceOf: Error }
  )
})

test('invalid options type', t => {
  t.throws(() => n2words(2, 123), { instanceOf: TypeError })
})

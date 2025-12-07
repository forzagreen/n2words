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
test('errors › unsupported language', t => {
  t.throws(
    () => {
      n2words(2, { lang: 'aaa' })
    },
    { instanceOf: Error }
  )
})

// Invalid options format
test('errors › options must be object', t => {
  t.throws(
    () => {
      n2words(2, 'en')
    },
    { instanceOf: Error }
  )
})

// Invalid number formats
test('errors › invalid number format', t => {
  t.throws(
    () => {
      n2words('foobar')
    },
    { instanceOf: Error }
  )
})

test('errors › non-numeric types', t => {
  t.throws(
    () => {
      n2words(false)
    },
    { instanceOf: Error }
  )
})

test('errors › string with units', t => {
  t.throws(
    () => {
      n2words('3px')
    },
    { instanceOf: Error }
  )
})

test('errors › NaN', t => {
  t.throws(
    () => {
      n2words(Number.NaN)
    },
    { instanceOf: Error }
  )
})

test('errors › empty string', t => {
  t.throws(
    () => {
      n2words('')
    },
    { instanceOf: Error }
  )
})

test('errors › whitespace only', t => {
  t.throws(
    () => {
      n2words(' ')
    },
    { instanceOf: Error }
  )
})

test('errors › invalid options type', t => {
  t.throws(() => n2words(2, 123), { instanceOf: TypeError })
})

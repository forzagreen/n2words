import test from 'ava'
import { English } from '../../lib/n2words.js'

/**
 * Error Handling Tests
 *
 * Tests for error conditions and invalid inputs:
 * - Unsupported language codes
 * - Invalid options objects
 * - Invalid number formats and types
 */

// Invalid options format
test('options must be object', t => {
  t.throws(
    () => {
      English(2, 'en')
    },
    { instanceOf: Error }
  )
})

// Invalid number formats
test('invalid number format', t => {
  t.throws(
    () => {
      English('foobar')
    },
    { instanceOf: Error }
  )
})

test('non-numeric types', t => {
  t.throws(
    () => {
      English(false)
    },
    { instanceOf: Error }
  )
})

test('string with units', t => {
  t.throws(
    () => {
      English('3px')
    },
    { instanceOf: Error }
  )
})

test('NaN', t => {
  t.throws(
    () => {
      English(Number.NaN)
    },
    { instanceOf: Error }
  )
})

test('empty string', t => {
  t.throws(
    () => {
      English('')
    },
    { instanceOf: Error }
  )
})

test('whitespace only', t => {
  t.throws(
    () => {
      English(' ')
    },
    { instanceOf: Error }
  )
})

test('invalid options type', t => {
  t.throws(() => English(2, 123), { instanceOf: TypeError })
})

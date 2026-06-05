import test from 'ava'
import { tooLargeError } from '../../src/utils/too-large-error.js'

/**
 * Unit Tests for too-large-error.js
 *
 * Tests the tooLargeError helper, which builds the uniform RangeError thrown
 * when a value exceeds a language's largest scale word.
 */

test('returns a RangeError instance', (t) => {
  t.true(tooLargeError(30) instanceof RangeError)
})

test('message reports the supported ceiling', (t) => {
  t.is(
    tooLargeError(30).message,
    'Number too large to convert: the largest supported value is 10^30 - 1',
  )
})

test('embeds the given exponent', (t) => {
  t.true(tooLargeError(12).message.includes('10^12'))
  t.true(tooLargeError(66).message.includes('10^66'))
})

test('bigint ceiling that is a power of ten renders as 10^N - 1', (t) => {
  t.is(
    tooLargeError(10n ** 30n).message,
    'Number too large to convert: the largest supported value is 10^30 - 1',
  )
})

test('bigint ceiling that is not a power of ten renders the raw maximum', (t) => {
  const message = tooLargeError(999n).message
  t.true(message.includes('998')) // 999 - 1
  t.false(message.includes('10^'))
})

test('does not throw on its own (returns the error to throw)', (t) => {
  t.notThrows(() => tooLargeError(24))
})

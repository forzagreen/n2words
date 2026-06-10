import test from 'ava'
import { resolveOptions } from '../../src/utils/resolve-options.js'

/**
 * Unit Tests for resolve-options.js
 *
 * Tests the options-contract resolver: fills defaults from the form's exported
 * map, rejects malformed options with TypeError, and rejects out-of-set enum
 * values with RangeError.
 */

const DEFAULTS = { and: true, gender: 'masculine' }
const VALUES = { gender: ['masculine', 'feminine'] }

test('returns the defaults when options is undefined', (t) => {
  t.deepEqual(resolveOptions(undefined, DEFAULTS), DEFAULTS)
})

test('returns a copy, not the defaults object itself', (t) => {
  t.not(resolveOptions(undefined, DEFAULTS), DEFAULTS)
})

test('caller values override their defaults; others keep theirs', (t) => {
  t.deepEqual(resolveOptions({ and: false }, DEFAULTS), { and: false, gender: 'masculine' })
})

test('an undefined value means "use the default"', (t) => {
  t.deepEqual(resolveOptions({ and: undefined }, DEFAULTS), DEFAULTS)
})

test('throws TypeError for a non-object options argument', (t) => {
  t.throws(() => resolveOptions(/** @type {never} */ (5), DEFAULTS), { instanceOf: TypeError })
  t.throws(() => resolveOptions(/** @type {never} */ ('x'), DEFAULTS), { instanceOf: TypeError })
  t.throws(() => resolveOptions(/** @type {never} */ (null), DEFAULTS), { instanceOf: TypeError })
})

test('throws TypeError for an unknown option key', (t) => {
  const error = t.throws(() => resolveOptions(/** @type {never} */ ({ nope: true }), DEFAULTS), { instanceOf: TypeError })
  t.true(error.message.includes('and, gender'), 'message lists the known options')
})

test('throws TypeError for a wrong-typed value', (t) => {
  t.throws(() => resolveOptions(/** @type {never} */ ({ and: 'yes' }), DEFAULTS), { instanceOf: TypeError })
})

test('rejects inherited keys without polluting the prototype', (t) => {
  t.throws(
    () => resolveOptions(JSON.parse('{ "__proto__": { "polluted": true } }'), DEFAULTS),
    { instanceOf: TypeError },
  )
  t.falsy(/** @type {Record<string, unknown>} */ ({}).polluted)
})

test('accepts every declared enum value', (t) => {
  t.is(resolveOptions({ gender: 'feminine' }, DEFAULTS, VALUES).gender, 'feminine')
  t.is(resolveOptions({ gender: 'masculine' }, DEFAULTS, VALUES).gender, 'masculine')
})

test('throws RangeError for an out-of-set enum value', (t) => {
  const error = t.throws(() => resolveOptions({ gender: 'neuter' }, DEFAULTS, VALUES), { instanceOf: RangeError })
  t.true(error.message.includes('masculine, feminine'), 'message lists the allowed set')
  t.true(error.message.includes('"neuter"'), 'message shows the received value')
})

test('without a values map, any same-typeof value passes (free-string options)', (t) => {
  t.is(resolveOptions({ gender: 'anything' }, DEFAULTS).gender, 'anything')
})

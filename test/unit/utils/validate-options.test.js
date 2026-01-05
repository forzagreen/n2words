import test from 'ava'
import { validateOptions } from '../../../lib/utils/validate-options.js'

test('returns empty object for undefined', t => {
  t.deepEqual(validateOptions(undefined), {})
})

test('returns same object for plain object', t => {
  const opts = { gender: 'feminine' }
  t.is(validateOptions(opts), opts)
})

test('returns same object for empty object', t => {
  const opts = {}
  t.is(validateOptions(opts), opts)
})

test('throws TypeError for null', t => {
  t.throws(() => validateOptions(null), { instanceOf: TypeError })
})

test('throws TypeError for number', t => {
  t.throws(() => validateOptions(42), { instanceOf: TypeError })
})

test('throws TypeError for string', t => {
  t.throws(() => validateOptions('options'), { instanceOf: TypeError })
})

test('throws TypeError for array', t => {
  t.throws(() => validateOptions([]), { instanceOf: TypeError })
})

test('throws TypeError for function', t => {
  t.throws(() => validateOptions(() => {}), { instanceOf: TypeError })
})

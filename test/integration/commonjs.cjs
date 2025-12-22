const test = require('ava')

test('named export works in CommonJS', async t => {
  const { English } = await import('../../lib/n2words.js')

  t.is(typeof English, 'function')
  t.is(English(1), 'one')
  t.is(English(42), 'forty-two')
})

test('language options work in CommonJS', async t => {
  const { English, Spanish, French } = await import('../../lib/n2words.js')

  // Test different languages
  t.is(English(42), 'forty-two')
  t.is(Spanish(42), 'cuarenta y dos')
  t.is(French(42), 'quarante-deux')
})

test('different input types work in CommonJS', async t => {
  const { English } = await import('../../lib/n2words.js')
  // Number
  t.is(typeof English(123), 'string')

  // String
  t.is(typeof English('456'), 'string')

  // BigInt
  t.is(typeof English(789n), 'string')

  // Negative
  t.is(typeof English(-42), 'string')

  // Decimal
  t.is(typeof English(3.14), 'string')
})

test('error handling works in CommonJS', async t => {
  const { English } = await import('../../lib/n2words.js')

  // Invalid input should throw
  t.throws(() => English(NaN))
  t.throws(() => English('invalid'))
})

test('direct language import works in CommonJS', async t => {
  // Test that individual language imports work via main module (factory pattern)
  const { English, Spanish } = await import('../../lib/n2words.js')

  t.is(typeof English, 'function')
  t.is(typeof Spanish, 'function')

  t.is(English(42), 'forty-two')
  t.is(Spanish(42), 'cuarenta y dos')
})

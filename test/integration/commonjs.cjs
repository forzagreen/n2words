const test = require('ava')

test('default export works in CommonJS', async t => {
  const { default: n2words } = await import('../../lib/n2words.js')

  t.is(typeof n2words, 'function')
  t.is(n2words(1), 'one')
  t.is(n2words(42), 'forty-two')
})

test('named exports work in CommonJS', async t => {
  const module = await import('../../lib/n2words.js')

  // Test that we can destructure the default export
  const { default: n2words } = module
  t.is(typeof n2words, 'function')

  // Test that we can access it directly
  t.is(typeof module.default, 'function')
  t.is(module.default(100), 'one hundred')
})

test('language options work in CommonJS', async t => {
  const { default: n2words } = await import('../../lib/n2words.js')

  // Test different languages
  t.is(n2words(42, { lang: 'en' }), 'forty-two')
  t.is(n2words(42, { lang: 'es' }), 'cuarenta y dos')
  t.is(n2words(42, { lang: 'fr' }), 'quarante-deux')
})

test('different input types work in CommonJS', async t => {
  const { default: n2words } = await import('../../lib/n2words.js')

  // Number
  t.is(typeof n2words(123), 'string')

  // String
  t.is(typeof n2words('456'), 'string')

  // BigInt
  t.is(typeof n2words(789n), 'string')

  // Negative
  t.is(typeof n2words(-42), 'string')

  // Decimal
  t.is(typeof n2words(3.14), 'string')
})

test('error handling works in CommonJS', async t => {
  const { default: n2words } = await import('../../lib/n2words.js')

  // Invalid language should throw
  t.throws(() => n2words(42, { lang: 'invalid' }))

  // Invalid input should throw
  t.throws(() => n2words(NaN))
  t.throws(() => n2words('invalid'))
})

test('direct language import works in CommonJS', async t => {
  // Test that individual language imports work
  const enModule = await import('../../lib/languages/en.js')
  const esModule = await import('../../lib/languages/es.js')

  t.is(typeof enModule.default, 'function')
  t.is(typeof esModule.default, 'function')

  t.is(enModule.default(42), 'forty-two')
  t.is(esModule.default(42), 'cuarenta y dos')
})

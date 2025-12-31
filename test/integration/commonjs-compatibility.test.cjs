// test/integration/commonjs-compatibility.test.cjs
// Integration test to ensure n2words works with CommonJS (.cjs) modules
// Tests both modern Node.js require() interop AND dynamic import patterns

const test = require('ava')
const path = require('path')
const { pathToFileURL } = require('url')

const languages = [
  { code: 'en', converter: 'EnglishConverter', sample: 123, expected: 'one hundred and twenty-three' },
  { code: 'fr', converter: 'FrenchConverter', sample: 456, expected: 'quatre cent cinquante-six' },
  { code: 'de', converter: 'GermanConverter', sample: 789, expected: 'siebenhundertneunundachtzig' },
  { code: 'es', converter: 'SpanishConverter', sample: 42, expected: 'cuarenta y dos' },
  { code: 'ar', converter: 'ArabicConverter', sample: 1, expected: 'واحد' }
]

// Test 1: Modern Node.js allows require() of ESM (Node 20+)
// This works in newer Node.js versions but isn't standard/guaranteed
languages.forEach(({ code, converter, sample, expected }) => {
  test(`${converter} (${code}) - require() interop`, t => {
    const n2words = require(path.resolve(__dirname, '../../lib/n2words.js'))

    t.truthy(n2words[converter], `Converter for ${code} should be exported`)
    const result = n2words[converter](sample)
    t.is(typeof result, 'string', `Result for ${code} should be a string`)
    if (expected) {
      t.is(result, expected, `${converter}(${sample}) should return "${expected}"`)
    }
  })
})

// Test 2: Dynamic import with async/await (recommended pattern)
languages.slice(0, 2).forEach(({ code, converter, sample, expected }) => {
  test(`${converter} (${code}) - async/await import`, async t => {
    const modulePath = pathToFileURL(path.resolve(__dirname, '../../lib/n2words.js')).href
    const n2words = await import(modulePath)

    t.truthy(n2words[converter], `Converter for ${code} should be exported`)
    const result = n2words[converter](sample)
    t.is(typeof result, 'string', `Result for ${code} should be a string`)
    if (expected) {
      t.is(result, expected, `${converter}(${sample}) should return "${expected}"`)
    }
  })
})

// Test 3: Dynamic import with .then() chain (Promise pattern)
test('Dynamic import with .then() chain', t => {
  const modulePath = pathToFileURL(path.resolve(__dirname, '../../lib/n2words.js')).href
  return import(modulePath).then(({ EnglishConverter }) => {
    t.truthy(EnglishConverter, 'EnglishConverter should be exported')
    const result = EnglishConverter(999)
    t.is(result, 'nine hundred and ninety-nine')
  })
})

// Test 4: Async function wrapper pattern
test('Dynamic import in async function', async t => {
  async function convertNumber (num) {
    const modulePath = pathToFileURL(path.resolve(__dirname, '../../lib/n2words.js')).href
    const { SpanishConverter } = await import(modulePath)
    return SpanishConverter(num)
  }

  const result = await convertNumber(100)
  t.is(result, 'cien')
})

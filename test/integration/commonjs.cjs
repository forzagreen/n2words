// test/integration/commonjs.cjs
// Integration test to ensure n2words works with CommonJS (.cjs) modules using ava

const test = require('ava')
const path = require('path')
const n2words = require(path.resolve(__dirname, '../../lib/n2words.js'))

const languages = [
  { code: 'en', converter: 'EnglishConverter', sample: 123, expected: 'one hundred and twenty-three' },
  { code: 'fr', converter: 'FrenchConverter', sample: 456, expected: 'quatre cent cinquante-six' },
  { code: 'de', converter: 'GermanConverter', sample: 789, expected: 'siebenhundertneunundachtzig' }
]

languages.forEach(({ code, converter, sample, expected }) => {
  test(`${converter} (${code})`, t => {
    t.truthy(n2words[converter], `Converter for ${code} should be exported`)
    const result = n2words[converter](sample)
    t.is(typeof result, 'string', `Result for ${code} should be a string`)
    if (expected) {
      t.is(result, expected, `n2words[${converter}](${sample}) should return "${expected}", got "${result}"`)
    }
  })
})

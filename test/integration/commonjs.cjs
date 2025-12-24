// test/integration/commonjs.cjs
// Integration test to ensure n2words works with CommonJS (.cjs) modules

const assert = require('assert');
const path = require('path');

// Import the built n2words library (assume main entry is lib/n2words.js)
const n2words = require(path.resolve(__dirname, '../../lib/n2words.js'));

// List of languages to test (add more as needed)
const languages = [
  { code: 'en', converter: 'EnglishConverter', sample: 123, expected: 'one hundred twenty-three' },
  { code: 'fr', converter: 'FrenchConverter', sample: 456, expected: 'quatre cent cinquante-six' },
  { code: 'de', converter: 'GermanConverter', sample: 789, expected: 'siebenhundertneunundachtzig' },
];

languages.forEach(({ code, converter, sample, expected }) => {
  assert.ok(n2words[converter], `Converter for ${code} should be exported`);
  const result = n2words[converter](sample);
  assert.strictEqual(
    typeof result,
    'string',
    `Result for ${code} should be a string`
  );
  // Only check expected if provided
  if (expected) {
    assert.strictEqual(
      result,
      expected,
      `n2words[${converter}](${sample}) should return "${expected}", got "${result}"`
    );
  }
});

console.log('CommonJS integration test passed for n2words.');

/**
 * CJS Require Tests
 *
 * Tests that the UMD bundles work correctly when loaded via require().
 * This file uses .cjs extension to force CommonJS mode even in an ESM package.
 *
 * Tests:
 * - Main bundle can be required and exports all converters
 * - Individual language bundles can be required
 * - Converters work correctly when required
 */

const test = require('ava')
const path = require('path')

const distDir = path.join(__dirname, '../../dist')

// =============================================================================
// Main Bundle CJS Tests
// =============================================================================

test('main UMD bundle can be required', t => {
  const n2words = require(path.join(distDir, 'n2words.umd.cjs'))

  t.truthy(n2words, 'n2words should be requirable')
  t.is(typeof n2words.en, 'function', 'en should be exported')
  t.is(typeof n2words.es, 'function', 'es should be exported')
  t.is(typeof n2words.zhHans, 'function', 'zhHans should be exported')
})

test('main UMD bundle converters work via require', t => {
  const n2words = require(path.join(distDir, 'n2words.umd.cjs'))

  t.is(n2words.en(42), 'forty-two', 'en should convert correctly')
  t.is(n2words.es(100), 'cien', 'es should convert correctly')
  t.is(typeof n2words.de(1000), 'string', 'de should return string')
})

test('main UMD bundle converters accept options via require', t => {
  const n2words = require(path.join(distDir, 'n2words.umd.cjs'))

  // Verify options work
  const masculine = n2words.ar(1, { gender: 'masculine' })
  const feminine = n2words.ar(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender option should produce different results')
})

// =============================================================================
// Individual Bundle CJS Tests
// =============================================================================

test('individual UMD bundle can be required', t => {
  const enBundle = require(path.join(distDir, 'languages/en.umd.cjs'))

  t.truthy(enBundle, 'en bundle should be requirable')
  t.is(typeof enBundle.en, 'function', 'en should be exported')
})

test('individual UMD bundle converter works via require', t => {
  const enBundle = require(path.join(distDir, 'languages/en.umd.cjs'))

  t.is(enBundle.en(42), 'forty-two', 'en should convert correctly')
  t.is(enBundle.en(1000), 'one thousand', 'en should handle thousands')
})

test('multiple individual UMD bundles can be required together', t => {
  const enBundle = require(path.join(distDir, 'languages/en.umd.cjs'))
  const esBundle = require(path.join(distDir, 'languages/es.umd.cjs'))
  const deBundle = require(path.join(distDir, 'languages/de.umd.cjs'))

  t.is(enBundle.en(42), 'forty-two', 'en should convert correctly')
  t.is(esBundle.es(42), 'cuarenta y dos', 'es should convert correctly')
  t.is(deBundle.de(42), 'zweiundvierzig', 'de should convert correctly')
})

// =============================================================================
// BigInt Support Tests
// =============================================================================

test('CJS bundles support BigInt', t => {
  const n2words = require(path.join(distDir, 'n2words.umd.cjs'))

  const bigNumber = BigInt('12345678901234567890')
  const result = n2words.en(bigNumber)

  t.is(typeof result, 'string', 'Should handle BigInt')
  t.true(result.length > 0, 'Result should not be empty')
})

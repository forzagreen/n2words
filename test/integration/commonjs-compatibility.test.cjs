/**
 * CommonJS Compatibility Tests
 *
 * Tests that the ESM module can be consumed from CommonJS environments.
 * Validates two consumption patterns:
 * - require() interop (Node 20+ feature)
 * - dynamic import() (recommended pattern)
 *
 * Note: These tests only verify the module loads and converters are callable.
 * Conversion correctness is tested in integration/languages.test.js.
 */

const test = require('ava')
const path = require('path')
const { pathToFileURL } = require('url')

const modulePath = path.resolve(__dirname, '../../lib/n2words.js')

// =============================================================================
// require() Interop (Node 20+)
// =============================================================================

test('require() loads ESM module', t => {
  const n2words = require(modulePath)

  // Module exports converters
  t.truthy(n2words.EnglishConverter, 'EnglishConverter should be exported')
  t.is(typeof n2words.EnglishConverter, 'function', 'Converter should be a function')
})

test('require() converter returns string', t => {
  const n2words = require(modulePath)

  const result = n2words.EnglishConverter(42)
  t.is(typeof result, 'string', 'Converter should return a string')
  t.true(result.length > 0, 'Result should not be empty')
})

test('require() converter accepts options', t => {
  const n2words = require(modulePath)

  // Options should not throw
  t.notThrows(() => n2words.ArabicConverter(1, { gender: 'feminine' }))
})

// =============================================================================
// Dynamic import() Pattern
// =============================================================================

test('dynamic import() loads ESM module', async t => {
  const moduleUrl = pathToFileURL(modulePath).href
  const n2words = await import(moduleUrl)

  // Module exports converters
  t.truthy(n2words.EnglishConverter, 'EnglishConverter should be exported')
  t.is(typeof n2words.EnglishConverter, 'function', 'Converter should be a function')
})

test('dynamic import() converter returns string', async t => {
  const moduleUrl = pathToFileURL(modulePath).href
  const n2words = await import(moduleUrl)

  const result = n2words.EnglishConverter(42)
  t.is(typeof result, 'string', 'Converter should return a string')
  t.true(result.length > 0, 'Result should not be empty')
})

test('dynamic import() with destructuring', async t => {
  const moduleUrl = pathToFileURL(modulePath).href
  const { SpanishConverter } = await import(moduleUrl)

  t.is(typeof SpanishConverter, 'function', 'Destructured converter should be a function')
  t.is(typeof SpanishConverter(100), 'string', 'Converter should return a string')
})

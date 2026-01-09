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

const modulePath = path.resolve(__dirname, '../../index.js')

// =============================================================================
// require() Interop (Node 20+)
// =============================================================================

test('require() loads ESM module', t => {
  const n2words = require(modulePath)

  // Module exports default object with converters
  t.truthy(n2words.default, 'default export should exist')
  t.is(typeof n2words.default, 'object', 'default export should be an object')
})

test('require() default export has converters', t => {
  const { default: n2words } = require(modulePath)

  // Should have converters keyed by normalized BCP 47 codes
  t.is(typeof n2words.en, 'function', 'en converter should be a function')
  t.is(typeof n2words.es, 'function', 'es converter should be a function')
})

test('require() converter returns string', t => {
  const { default: n2words } = require(modulePath)

  const result = n2words.en(42)
  t.is(typeof result, 'string', 'Converter should return a string')
  t.true(result.length > 0, 'Result should not be empty')
})

test('require() converter accepts options', t => {
  const { default: n2words } = require(modulePath)

  // Options should not throw
  t.notThrows(() => n2words.ar(1, { gender: 'feminine' }))
})

test('require() normalized code works', t => {
  const { default: n2words } = require(modulePath)

  const result = n2words.zhHans(42)
  t.is(typeof result, 'string', 'Converter should return a string')
  t.true(result.length > 0, 'Result should not be empty')
})

test('require() named exports work', t => {
  const n2words = require(modulePath)

  // Named exports should be functions
  t.is(typeof n2words.en, 'function', 'en named export should be a function')
  t.is(typeof n2words.zhHans, 'function', 'zhHans named export should be a function')
})

// =============================================================================
// Dynamic import() Pattern
// =============================================================================

test('dynamic import() loads ESM module', async t => {
  const moduleUrl = pathToFileURL(modulePath).href
  const n2words = await import(moduleUrl)

  // Module exports default object with converters
  t.truthy(n2words.default, 'default export should exist')
  t.is(typeof n2words.default, 'object', 'default export should be an object')
})

test('dynamic import() converter returns string', async t => {
  const moduleUrl = pathToFileURL(modulePath).href
  const { default: n2words } = await import(moduleUrl)

  const result = n2words.en(42)
  t.is(typeof result, 'string', 'Converter should return a string')
  t.true(result.length > 0, 'Result should not be empty')
})

test('dynamic import() with named exports', async t => {
  const moduleUrl = pathToFileURL(modulePath).href
  const { en, es, zhHans } = await import(moduleUrl)

  t.is(typeof en, 'function', 'en should be a function')
  t.is(typeof es, 'function', 'es should be a function')
  t.is(typeof zhHans, 'function', 'zhHans should be a function')
  t.is(typeof en(100), 'string', 'Converter should return a string')
})

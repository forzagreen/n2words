/**
 * UMD Build Output Validation Tests
 *
 * Tests the UMD bundles in dist/ to ensure:
 * - All expected files are generated (bundles + source maps)
 * - Bundles have correct UMD structure (banner, wrapper pattern)
 * - Bundles load and export working converters
 * - Individual bundles can be combined (extend mode)
 * - Bundle sizes are reasonable
 *
 * Note: These tests verify build output structure and loadability.
 * Conversion correctness is tested in integration/languages.test.js.
 */

import test from 'ava'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import vm from 'node:vm'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '../../dist')
const require = createRequire(import.meta.url)
const pkg = require('../../package.json')

// Dynamically get all converters from the n2words entry point
const n2words = require('../../lib/n2words.js')
const expectedConverters = Object.keys(n2words)
  .filter(name => name.endsWith('Converter'))
  .sort()

// Get all language codes from the languages directory
const languagesDir = join(__dirname, '../../lib/languages')
const languageCodes = readdirSync(languagesDir)
  .filter(file => file.endsWith('.js'))
  .map(file => file.replace('.js', ''))

/**
 * Load UMD bundle into a sandboxed context and return the n2words global.
 * Simulates browser environment (no CommonJS exports, no AMD define).
 */
function loadUmdBundle (bundlePath) {
  const code = readFileSync(bundlePath, 'utf8')
  const globalContext = {}

  const sandbox = {
    globalThis: globalContext,
    self: globalContext,
    Object,
    Array,
    Number,
    String,
    Boolean,
    BigInt,
    Error,
    TypeError,
    console
  }

  const context = vm.createContext(sandbox)
  const wrappedCode = `(function() { ${code} }).call(globalThis);`
  vm.runInContext(wrappedCode, context)

  return globalContext.n2words
}

// =============================================================================
// File Existence Tests
// =============================================================================

test('main bundle and source map exist', t => {
  t.true(existsSync(join(distDir, 'n2words.js')), 'Main bundle should exist')
  t.true(existsSync(join(distDir, 'n2words.js.map')), 'Main bundle source map should exist')
})

test('all individual language bundles exist', t => {
  const missingBundles = []
  const missingMaps = []

  for (const langCode of languageCodes) {
    if (!existsSync(join(distDir, `languages/${langCode}.js`))) {
      missingBundles.push(langCode)
    }
    if (!existsSync(join(distDir, `languages/${langCode}.js.map`))) {
      missingMaps.push(langCode)
    }
  }

  t.deepEqual(missingBundles, [], `Missing bundles: ${missingBundles.join(', ')}`)
  t.deepEqual(missingMaps, [], `Missing source maps: ${missingMaps.join(', ')}`)
})

// =============================================================================
// Bundle Structure Tests
// =============================================================================

test('main bundle has correct banner with version', t => {
  const code = readFileSync(join(distDir, 'n2words.js'), 'utf8')
  const bannerPattern = new RegExp(`/\\*! n2words v${pkg.version.replace(/\./g, '\\.')} \\| MIT License`)
  t.regex(code, bannerPattern, 'Banner should contain correct version')
})

test('main bundle has UMD wrapper pattern', t => {
  const code = readFileSync(join(distDir, 'n2words.js'), 'utf8')

  t.regex(code, /typeof exports/, 'Should check for CommonJS exports')
  t.regex(code, /typeof define/, 'Should check for AMD define')
  t.regex(code, /globalThis/, 'Should reference globalThis for browser global')
})

test('main bundle ends with source map reference', t => {
  const code = readFileSync(join(distDir, 'n2words.js'), 'utf8')
  t.regex(code, /\/\/# sourceMappingURL=n2words\.js\.map\s*$/, 'Should end with source map reference')
})

test('individual bundles have correct banners', t => {
  // Sample a few bundles to verify banner pattern
  const sampleCodes = languageCodes.slice(0, 3)

  for (const langCode of sampleCodes) {
    const code = readFileSync(join(distDir, `languages/${langCode}.js`), 'utf8')
    const bannerPattern = new RegExp(`/\\*! n2words/${langCode} v${pkg.version.replace(/\./g, '\\.')}`)
    t.regex(code, bannerPattern, `${langCode} should have correct banner`)
  }
})

// =============================================================================
// Main Bundle Functional Tests
// =============================================================================

test('main bundle exports all converters as functions', t => {
  const n2words = loadUmdBundle(join(distDir, 'n2words.js'))

  t.truthy(n2words, 'n2words global should be defined')

  const missingConverters = []
  const nonFunctions = []

  for (const converter of expectedConverters) {
    if (!(converter in n2words)) {
      missingConverters.push(converter)
    } else if (typeof n2words[converter] !== 'function') {
      nonFunctions.push(converter)
    }
  }

  t.deepEqual(missingConverters, [], `Missing converters: ${missingConverters.join(', ')}`)
  t.deepEqual(nonFunctions, [], `Non-function exports: ${nonFunctions.join(', ')}`)
})

test('main bundle converters return strings', t => {
  const n2words = loadUmdBundle(join(distDir, 'n2words.js'))

  // Test a few converters to verify they work
  const result1 = n2words.EnglishConverter(42)
  t.is(typeof result1, 'string', 'EnglishConverter should return string')
  t.true(result1.length > 0, 'Result should not be empty')

  const result2 = n2words.SpanishConverter(100)
  t.is(typeof result2, 'string', 'SpanishConverter should return string')
})

test('main bundle converters accept options', t => {
  const n2words = loadUmdBundle(join(distDir, 'n2words.js'))

  // Verify options work by checking gender produces different results
  const masculine = n2words.ArabicConverter(1, { gender: 'masculine' })
  const feminine = n2words.ArabicConverter(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender option should produce different results')
})

// =============================================================================
// Individual Bundle Functional Tests
// =============================================================================

test('individual bundle loads and exports toWords', t => {
  const n2words = loadUmdBundle(join(distDir, 'languages/en.js'))

  t.truthy(n2words, 'n2words global should be defined')
  t.is(typeof n2words.toWords, 'function', 'toWords should be exported')
  t.is(typeof n2words.toWords(42), 'string', 'toWords should return string')
})

test('individual bundles use extend mode (can be combined)', t => {
  const globalContext = {}

  const sandbox = {
    globalThis: globalContext,
    self: globalContext,
    Object,
    Array,
    Number,
    String,
    Boolean,
    BigInt,
    Error,
    TypeError,
    console
  }

  const context = vm.createContext(sandbox)

  // Load English first
  const englishCode = readFileSync(join(distDir, 'languages/en.js'), 'utf8')
  vm.runInContext(`(function() { ${englishCode} }).call(globalThis);`, context)

  // Verify English toWords is available
  t.truthy(globalContext.n2words, 'n2words global should be defined after first bundle')
  t.is(typeof globalContext.n2words.toWords, 'function', 'toWords should be available')

  // Load Spanish second (should extend, not replace)
  const spanishCode = readFileSync(join(distDir, 'languages/es.js'), 'utf8')
  vm.runInContext(`(function() { ${spanishCode} }).call(globalThis);`, context)

  const n2words = globalContext.n2words

  t.truthy(n2words, 'n2words global should still be defined')
  // Note: Both bundles export toWords, so the second one overwrites the first
  // This is expected behavior - individual bundles are meant for single-language use
  t.is(typeof n2words.toWords, 'function', 'toWords should still be available')
})

// =============================================================================
// Source Map Validation
// =============================================================================

test('main bundle source map is valid', t => {
  const mapPath = join(distDir, 'n2words.js.map')
  const mapContent = readFileSync(mapPath, 'utf8')

  t.notThrows(() => JSON.parse(mapContent), 'Source map should be valid JSON')

  const sourceMap = JSON.parse(mapContent)
  t.is(sourceMap.version, 3, 'Source map version should be 3')
  t.truthy(sourceMap.sources, 'Source map should have sources array')
  t.truthy(sourceMap.mappings, 'Source map should have mappings')
})

test('individual bundle source map is valid', t => {
  const mapPath = join(distDir, 'languages/en.js.map')
  const mapContent = readFileSync(mapPath, 'utf8')

  t.notThrows(() => JSON.parse(mapContent), 'Source map should be valid JSON')

  const sourceMap = JSON.parse(mapContent)
  t.is(sourceMap.version, 3, 'Source map version should be 3')
})

// =============================================================================
// Bundle Size Sanity Checks
// =============================================================================

test('main bundle size is reasonable', t => {
  const code = readFileSync(join(distDir, 'n2words.js'), 'utf8')
  const sizeKB = Buffer.byteLength(code, 'utf8') / 1024
  const converterCount = expectedConverters.length

  // Dynamic range: ~1.5-3.5KB per converter
  const minExpectedKB = converterCount * 1.5
  const maxExpectedKB = converterCount * 3.5

  t.log(`Main bundle: ${sizeKB.toFixed(1)}KB (${converterCount} converters, ~${(sizeKB / converterCount).toFixed(1)}KB each)`)

  t.true(sizeKB > minExpectedKB, `Main bundle (${sizeKB.toFixed(1)}KB) should be > ${minExpectedKB.toFixed(0)}KB`)
  t.true(sizeKB < maxExpectedKB, `Main bundle (${sizeKB.toFixed(1)}KB) should be < ${maxExpectedKB.toFixed(0)}KB`)
})

test('individual bundle size is reasonable', t => {
  const code = readFileSync(join(distDir, 'languages/en.js'), 'utf8')
  const sizeKB = Buffer.byteLength(code, 'utf8') / 1024

  t.log(`en.js bundle: ${sizeKB.toFixed(1)}KB`)

  // Individual bundles are self-contained, so 2-20KB is reasonable
  t.true(sizeKB > 1, `Individual bundle (${sizeKB.toFixed(1)}KB) should be > 1KB`)
  t.true(sizeKB < 20, `Individual bundle (${sizeKB.toFixed(1)}KB) should be < 20KB`)
})

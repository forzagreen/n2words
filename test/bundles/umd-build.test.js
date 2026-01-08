/**
 * UMD Build Output Validation Tests
 *
 * Tests the UMD bundles in dist/ to ensure:
 * - All expected files are generated
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
import { normalizeCode } from '../utils/language-helpers.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '../../dist')
const require = createRequire(import.meta.url)
const pkg = require('../../package.json')

// Get all language codes from the languages directory
const languagesDir = join(__dirname, '../../lib/languages')
const languageCodes = readdirSync(languagesDir)
  .filter(file => file.endsWith('.js'))
  .map(file => file.replace('.js', ''))

// Expected exports are normalized BCP 47 codes (e.g., 'en', 'zhHans', 'frBE')
const expectedExports = languageCodes.map(normalizeCode).sort()

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

test('main UMD bundle exists', t => {
  t.true(existsSync(join(distDir, 'n2words.umd.cjs')), 'Main UMD bundle should exist')
})

test('all individual UMD language bundles exist', t => {
  const missingBundles = []

  for (const langCode of languageCodes) {
    if (!existsSync(join(distDir, `languages/${langCode}.umd.cjs`))) {
      missingBundles.push(langCode)
    }
  }

  t.deepEqual(missingBundles, [], `Missing bundles: ${missingBundles.join(', ')}`)
})

// =============================================================================
// Bundle Structure Tests
// =============================================================================

test('main UMD bundle has correct banner with version', t => {
  const code = readFileSync(join(distDir, 'n2words.umd.cjs'), 'utf8')
  const bannerPattern = new RegExp(`/\\*! n2words v${pkg.version.replace(/\./g, '\\.')} \\| MIT License`)
  t.regex(code, bannerPattern, 'Banner should contain correct version')
})

test('main UMD bundle has UMD wrapper pattern', t => {
  const code = readFileSync(join(distDir, 'n2words.umd.cjs'), 'utf8')

  t.regex(code, /typeof exports/, 'Should check for CommonJS exports')
  t.regex(code, /typeof define/, 'Should check for AMD define')
  t.regex(code, /globalThis/, 'Should reference globalThis for browser global')
})

test('individual UMD bundles have correct banners', t => {
  // Sample a few bundles to verify banner pattern
  const sampleCodes = languageCodes.slice(0, 3)

  for (const langCode of sampleCodes) {
    const code = readFileSync(join(distDir, `languages/${langCode}.umd.cjs`), 'utf8')
    const bannerPattern = new RegExp(`/\\*! n2words/${langCode} v${pkg.version.replace(/\./g, '\\.')}`)
    t.regex(code, bannerPattern, `${langCode} should have correct banner`)
  }
})

// =============================================================================
// Main Bundle Functional Tests
// =============================================================================

test('main UMD bundle exports all converters as functions', t => {
  const n2words = loadUmdBundle(join(distDir, 'n2words.umd.cjs'))

  t.truthy(n2words, 'n2words global should be defined')

  const missingExports = []
  const nonFunctions = []

  for (const name of expectedExports) {
    if (!(name in n2words)) {
      missingExports.push(name)
    } else if (typeof n2words[name] !== 'function') {
      nonFunctions.push(name)
    }
  }

  t.deepEqual(missingExports, [], `Missing exports: ${missingExports.join(', ')}`)
  t.deepEqual(nonFunctions, [], `Non-function exports: ${nonFunctions.join(', ')}`)
})

test('main UMD bundle converters return strings', t => {
  const n2words = loadUmdBundle(join(distDir, 'n2words.umd.cjs'))

  // Test a few converters to verify they work
  const result1 = n2words.en(42)
  t.is(typeof result1, 'string', 'en should return string')
  t.true(result1.length > 0, 'Result should not be empty')

  const result2 = n2words.es(100)
  t.is(typeof result2, 'string', 'es should return string')

  const result3 = n2words.zhHans(42)
  t.is(typeof result3, 'string', 'zhHans should return string')
})

test('main UMD bundle converters accept options', t => {
  const n2words = loadUmdBundle(join(distDir, 'n2words.umd.cjs'))

  // Verify options work by checking gender produces different results
  const masculine = n2words.ar(1, { gender: 'masculine' })
  const feminine = n2words.ar(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender option should produce different results')
})

// =============================================================================
// Individual Bundle Functional Tests
// =============================================================================

test('individual UMD bundle loads and exports language-specific function', t => {
  const n2words = loadUmdBundle(join(distDir, 'languages/en.umd.cjs'))

  t.truthy(n2words, 'n2words global should be defined')
  t.is(typeof n2words.en, 'function', 'en should be exported')
  t.is(typeof n2words.en(42), 'string', 'en should return string')
})

test('individual UMD bundles use extend mode (can be combined)', t => {
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
  const englishCode = readFileSync(join(distDir, 'languages/en.umd.cjs'), 'utf8')
  vm.runInContext(`(function() { ${englishCode} }).call(globalThis);`, context)

  // Verify English is available
  t.truthy(globalContext.n2words, 'n2words global should be defined after first bundle')
  t.is(typeof globalContext.n2words.en, 'function', 'en should be available')

  // Load Spanish second (should extend, not replace)
  const spanishCode = readFileSync(join(distDir, 'languages/es.umd.cjs'), 'utf8')
  vm.runInContext(`(function() { ${spanishCode} }).call(globalThis);`, context)

  const n2words = globalContext.n2words

  t.truthy(n2words, 'n2words global should still be defined')
  // Both languages should be available - they export different functions (en, es)
  t.is(typeof n2words.en, 'function', 'en should still be available after loading es')
  t.is(typeof n2words.es, 'function', 'es should be available')

  // Verify both work correctly
  t.is(n2words.en(42), 'forty-two', 'en should convert correctly')
  t.is(n2words.es(42), 'cuarenta y dos', 'es should convert correctly')
})

// =============================================================================
// Bundle Size Sanity Checks
// =============================================================================

test('main UMD bundle size is reasonable', t => {
  const code = readFileSync(join(distDir, 'n2words.umd.cjs'), 'utf8')
  const sizeKB = Buffer.byteLength(code, 'utf8') / 1024
  const exportCount = expectedExports.length

  // Dynamic range: ~1.5-3.5KB per language
  const minExpectedKB = exportCount * 1.5
  const maxExpectedKB = exportCount * 3.5

  t.log(`Main UMD bundle: ${sizeKB.toFixed(1)}KB (${exportCount} languages, ~${(sizeKB / exportCount).toFixed(1)}KB each)`)

  t.true(sizeKB > minExpectedKB, `Main bundle (${sizeKB.toFixed(1)}KB) should be > ${minExpectedKB.toFixed(0)}KB`)
  t.true(sizeKB < maxExpectedKB, `Main bundle (${sizeKB.toFixed(1)}KB) should be < ${maxExpectedKB.toFixed(0)}KB`)
})

test('individual UMD bundle size is reasonable', t => {
  const code = readFileSync(join(distDir, 'languages/en.umd.cjs'), 'utf8')
  const sizeKB = Buffer.byteLength(code, 'utf8') / 1024

  t.log(`en.umd.cjs bundle: ${sizeKB.toFixed(1)}KB`)

  // Individual bundles are self-contained, so 2-20KB is reasonable
  t.true(sizeKB > 1, `Individual bundle (${sizeKB.toFixed(1)}KB) should be > 1KB`)
  t.true(sizeKB < 20, `Individual bundle (${sizeKB.toFixed(1)}KB) should be < 20KB`)
})

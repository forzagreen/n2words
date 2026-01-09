/**
 * UMD Build Output Validation Tests
 *
 * Tests the UMD bundles in dist/languages/ to ensure:
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

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '../../dist')
const require = createRequire(import.meta.url)
const pkg = require('../../package.json')

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

test('all individual UMD language bundles exist', t => {
  const missingBundles = []

  for (const langCode of languageCodes) {
    if (!existsSync(join(distDir, `languages/${langCode}.umd.js`))) {
      missingBundles.push(langCode)
    }
  }

  t.deepEqual(missingBundles, [], `Missing bundles: ${missingBundles.join(', ')}`)
})

// =============================================================================
// Bundle Structure Tests
// =============================================================================

test('individual UMD bundles have correct banners', t => {
  // Sample a few bundles to verify banner pattern
  const sampleCodes = languageCodes.slice(0, 3)

  for (const langCode of sampleCodes) {
    const code = readFileSync(join(distDir, `languages/${langCode}.umd.js`), 'utf8')
    const bannerPattern = new RegExp(`/\\*! n2words/${langCode} v${pkg.version.replace(/\./g, '\\.')}`)
    t.regex(code, bannerPattern, `${langCode} should have correct banner`)
  }
})

// =============================================================================
// Individual Bundle Functional Tests
// =============================================================================

test('individual UMD bundle loads and exports language-specific function', t => {
  const n2words = loadUmdBundle(join(distDir, 'languages/en.umd.js'))

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
  const englishCode = readFileSync(join(distDir, 'languages/en.umd.js'), 'utf8')
  vm.runInContext(`(function() { ${englishCode} }).call(globalThis);`, context)

  // Verify English is available
  t.truthy(globalContext.n2words, 'n2words global should be defined after first bundle')
  t.is(typeof globalContext.n2words.en, 'function', 'en should be available')

  // Load Spanish second (should extend, not replace)
  const spanishCode = readFileSync(join(distDir, 'languages/es.umd.js'), 'utf8')
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

test('individual UMD bundle size is reasonable', t => {
  const code = readFileSync(join(distDir, 'languages/en.umd.js'), 'utf8')
  const sizeKB = Buffer.byteLength(code, 'utf8') / 1024

  t.log(`en.umd.js bundle: ${sizeKB.toFixed(1)}KB`)

  // Individual bundles are self-contained, so 1-20KB is reasonable
  t.true(sizeKB > 1, `Individual bundle (${sizeKB.toFixed(1)}KB) should be > 1KB`)
  t.true(sizeKB < 20, `Individual bundle (${sizeKB.toFixed(1)}KB) should be < 20KB`)
})

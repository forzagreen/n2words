/**
 * UMD Build Output Validation Tests
 *
 * Tests the UMD bundles in dist/ to ensure:
 * - All expected files are generated
 * - Bundles have correct UMD structure
 * - Converters work correctly when loaded
 * - Source maps are generated
 * - Individual converter bundles are functional
 */

import test from 'ava'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import vm from 'node:vm'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '../../dist')
const require = createRequire(import.meta.url)
const pkg = require('../../package.json')

// Dynamically get all converters from the n2words entry point
// This ensures the test stays in sync with the actual exports
const n2words = require('../../lib/n2words.js')
const expectedConverters = Object.keys(n2words)
  .filter(name => name.endsWith('Converter'))
  .sort()

// Sample conversions for validation (subset of languages)
// Uses explicit options where applicable to avoid dependency on defaults
const sampleConversions = [
  { converter: 'EnglishConverter', input: 42, expected: 'forty-two' },
  { converter: 'SpanishConverter', input: 100, expected: 'cien' },
  { converter: 'FrenchConverter', input: 21, expected: 'vingt et un' },
  { converter: 'GermanConverter', input: 99, expected: 'neunundneunzig' },
  { converter: 'JapaneseConverter', input: 1000, expected: '千' },
  { converter: 'ArabicConverter', input: 1, expected: 'واحد' },
  { converter: 'RussianConverter', input: 5, expected: 'пять' },
  { converter: 'SimplifiedChineseConverter', input: 10, expected: '壹拾', options: { formal: true } }
]

/**
 * Load UMD bundle into a sandboxed context and return the n2words global
 *
 * The UMD pattern used by rollup is:
 * (function(global, factory) {
 *   typeof exports === 'object' && typeof module !== 'undefined'
 *     ? factory(exports)                              // CommonJS
 *     : typeof define === 'function' && define.amd
 *       ? define(['exports'], factory)                // AMD
 *       : factory((global.n2words = global.n2words || {}))  // Browser global
 * })(this, function(exports) { ... })
 *
 * We simulate the browser global case by:
 * 1. Not providing exports/module (so CommonJS check fails)
 * 2. Not providing define (so AMD check fails)
 * 3. Providing a global context that receives n2words
 */
function loadUmdBundle (bundlePath) {
  const code = readFileSync(bundlePath, 'utf8')

  // Create a browser-like global context
  // The UMD wrapper uses `this` which becomes the global in browser context
  const globalContext = {}

  // Create sandbox simulating browser environment (no exports, no define)
  // We include Object, Array, etc. from the main context so that isPlainObject
  // checks work correctly (objects created here share the same prototypes)
  const sandbox = {
    // `this` in the IIFE will be globalContext
    // globalThis is the modern way to access global
    globalThis: globalContext,
    // self is used as fallback in some UMD patterns
    self: globalContext,
    // Provide built-in constructors so prototype checks work
    Object,
    Array,
    Number,
    String,
    Boolean,
    BigInt,
    Error,
    TypeError,
    // console for debugging
    console
  }

  // The key insight: rollup's UMD uses (this, function...) where `this` is the global
  // In vm context, we need to set up the context so the IIFE's `this` resolves correctly
  const context = vm.createContext(sandbox)

  // Wrap the code to ensure `this` at the top level is our globalContext
  // The UMD pattern is: (function(e,t){...})(this, function(e){...})
  // We need `this` to be globalContext
  const wrappedCode = `(function() { ${code} }).call(globalThis);`

  vm.runInContext(wrappedCode, context)

  return globalContext.n2words
}

// =============================================================================
// File Existence Tests
// =============================================================================

test('main bundle exists (dist/n2words.js)', t => {
  const bundlePath = join(distDir, 'n2words.js')
  t.true(existsSync(bundlePath), 'Main bundle should exist')
})

test('main bundle source map exists (dist/n2words.js.map)', t => {
  const mapPath = join(distDir, 'n2words.js.map')
  t.true(existsSync(mapPath), 'Main bundle source map should exist')
})

for (const converter of expectedConverters) {
  test(`individual bundle exists (dist/${converter}.js)`, t => {
    const bundlePath = join(distDir, `${converter}.js`)
    t.true(existsSync(bundlePath), `${converter} bundle should exist`)
  })

  test(`individual bundle source map exists (dist/${converter}.js.map)`, t => {
    const mapPath = join(distDir, `${converter}.js.map`)
    t.true(existsSync(mapPath), `${converter} source map should exist`)
  })
}

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

  // UMD pattern checks for CommonJS, AMD, and global assignment
  t.regex(code, /typeof exports/, 'Should check for CommonJS exports')
  t.regex(code, /typeof define/, 'Should check for AMD define')
  t.regex(code, /globalThis/, 'Should reference globalThis for browser global')
})

test('main bundle ends with source map reference', t => {
  const code = readFileSync(join(distDir, 'n2words.js'), 'utf8')
  t.regex(code, /\/\/# sourceMappingURL=n2words\.js\.map\s*$/, 'Should end with source map reference')
})

for (const converter of expectedConverters.slice(0, 5)) {
  test(`${converter} bundle has correct banner`, t => {
    const code = readFileSync(join(distDir, `${converter}.js`), 'utf8')
    const bannerPattern = new RegExp(`/\\*! n2words/${converter} v${pkg.version.replace(/\./g, '\\.')}`)
    t.regex(code, bannerPattern, 'Individual bundle should have converter-specific banner')
  })
}

// =============================================================================
// Main Bundle Functional Tests
// =============================================================================

test('main bundle exports all converters', t => {
  const n2words = loadUmdBundle(join(distDir, 'n2words.js'))

  t.truthy(n2words, 'n2words global should be defined')

  for (const converter of expectedConverters) {
    t.is(typeof n2words[converter], 'function', `${converter} should be a function`)
  }
})

test('main bundle converter count matches expected', t => {
  const n2words = loadUmdBundle(join(distDir, 'n2words.js'))
  const exportedConverters = Object.keys(n2words).filter(k => k.endsWith('Converter'))

  t.is(exportedConverters.length, expectedConverters.length, 'Should export correct number of converters')
})

for (const { converter, input, expected, options } of sampleConversions) {
  test(`main bundle: ${converter}(${input}) returns correct value`, t => {
    const n2words = loadUmdBundle(join(distDir, 'n2words.js'))
    const result = n2words[converter](input, options)
    t.is(result, expected)
  })
}

test('main bundle supports BigInt input', t => {
  const n2words = loadUmdBundle(join(distDir, 'n2words.js'))
  const result = n2words.EnglishConverter(1000000n)
  t.is(result, 'one million')
})

test('main bundle supports string input', t => {
  const n2words = loadUmdBundle(join(distDir, 'n2words.js'))
  const result = n2words.EnglishConverter('123')
  t.is(result, 'one hundred and twenty-three')
})

test('main bundle supports negative numbers', t => {
  const n2words = loadUmdBundle(join(distDir, 'n2words.js'))
  const result = n2words.EnglishConverter(-42)
  t.is(result, 'minus forty-two')
})

test('main bundle supports decimal numbers', t => {
  const n2words = loadUmdBundle(join(distDir, 'n2words.js'))
  const result = n2words.EnglishConverter(3.14)
  t.is(result, 'three point fourteen')
})

test('main bundle supports options (Arabic gender)', t => {
  const n2words = loadUmdBundle(join(distDir, 'n2words.js'))
  const masculine = n2words.ArabicConverter(1, { gender: 'masculine' })
  const feminine = n2words.ArabicConverter(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender option should produce different results')
})

test('main bundle throws on invalid input', t => {
  const n2words = loadUmdBundle(join(distDir, 'n2words.js'))

  // Check that invalid inputs throw with appropriate messages
  // Note: We check message content rather than instanceof because
  // Error constructors from VM context differ from main context
  const nullError = t.throws(() => n2words.EnglishConverter(null))
  t.regex(nullError.message, /Invalid value type|expected number, string, or bigint/)

  const nanError = t.throws(() => n2words.EnglishConverter('not a number'))
  t.regex(nanError.message, /Invalid number format/)

  const infinityError = t.throws(() => n2words.EnglishConverter(Infinity))
  t.regex(infinityError.message, /must be finite|NaN and Infinity/)
})

// =============================================================================
// Individual Bundle Functional Tests
// =============================================================================

test('individual EnglishConverter bundle works correctly', t => {
  const n2words = loadUmdBundle(join(distDir, 'EnglishConverter.js'))

  t.truthy(n2words, 'n2words global should be defined')
  t.is(typeof n2words.EnglishConverter, 'function', 'EnglishConverter should be exported')
  t.is(n2words.EnglishConverter(42), 'forty-two')
})

test('individual SpanishConverter bundle works correctly', t => {
  const n2words = loadUmdBundle(join(distDir, 'SpanishConverter.js'))

  t.truthy(n2words, 'n2words global should be defined')
  t.is(typeof n2words.SpanishConverter, 'function', 'SpanishConverter should be exported')
  t.is(n2words.SpanishConverter(100), 'cien')
})

test('individual ArabicConverter bundle supports options', t => {
  const n2words = loadUmdBundle(join(distDir, 'ArabicConverter.js'))

  t.truthy(n2words, 'n2words global should be defined')
  t.is(typeof n2words.ArabicConverter, 'function', 'ArabicConverter should be exported')

  const masculine = n2words.ArabicConverter(1, { gender: 'masculine' })
  const feminine = n2words.ArabicConverter(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender option should work in individual bundle')
})

test('individual bundles use extend mode (can be combined)', t => {
  // Simulate loading multiple individual bundles into the same context
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
  const englishCode = readFileSync(join(distDir, 'EnglishConverter.js'), 'utf8')
  const wrappedEnglish = `(function() { ${englishCode} }).call(globalThis);`
  vm.runInContext(wrappedEnglish, context)

  // Load Spanish second (should extend, not replace)
  const spanishCode = readFileSync(join(distDir, 'SpanishConverter.js'), 'utf8')
  const wrappedSpanish = `(function() { ${spanishCode} }).call(globalThis);`
  vm.runInContext(wrappedSpanish, context)

  const n2words = globalContext.n2words

  // Both should be available
  t.truthy(n2words, 'n2words global should be defined')
  t.is(typeof n2words.EnglishConverter, 'function', 'EnglishConverter should still be available')
  t.is(typeof n2words.SpanishConverter, 'function', 'SpanishConverter should be added')
  t.is(n2words.EnglishConverter(42), 'forty-two')
  t.is(n2words.SpanishConverter(42), 'cuarenta y dos')
})

// =============================================================================
// Source Map Validation
// =============================================================================

test('main bundle source map is valid JSON', t => {
  const mapPath = join(distDir, 'n2words.js.map')
  const mapContent = readFileSync(mapPath, 'utf8')

  t.notThrows(() => JSON.parse(mapContent), 'Source map should be valid JSON')

  const sourceMap = JSON.parse(mapContent)
  t.is(sourceMap.version, 3, 'Source map version should be 3')
  t.truthy(sourceMap.sources, 'Source map should have sources array')
  t.truthy(sourceMap.mappings, 'Source map should have mappings')
})

test('individual bundle source maps are valid JSON', t => {
  const mapPath = join(distDir, 'EnglishConverter.js.map')
  const mapContent = readFileSync(mapPath, 'utf8')

  t.notThrows(() => JSON.parse(mapContent), 'Source map should be valid JSON')

  const sourceMap = JSON.parse(mapContent)
  t.is(sourceMap.version, 3, 'Source map version should be 3')
})

// =============================================================================
// Bundle Size Sanity Checks
// =============================================================================
//
// These tests verify bundles are non-empty and haven't grown unexpectedly.
// Size ranges are based on ~2KB per converter for the main bundle.
// If these fail after adding converters, update the expected ranges.

test('main bundle size is reasonable', t => {
  const code = readFileSync(join(distDir, 'n2words.js'), 'utf8')
  const sizeKB = Buffer.byteLength(code, 'utf8') / 1024
  const converterCount = expectedConverters.length

  // Dynamic range: ~1.5-3KB per converter, with some baseline overhead
  const minExpectedKB = converterCount * 1.5
  const maxExpectedKB = converterCount * 3.5

  t.log(`Main bundle: ${sizeKB.toFixed(1)}KB (${converterCount} converters, ~${(sizeKB / converterCount).toFixed(1)}KB each)`)

  t.true(sizeKB > minExpectedKB, `Main bundle (${sizeKB.toFixed(1)}KB) should be > ${minExpectedKB.toFixed(0)}KB for ${converterCount} converters`)
  t.true(sizeKB < maxExpectedKB, `Main bundle (${sizeKB.toFixed(1)}KB) should be < ${maxExpectedKB.toFixed(0)}KB - possible bloat or duplicate code`)
})

test('individual bundle sizes are reasonable', t => {
  const code = readFileSync(join(distDir, 'EnglishConverter.js'), 'utf8')
  const sizeKB = Buffer.byteLength(code, 'utf8') / 1024

  t.log(`EnglishConverter bundle: ${sizeKB.toFixed(1)}KB`)

  // Individual bundles include base class code, so 2-20KB is reasonable
  t.true(sizeKB > 1, `Individual bundle (${sizeKB.toFixed(1)}KB) should be > 1KB (not empty)`)
  t.true(sizeKB < 20, `Individual bundle (${sizeKB.toFixed(1)}KB) should be < 20KB (not bloated)`)
})

/**
 * ESM Build Output Validation Tests
 *
 * Tests the ESM bundles in dist/ to ensure:
 * - All expected files are generated
 * - Bundles have correct ESM structure (export statements)
 * - Bundles can be dynamically imported and export working converters
 * - Bundle sizes are reasonable
 *
 * Note: These tests verify build output structure and loadability.
 * Conversion correctness is tested in integration/languages.test.js.
 */

import test from 'ava'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
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

// =============================================================================
// File Existence Tests
// =============================================================================

test('main ESM bundle exists', t => {
  t.true(existsSync(join(distDir, 'n2words.js')), 'Main ESM bundle should exist')
})

test('all individual ESM language bundles exist', t => {
  const missingBundles = []

  for (const langCode of languageCodes) {
    if (!existsSync(join(distDir, `languages/${langCode}.js`))) {
      missingBundles.push(langCode)
    }
  }

  t.deepEqual(missingBundles, [], `Missing bundles: ${missingBundles.join(', ')}`)
})

// =============================================================================
// Bundle Structure Tests
// =============================================================================

test('main ESM bundle has correct banner with version', t => {
  const code = readFileSync(join(distDir, 'n2words.js'), 'utf8')
  const bannerPattern = new RegExp(`/\\*! n2words v${pkg.version.replace(/\./g, '\\.')} \\| MIT License`)
  t.regex(code, bannerPattern, 'Banner should contain correct version')
})

test('main ESM bundle has ES module structure', t => {
  const code = readFileSync(join(distDir, 'n2words.js'), 'utf8')

  // ESM uses export statements, not UMD wrapper
  t.regex(code, /export\s*\{/, 'Should have ES module export statement')
  t.notRegex(code, /typeof exports.*===.*"object"/, 'Should NOT have CommonJS check (UMD pattern)')
})

test('individual ESM bundles have correct banners', t => {
  // Sample a few bundles to verify banner pattern
  const sampleCodes = languageCodes.slice(0, 3)

  for (const langCode of sampleCodes) {
    const code = readFileSync(join(distDir, `languages/${langCode}.js`), 'utf8')
    const bannerPattern = new RegExp(`/\\*! n2words/${langCode} v${pkg.version.replace(/\./g, '\\.')}`)
    t.regex(code, bannerPattern, `${langCode} should have correct banner`)
  }
})

test('individual ESM bundles have ES module structure', t => {
  const code = readFileSync(join(distDir, 'languages/en.js'), 'utf8')

  t.regex(code, /export\s*\{/, 'Should have ES module export statement')
  t.notRegex(code, /typeof exports.*===.*"object"/, 'Should NOT have CommonJS check')
})

// =============================================================================
// Main Bundle Functional Tests
// =============================================================================

test('main ESM bundle can be dynamically imported', async t => {
  const bundlePath = pathToFileURL(join(distDir, 'n2words.js')).href
  const n2words = await import(bundlePath)

  t.truthy(n2words, 'n2words module should be importable')

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

test('main ESM bundle converters return strings', async t => {
  const bundlePath = pathToFileURL(join(distDir, 'n2words.js')).href
  const n2words = await import(bundlePath)

  // Test a few converters to verify they work
  const result1 = n2words.en(42)
  t.is(typeof result1, 'string', 'en should return string')
  t.true(result1.length > 0, 'Result should not be empty')

  const result2 = n2words.es(100)
  t.is(typeof result2, 'string', 'es should return string')

  const result3 = n2words.zhHans(42)
  t.is(typeof result3, 'string', 'zhHans should return string')
})

test('main ESM bundle converters accept options', async t => {
  const bundlePath = pathToFileURL(join(distDir, 'n2words.js')).href
  const n2words = await import(bundlePath)

  // Verify options work by checking gender produces different results
  const masculine = n2words.ar(1, { gender: 'masculine' })
  const feminine = n2words.ar(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender option should produce different results')
})

// =============================================================================
// Individual Bundle Functional Tests
// =============================================================================

test('individual ESM bundle can be dynamically imported', async t => {
  const bundlePath = pathToFileURL(join(distDir, 'languages/en.js')).href
  const enModule = await import(bundlePath)

  t.truthy(enModule, 'en module should be importable')
  t.is(typeof enModule.en, 'function', 'en should be exported')
  t.is(typeof enModule.en(42), 'string', 'en should return string')
})

test('individual ESM bundles export correct language function', async t => {
  // Test a few languages
  const testCases = [
    { langCode: 'en', normalizedName: 'en' },
    { langCode: 'es', normalizedName: 'es' },
    { langCode: 'zh-Hans', normalizedName: 'zhHans' },
    { langCode: 'fr-BE', normalizedName: 'frBE' }
  ]

  for (const { langCode, normalizedName } of testCases) {
    if (!languageCodes.includes(langCode)) continue

    const bundlePath = pathToFileURL(join(distDir, `languages/${langCode}.js`)).href
    const langModule = await import(bundlePath)

    t.is(typeof langModule[normalizedName], 'function', `${langCode} should export ${normalizedName}`)
  }
})

// =============================================================================
// Bundle Size Sanity Checks
// =============================================================================

test('main ESM bundle size is reasonable', t => {
  const code = readFileSync(join(distDir, 'n2words.js'), 'utf8')
  const sizeKB = Buffer.byteLength(code, 'utf8') / 1024
  const exportCount = expectedExports.length

  // Dynamic range: ~1.5-3.5KB per language
  const minExpectedKB = exportCount * 1.5
  const maxExpectedKB = exportCount * 3.5

  t.log(`Main ESM bundle: ${sizeKB.toFixed(1)}KB (${exportCount} languages, ~${(sizeKB / exportCount).toFixed(1)}KB each)`)

  t.true(sizeKB > minExpectedKB, `Main bundle (${sizeKB.toFixed(1)}KB) should be > ${minExpectedKB.toFixed(0)}KB`)
  t.true(sizeKB < maxExpectedKB, `Main bundle (${sizeKB.toFixed(1)}KB) should be < ${maxExpectedKB.toFixed(0)}KB`)
})

test('individual ESM bundle size is reasonable', t => {
  const code = readFileSync(join(distDir, 'languages/en.js'), 'utf8')
  const sizeKB = Buffer.byteLength(code, 'utf8') / 1024

  t.log(`en.js ESM bundle: ${sizeKB.toFixed(1)}KB`)

  // Individual bundles are self-contained, so 2-20KB is reasonable
  t.true(sizeKB > 1, `Individual bundle (${sizeKB.toFixed(1)}KB) should be > 1KB`)
  t.true(sizeKB < 20, `Individual bundle (${sizeKB.toFixed(1)}KB) should be < 20KB`)
})

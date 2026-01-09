/**
 * ESM Build Output Validation Tests
 *
 * Tests the individual ESM bundles in dist/ to ensure:
 * - All expected files are generated
 * - Bundles have correct ESM structure (export statements)
 * - Bundles can be dynamically imported and export toWords function
 * - Bundle sizes are reasonable
 *
 * Note: Main ESM bundle is not generated - use index.js directly for
 * Node.js ESM imports (tree-shakable). Individual dist bundles are for browsers.
 *
 * Conversion correctness is tested in integration/languages.test.js.
 */

import test from 'ava'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '../../dist')
const require = createRequire(import.meta.url)
const pkg = require('../../package.json')

// Get all language codes from the src directory (exclude utils/)
const srcDir = join(__dirname, '../../src')
const languageCodes = readdirSync(srcDir)
  .filter(file => file.endsWith('.js'))
  .map(file => file.replace('.js', ''))

// =============================================================================
// File Existence Tests
// =============================================================================

test('all individual ESM language bundles exist', t => {
  const missingBundles = []

  for (const langCode of languageCodes) {
    if (!existsSync(join(distDir, `${langCode}.js`))) {
      missingBundles.push(langCode)
    }
  }

  t.deepEqual(missingBundles, [], `Missing bundles: ${missingBundles.join(', ')}`)
})

// =============================================================================
// Bundle Structure Tests
// =============================================================================

test('individual ESM bundles have correct banners', t => {
  // Sample a few bundles to verify banner pattern
  const sampleCodes = languageCodes.slice(0, 3)

  for (const langCode of sampleCodes) {
    const code = readFileSync(join(distDir, `${langCode}.js`), 'utf8')
    const bannerPattern = new RegExp(`/\\*! n2words/${langCode} v${pkg.version.replace(/\./g, '\\.')}`)
    t.regex(code, bannerPattern, `${langCode} should have correct banner`)
  }
})

test('individual ESM bundles have ES module structure', t => {
  const code = readFileSync(join(distDir, 'en.js'), 'utf8')

  t.regex(code, /export\s*\{/, 'Should have ES module export statement')
  t.notRegex(code, /typeof exports.*===.*"object"/, 'Should NOT have CommonJS check')
})

// =============================================================================
// Individual Bundle Functional Tests
// =============================================================================

test('individual ESM bundle exports toWords function', async t => {
  const bundlePath = pathToFileURL(join(distDir, 'en.js')).href
  const enModule = await import(bundlePath)

  t.truthy(enModule, 'en module should be importable')
  t.is(typeof enModule.toWords, 'function', 'toWords should be exported')
  t.is(typeof enModule.toWords(42), 'string', 'toWords should return string')
  t.is(enModule.toWords(42), 'forty-two', 'toWords should convert correctly')
})

test('individual ESM bundles all export toWords', async t => {
  // Test a few languages to verify consistent export pattern
  const testCases = ['en', 'es', 'zh-Hans', 'fr-BE']

  for (const langCode of testCases) {
    if (!languageCodes.includes(langCode)) continue

    const bundlePath = pathToFileURL(join(distDir, `${langCode}.js`)).href
    const langModule = await import(bundlePath)

    t.is(typeof langModule.toWords, 'function', `${langCode} should export toWords`)
  }
})

test('individual ESM bundle toWords accepts options', async t => {
  const bundlePath = pathToFileURL(join(distDir, 'ar.js')).href
  const arModule = await import(bundlePath)

  // Verify options work by checking gender produces different results
  const masculine = arModule.toWords(1, { gender: 'masculine' })
  const feminine = arModule.toWords(1, { gender: 'feminine' })
  t.not(masculine, feminine, 'Gender option should produce different results')
})

// =============================================================================
// Bundle Size Sanity Checks
// =============================================================================

test('individual ESM bundle size is reasonable', t => {
  const code = readFileSync(join(distDir, 'en.js'), 'utf8')
  const sizeKB = Buffer.byteLength(code, 'utf8') / 1024

  t.log(`en.js ESM bundle: ${sizeKB.toFixed(1)}KB`)

  // Individual bundles are self-contained, so 1-20KB is reasonable
  t.true(sizeKB > 1, `Individual bundle (${sizeKB.toFixed(1)}KB) should be > 1KB`)
  t.true(sizeKB < 20, `Individual bundle (${sizeKB.toFixed(1)}KB) should be < 20KB`)
})

import test from 'ava'
import { readFileSync } from 'node:fs'
import n2words, * as namedExports from '../../lib/n2words.js'
import { getLanguageCodes, getLanguagesWithOptions, normalizeCode } from '../utils/language-helpers.js'

/**
 * Unit Tests for n2words.js (Public API)
 *
 * Tests the lib/n2words.js module:
 * - Module structure (named exports with normalized BCP 47 codes)
 * - Default export for UMD builds
 * - Converter function behavior
 * - Type rejection (invalid inputs)
 *
 * Note: These tests focus on API structure and behavior only.
 * - Input parsing/validation details → utils/parse-numeric.test.js
 * - Language-specific output → integration/languages.test.js
 */

const n2wordsContent = readFileSync('./lib/n2words.js', 'utf8')

// ============================================================================
// Module Structure
// ============================================================================

test('default export is object with all converters', t => {
  t.is(typeof n2words, 'object')
  t.true(n2words !== null)
})

test('named exports exist for all languages', t => {
  const languageCodes = getLanguageCodes()

  for (const code of languageCodes) {
    const normalizedName = normalizeCode(code)
    t.is(typeof namedExports[normalizedName], 'function', `Missing named export for ${code} (as ${normalizedName})`)
  }
})

test('default export has all normalized language codes', t => {
  const languageCodes = getLanguageCodes()

  for (const code of languageCodes) {
    const normalizedName = normalizeCode(code)
    t.true(normalizedName in n2words, `Missing converter for ${code} (as ${normalizedName})`)
    t.is(typeof n2words[normalizedName], 'function', `${normalizedName} should be a function`)
  }
})

test('converter count matches language file count', t => {
  const languageCount = getLanguageCodes().length
  const converterCount = Object.keys(n2words).length

  t.is(converterCount, languageCount, `Should have ${languageCount} converters`)
})

test('all language files are imported', t => {
  const codes = getLanguageCodes()

  const missingImports = []
  for (const code of codes) {
    const importPattern = new RegExp(`from\\s*['"]\\./languages/${code}\\.js['"]`)
    if (!importPattern.test(n2wordsContent)) {
      missingImports.push(code)
    }
  }

  t.deepEqual(missingImports, [], `Missing imports: ${missingImports.join(', ')}`)
})

test('imports are alphabetically ordered by normalized name', t => {
  const importSection = n2wordsContent.match(/\/\/ Language Imports[\s\S]*?(?=\/\/ ===)/)?.[0]
  if (!importSection) {
    t.fail('No Language Imports section found')
    return
  }

  // Extract normalized import names (e.g., 'as zhHans')
  const imports = [...importSection.matchAll(/as\s+(\w+)\s*\}/g)].map(m => m[1])
  const sorted = [...imports].sort((a, b) => a.localeCompare(b))
  t.deepEqual(imports, sorted, 'Imports should be alphabetically ordered by normalized name')
})

test('named exports are alphabetically ordered', t => {
  const exportsSection = n2wordsContent.match(/export \{\s*([\s\S]*?)\s*\}/)?.[1]
  if (!exportsSection) {
    t.fail('No named exports block found')
    return
  }

  const exports = exportsSection.split(',').map(s => s.trim()).filter(Boolean)
  const sorted = [...exports].sort((a, b) => a.localeCompare(b))
  t.deepEqual(exports, sorted, 'Named exports should be alphabetically ordered')
})

test('default export keys are alphabetically ordered', t => {
  const defaultExportSection = n2wordsContent.match(/export default \{\s*([\s\S]*?)\s*\}/)?.[1]
  if (!defaultExportSection) {
    t.fail('No default export block found')
    return
  }

  const keys = defaultExportSection.split(',').map(s => s.trim()).filter(Boolean)
  const sorted = [...keys].sort((a, b) => a.localeCompare(b))
  t.deepEqual(keys, sorted, 'Default export keys should be alphabetically ordered')
})

// ============================================================================
// Valid Input Types
// ============================================================================

test('accepts number input', t => {
  t.is(typeof n2words.en(42), 'string')
  t.is(typeof n2words.en(0), 'string')
  t.is(typeof n2words.en(-42), 'string')
  t.is(typeof n2words.en(3.14), 'string')
})

test('accepts string input', t => {
  t.is(typeof n2words.en('42'), 'string')
  t.is(typeof n2words.en('0'), 'string')
  t.is(typeof n2words.en('-42'), 'string')
  t.is(typeof n2words.en('3.14'), 'string')
})

test('accepts bigint input', t => {
  t.is(typeof n2words.en(42n), 'string')
  t.is(typeof n2words.en(0n), 'string')
  t.is(typeof n2words.en(-42n), 'string')
})

test('accepts large bigint input', t => {
  const large = BigInt('9'.repeat(50))
  t.is(typeof n2words.en(large), 'string')
  t.is(typeof n2words.en(-large), 'string')
})

// ============================================================================
// Invalid Input Types - Must Reject
// ============================================================================

test('rejects null', t => {
  t.throws(() => n2words.en(null), { instanceOf: TypeError })
})

test('rejects undefined', t => {
  t.throws(() => n2words.en(undefined), { instanceOf: TypeError })
})

test('rejects boolean', t => {
  t.throws(() => n2words.en(true), { instanceOf: TypeError })
  t.throws(() => n2words.en(false), { instanceOf: TypeError })
})

test('rejects object', t => {
  t.throws(() => n2words.en({}), { instanceOf: TypeError })
  t.throws(() => n2words.en({ valueOf: () => 42 }), { instanceOf: TypeError })
})

test('rejects array', t => {
  t.throws(() => n2words.en([]), { instanceOf: TypeError })
  t.throws(() => n2words.en([42]), { instanceOf: TypeError })
})

test('rejects function', t => {
  t.throws(() => n2words.en(() => 42), { instanceOf: TypeError })
})

test('rejects symbol', t => {
  t.throws(() => n2words.en(Symbol('test')), { instanceOf: TypeError })
})

test('rejects NaN', t => {
  t.throws(() => n2words.en(NaN), { instanceOf: Error })
})

test('rejects Infinity', t => {
  t.throws(() => n2words.en(Infinity), { instanceOf: Error })
  t.throws(() => n2words.en(-Infinity), { instanceOf: Error })
})

test('rejects invalid string', t => {
  t.throws(() => n2words.en(''), { instanceOf: Error })
  t.throws(() => n2words.en('abc'), { instanceOf: Error })
  t.throws(() => n2words.en('12abc34'), { instanceOf: Error })
})

// ============================================================================
// Options Parameter
// ============================================================================

test('accepts options parameter', t => {
  t.notThrows(() => n2words.en(42, {}))
  t.notThrows(() => n2words.en(42, { unknownOption: true }))
})

test('options are used by languages that support them', t => {
  t.notThrows(() => n2words.ar(1, { gender: 'feminine' }))
  t.notThrows(() => n2words.tr(123, { dropSpaces: true }))
  t.notThrows(() => n2words.zhHans(1, { formal: true }))
})

test('all languages with options accept options parameter', t => {
  const languagesWithOptions = getLanguagesWithOptions()

  for (const code of languagesWithOptions) {
    const normalizedName = normalizeCode(code)
    const converter = n2words[normalizedName]
    t.truthy(converter, `Missing converter for ${code} (as ${normalizedName})`)
    t.notThrows(() => converter(42, {}), `${normalizedName} should accept options`)
  }
})

// ============================================================================
// Converter Behavior
// ============================================================================

test('converters are stateless - multiple calls return consistent results', t => {
  // Same input always produces same output
  t.is(n2words.en(42), n2words.en(42))
  t.is(n2words.es(42), n2words.es(42))
  t.is(n2words.fr(42), n2words.fr(42))

  // Different inputs don't affect each other
  const before = n2words.en(42)
  n2words.en(999)
  n2words.en(-100)
  const after = n2words.en(42)
  t.is(before, after)
})

test('converters return non-empty strings', t => {
  for (const converter of [n2words.en, n2words.es, n2words.de]) {
    t.true(converter(0).length > 0)
    t.true(converter(1).length > 0)
    t.true(converter(42).length > 0)
    t.true(converter(-1).length > 0)
  }
})

test('all converters handle zero', t => {
  for (const [name, converter] of Object.entries(n2words)) {
    const result = converter(0)
    t.is(typeof result, 'string', `${name}(0) should return string`)
    t.true(result.length > 0, `${name}(0) should return non-empty string`)
  }
})

test('all converters handle positive integers', t => {
  for (const [name, converter] of Object.entries(n2words)) {
    t.is(typeof converter(1), 'string', `${name}(1) should return string`)
    t.is(typeof converter(42), 'string', `${name}(42) should return string`)
    t.is(typeof converter(1000), 'string', `${name}(1000) should return string`)
  }
})

test('all converters handle negative numbers', t => {
  for (const [name, converter] of Object.entries(n2words)) {
    const result = converter(-42)
    t.is(typeof result, 'string', `${name}(-42) should return string`)
    t.true(result.length > 0, `${name}(-42) should return non-empty string`)
  }
})

test('all converters handle large numbers', t => {
  const large = BigInt('9'.repeat(30))

  for (const [name, converter] of Object.entries(n2words)) {
    t.notThrows(() => converter(large), `${name} should handle large numbers`)
  }
})

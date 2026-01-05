import test from 'ava'
import { readFileSync } from 'node:fs'
import * as n2words from '../../lib/n2words.js'
import { getClassName, getConverterName } from '../utils/language-naming.js'
import { getClassNameFromFile, getLanguageCodes, getLanguagesWithOptions } from '../utils/language-helpers.js'

/**
 * Unit Tests for n2words.js (Public API)
 *
 * Tests the lib/n2words.js module:
 * - Module structure (imports, exports, alphabetical ordering)
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

test('all exports are converter functions', t => {
  const exports = Object.keys(n2words)

  t.true(exports.length > 0, 'Should have exports')

  for (const name of exports) {
    t.true(name.endsWith('Converter'), `Export "${name}" should end with "Converter"`)
    t.is(typeof n2words[name], 'function', `${name} should be a function`)
  }
})

test('converter count matches language file count', t => {
  const languageCount = getLanguageCodes().length
  const exportCount = Object.keys(n2words).length

  t.is(exportCount, languageCount, `Should have ${languageCount} converters for ${languageCount} languages`)
})

test('all language converters are imported from language files', t => {
  const codes = getLanguageCodes()

  const missingImports = []
  for (const code of codes) {
    const className = getClassName(code) || getClassNameFromFile(code)
    const converterName = getConverterName(className)
    const importPattern = new RegExp(`import\\s*\\{\\s*toWords\\s+as\\s+${converterName}\\s*\\}\\s*from\\s*['"]\\./languages/${code}\\.js['"]`)
    if (!importPattern.test(n2wordsContent)) {
      missingImports.push(`${converterName} (${code})`)
    }
  }

  t.deepEqual(missingImports, [], `Missing imports: ${missingImports.join(', ')}`)
})

test('language imports are alphabetically ordered by converter name', t => {
  const importSection = n2wordsContent.match(/\/\/ Language Imports[\s\S]*?(?=\/\/ ===)/)?.[0]
  if (!importSection) {
    t.fail('No Language Imports section found')
    return
  }

  const imports = [...importSection.matchAll(/import\s+\{\s*toWords\s+as\s+(\w+)\s*\}/g)].map(m => m[1])
  const sorted = [...imports].sort((a, b) => a.localeCompare(b))
  t.deepEqual(imports, sorted, 'Language imports should be alphabetically ordered by converter name')
})

test('all language converters are exported', t => {
  const codes = getLanguageCodes()
  const exportSection = n2wordsContent.match(/export\s*{([\s\S]*?)}/)?.[1] || ''

  const missingExports = []
  for (const code of codes) {
    const className = getClassName(code) || getClassNameFromFile(code)
    const converterName = getConverterName(className)
    if (!exportSection.includes(converterName)) {
      missingExports.push(`${converterName} (${code})`)
    }
  }

  t.deepEqual(missingExports, [], `Missing exports: ${missingExports.join(', ')}`)
})

test('exports are alphabetically ordered', t => {
  const exportSection = n2wordsContent.match(/export\s*{([\s\S]*?)}/)?.[1]
  if (!exportSection) {
    t.fail('No export section found')
    return
  }

  const exports = exportSection
    .split(',')
    .map(e => e.trim())
    .filter(e => e.length > 0)

  const sorted = [...exports].sort((a, b) => a.localeCompare(b))
  t.deepEqual(exports, sorted, 'Exports should be alphabetically ordered')
})

// ============================================================================
// Valid Input Types
// ============================================================================

test('accepts number input', t => {
  const { EnglishConverter } = n2words
  t.is(typeof EnglishConverter(42), 'string')
  t.is(typeof EnglishConverter(0), 'string')
  t.is(typeof EnglishConverter(-42), 'string')
  t.is(typeof EnglishConverter(3.14), 'string')
})

test('accepts string input', t => {
  const { EnglishConverter } = n2words
  t.is(typeof EnglishConverter('42'), 'string')
  t.is(typeof EnglishConverter('0'), 'string')
  t.is(typeof EnglishConverter('-42'), 'string')
  t.is(typeof EnglishConverter('3.14'), 'string')
})

test('accepts bigint input', t => {
  const { EnglishConverter } = n2words
  t.is(typeof EnglishConverter(42n), 'string')
  t.is(typeof EnglishConverter(0n), 'string')
  t.is(typeof EnglishConverter(-42n), 'string')
})

test('accepts large bigint input', t => {
  const { EnglishConverter } = n2words
  const large = BigInt('9'.repeat(50))
  t.is(typeof EnglishConverter(large), 'string')
  t.is(typeof EnglishConverter(-large), 'string')
})

// ============================================================================
// Invalid Input Types - Must Reject
// ============================================================================

test('rejects null', t => {
  const { EnglishConverter } = n2words
  t.throws(() => EnglishConverter(null), { instanceOf: TypeError })
})

test('rejects undefined', t => {
  const { EnglishConverter } = n2words
  t.throws(() => EnglishConverter(undefined), { instanceOf: TypeError })
})

test('rejects boolean', t => {
  const { EnglishConverter } = n2words
  t.throws(() => EnglishConverter(true), { instanceOf: TypeError })
  t.throws(() => EnglishConverter(false), { instanceOf: TypeError })
})

test('rejects object', t => {
  const { EnglishConverter } = n2words
  t.throws(() => EnglishConverter({}), { instanceOf: TypeError })
  t.throws(() => EnglishConverter({ valueOf: () => 42 }), { instanceOf: TypeError })
})

test('rejects array', t => {
  const { EnglishConverter } = n2words
  t.throws(() => EnglishConverter([]), { instanceOf: TypeError })
  t.throws(() => EnglishConverter([42]), { instanceOf: TypeError })
})

test('rejects function', t => {
  const { EnglishConverter } = n2words
  t.throws(() => EnglishConverter(() => 42), { instanceOf: TypeError })
})

test('rejects symbol', t => {
  const { EnglishConverter } = n2words
  t.throws(() => EnglishConverter(Symbol('test')), { instanceOf: TypeError })
})

test('rejects NaN', t => {
  const { EnglishConverter } = n2words
  t.throws(() => EnglishConverter(NaN), { instanceOf: Error })
})

test('rejects Infinity', t => {
  const { EnglishConverter } = n2words
  t.throws(() => EnglishConverter(Infinity), { instanceOf: Error })
  t.throws(() => EnglishConverter(-Infinity), { instanceOf: Error })
})

test('rejects invalid string', t => {
  const { EnglishConverter } = n2words
  t.throws(() => EnglishConverter(''), { instanceOf: Error })
  t.throws(() => EnglishConverter('abc'), { instanceOf: Error })
  t.throws(() => EnglishConverter('12abc34'), { instanceOf: Error })
})

// ============================================================================
// Options Parameter
// ============================================================================

test('accepts options parameter', t => {
  const { EnglishConverter } = n2words
  t.notThrows(() => EnglishConverter(42, {}))
  t.notThrows(() => EnglishConverter(42, { unknownOption: true }))
})

test('options are used by languages that support them', t => {
  const { ArabicConverter, TurkishConverter, SimplifiedChineseConverter } = n2words

  t.notThrows(() => ArabicConverter(1, { gender: 'feminine' }))
  t.notThrows(() => TurkishConverter(123, { dropSpaces: true }))
  t.notThrows(() => SimplifiedChineseConverter(1, { formal: true }))
})

test('all languages with options accept options parameter', t => {
  const languagesWithOptions = getLanguagesWithOptions()

  for (const code of languagesWithOptions) {
    const className = getClassName(code) || getClassNameFromFile(code)
    const converterName = getConverterName(className)
    const converter = n2words[converterName]

    t.notThrows(() => converter(42, {}), `${converterName} should accept options`)
  }
})

// ============================================================================
// Converter Behavior
// ============================================================================

test('converters are stateless - multiple calls return consistent results', t => {
  const { EnglishConverter, SpanishConverter, FrenchConverter } = n2words

  // Same input always produces same output
  t.is(EnglishConverter(42), EnglishConverter(42))
  t.is(SpanishConverter(42), SpanishConverter(42))
  t.is(FrenchConverter(42), FrenchConverter(42))

  // Different inputs don't affect each other
  const before = EnglishConverter(42)
  EnglishConverter(999)
  EnglishConverter(-100)
  const after = EnglishConverter(42)
  t.is(before, after)
})

test('converters return non-empty strings', t => {
  const { EnglishConverter, SpanishConverter, GermanConverter } = n2words

  for (const converter of [EnglishConverter, SpanishConverter, GermanConverter]) {
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

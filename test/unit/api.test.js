import test from 'ava'
import { readFileSync } from 'node:fs'
import * as n2words from '../../lib/n2words.js'
import { getClassName, getConverterName } from '../utils/language-naming.js'
import { getClassNameFromFile, getLanguageCodes } from '../utils/language-helpers.js'

/**
 * Unit Tests for n2words.js (Public API Module Structure)
 *
 * Tests the lib/n2words.js module structure:
 * - Module structure (imports, exports, alphabetical ordering)
 * - Converter behavior (functional, stateless)
 *
 * Note: These tests focus on API module structure only.
 * - Input parsing/validation → utils/parse-numeric.test.js
 * - Language implementation validation → integration/languages.test.js
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
// Converter Behavior
// ============================================================================

test('accepts various input types', t => {
  const { EnglishConverter } = n2words
  t.notThrows(() => EnglishConverter(42))
  t.notThrows(() => EnglishConverter('42'))
  t.notThrows(() => EnglishConverter(42n))
})

test('accepts options parameter', t => {
  const { EnglishConverter } = n2words
  t.notThrows(() => EnglishConverter(42, {}))
  t.notThrows(() => EnglishConverter(42, { someOption: true }))
})

test('options are used by languages that support them', t => {
  const { ArabicConverter, TurkishConverter, SimplifiedChineseConverter } = n2words

  t.notThrows(() => ArabicConverter(1, { gender: 'feminine' }))
  t.notThrows(() => TurkishConverter(123, { dropSpaces: true }))
  t.notThrows(() => SimplifiedChineseConverter(1, { formal: true }))
})

test('converters are stateless - multiple calls return consistent results', t => {
  const { EnglishConverter } = n2words

  const result1 = EnglishConverter(42)
  const result2 = EnglishConverter(42)
  const result3 = EnglishConverter(42)

  t.is(result1, result2)
  t.is(result2, result3)
})

test('converters handle zero', t => {
  const { EnglishConverter, SpanishConverter, FrenchConverter } = n2words

  t.is(typeof EnglishConverter(0), 'string')
  t.is(typeof SpanishConverter(0), 'string')
  t.is(typeof FrenchConverter(0), 'string')
})

test('converters handle negative numbers', t => {
  const { EnglishConverter } = n2words

  const result = EnglishConverter(-42)
  t.is(typeof result, 'string')
  t.true(result.length > 0)
})

test('converters handle large numbers', t => {
  const { EnglishConverter } = n2words

  t.notThrows(() => EnglishConverter(Number.MAX_SAFE_INTEGER))
  t.notThrows(() => EnglishConverter(BigInt('9'.repeat(50))))
})

test('converters handle decimals', t => {
  const { EnglishConverter } = n2words

  const result = EnglishConverter('123.456')
  t.is(typeof result, 'string')
  t.true(result.length > 0)
})

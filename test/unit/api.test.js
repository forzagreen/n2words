import test from 'ava'
import { readFileSync } from 'node:fs'
import * as n2words from '../../lib/n2words.js'
import { getLanguageMetadata } from '../utils/language-helpers.js'

/**
 * Unit Tests for n2words.js (Public API Module Structure)
 *
 * Tests the lib/n2words.js module structure and makeConverter() behavior:
 * - Module structure (imports, exports, alphabetical ordering)
 * - Type annotations (typedefs, converter type hints)
 * - Options validation (plain object or undefined only)
 * - Converter behavior (stateless)
 *
 * Note: These tests focus on API module structure only.
 * - Input parsing/validation → utils/parse-numeric.test.js
 * - Base class behavior → classes/*.test.js
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
  const languageCount = getLanguageMetadata().length
  const exportCount = Object.keys(n2words).length

  t.is(exportCount, languageCount, `Should have ${languageCount} converters for ${languageCount} languages`)
})

test('all language classes are imported', t => {
  const languages = getLanguageMetadata()

  const missingImports = []
  for (const lang of languages) {
    const importPattern = new RegExp(`import\\s*\\{\\s*${lang.className}\\s*\\}\\s*from\\s*['"]\\./languages/${lang.code}\\.js['"]`)
    if (!importPattern.test(n2wordsContent)) {
      missingImports.push(`${lang.className} (${lang.file})`)
    }
  }

  t.deepEqual(missingImports, [], `Missing imports: ${missingImports.join(', ')}`)
})

test('language imports are alphabetically ordered', t => {
  const importSection = n2wordsContent.match(/\/\/ Language Imports[\s\S]*?(?=\/\/ ===)/)?.[0]
  if (!importSection) {
    t.fail('No Language Imports section found')
    return
  }

  const imports = [...importSection.matchAll(/import\s+{\s*(\w+)\s*}/g)].map(m => m[1])
  const sorted = [...imports].sort((a, b) => a.localeCompare(b))
  t.deepEqual(imports, sorted, 'Language imports should be alphabetically ordered')
})

test('all language converters are exported', t => {
  const languages = getLanguageMetadata()
  const exportSection = n2wordsContent.match(/export\s*{([\s\S]*?)}/)?.[1] || ''

  const missingExports = []
  for (const lang of languages) {
    const converterName = `${lang.className}Converter`
    if (!exportSection.includes(converterName)) {
      missingExports.push(`${converterName} (${lang.file})`)
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

test('all converters have type annotations', t => {
  const languages = getLanguageMetadata()

  const missingAnnotations = []
  for (const lang of languages) {
    const converterName = `${lang.className}Converter`
    const typePattern = new RegExp(`const\\s+${converterName}\\s*=\\s*/\\*\\*\\s*@type\\s*\\{\\(value:\\s*NumericValue`)
    if (!typePattern.test(n2wordsContent)) {
      missingAnnotations.push(`${converterName} (${lang.file})`)
    }
  }

  t.deepEqual(missingAnnotations, [], `Missing type annotations: ${missingAnnotations.join(', ')}`)
})

test('languages with options have Options typedef and typed converter', t => {
  const languages = getLanguageMetadata().filter(lang => lang.hasOptions)

  const missingTypedefs = []
  const missingOptionsInConverter = []

  for (const lang of languages) {
    const typedefPattern = new RegExp(`@typedef\\s*\\{Object\\}\\s*${lang.className}Options`)
    if (!typedefPattern.test(n2wordsContent)) {
      missingTypedefs.push(`${lang.className}Options (${lang.file})`)
    }

    const converterName = `${lang.className}Converter`
    const optionsPattern = new RegExp(`const\\s+${converterName}\\s*=.*options\\?:\\s*${lang.className}Options`)
    if (!optionsPattern.test(n2wordsContent)) {
      missingOptionsInConverter.push(`${converterName} (${lang.file})`)
    }
  }

  t.deepEqual(missingTypedefs, [], `Missing Options typedefs: ${missingTypedefs.join(', ')}`)
  t.deepEqual(missingOptionsInConverter, [], `Converters missing options type: ${missingOptionsInConverter.join(', ')}`)
})

// ============================================================================
// Options Handling
// ============================================================================

test('accepts undefined options', t => {
  const { EnglishConverter } = n2words
  t.notThrows(() => EnglishConverter(42))
  t.notThrows(() => EnglishConverter(42, undefined))
})

test('accepts plain object options', t => {
  const { EnglishConverter } = n2words
  t.notThrows(() => EnglishConverter(42, {}))
  t.notThrows(() => EnglishConverter(42, { someOption: true }))
})

test('accepts Object.create(null) options', t => {
  const { EnglishConverter } = n2words
  const nullProtoOptions = Object.create(null)
  nullProtoOptions.test = true
  t.notThrows(() => EnglishConverter(42, nullProtoOptions))
})

test('rejects non-plain-object options', t => {
  const { EnglishConverter } = n2words

  // Array
  t.throws(() => EnglishConverter(42, []), { message: 'options must be a plain object if provided' })

  // Function
  t.throws(() => EnglishConverter(42, () => {}), { message: 'options must be a plain object if provided' })

  // Class instance
  class MyClass {}
  t.throws(() => EnglishConverter(42, new MyClass()), { message: 'options must be a plain object if provided' })

  // Primitives
  t.throws(() => EnglishConverter(42, 'string'), { message: 'options must be a plain object if provided' })
  t.throws(() => EnglishConverter(42, 123), { message: 'options must be a plain object if provided' })
  t.throws(() => EnglishConverter(42, true), { message: 'options must be a plain object if provided' })

  // Null
  t.throws(() => EnglishConverter(42, null), { message: 'options must be a plain object if provided' })
})

test('options are passed through to language class', t => {
  const { ArabicConverter, TurkishConverter, SimplifiedChineseConverter } = n2words

  t.notThrows(() => ArabicConverter(1, { gender: 'feminine' }))
  t.notThrows(() => TurkishConverter(123, { dropSpaces: true }))
  t.notThrows(() => SimplifiedChineseConverter(1, { formal: true }))
})

test('options do not persist between calls', t => {
  const { ArabicConverter } = n2words

  const withOption = ArabicConverter(1, { gender: 'feminine' })
  const withoutOption = ArabicConverter(1)
  const withDefault = ArabicConverter(1, { gender: 'masculine' })

  t.is(withoutOption, withDefault, 'Default call should match explicit default option')
  t.not(withOption, withoutOption, 'Options should not persist between calls')
})

// ============================================================================
// Converter Behavior
// ============================================================================

test('converters are stateless between calls', t => {
  const { EnglishConverter } = n2words

  const result1 = EnglishConverter(42)
  const result2 = EnglishConverter(42)
  const result3 = EnglishConverter(42)

  t.is(result1, result2)
  t.is(result2, result3)
})

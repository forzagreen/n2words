import test from 'ava'
import { readFileSync } from 'node:fs'
import * as n2words from '../../lib/n2words.js'
import { getLanguageCodes, normalizeCode } from '../utils/language-helpers.js'

/**
 * Unit Tests for n2words.js module structure.
 * Converter behavior is tested in integration/languages.test.js.
 */

const n2wordsContent = readFileSync('./lib/n2words.js', 'utf8')

// ============================================================================
// Module Structure
// ============================================================================

test('exports match language files exactly', t => {
  const languageCodes = getLanguageCodes()
  const exportedNames = Object.keys(n2words)
  const expectedNames = languageCodes.map(normalizeCode).sort()

  t.deepEqual(exportedNames.sort(), expectedNames, 'Exports should match language files exactly')
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
  // Extract normalized import names (e.g., 'as zhHans')
  const imports = [...n2wordsContent.matchAll(/as\s+(\w+)\s*\}\s*from\s*['"]\.\/languages\//g)].map(m => m[1])
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

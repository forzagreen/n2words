#!/usr/bin/env node

/**
 * Language Scaffolding Tool
 *
 * Generates boilerplate code for adding a new language to n2words.
 * Creates:
 * - Language implementation file in lib/languages/
 * - Test fixture file in test/fixtures/languages/
 * - Updates lib/n2words.js with import and export
 * - Updates test/types/n2words.test-d.ts with type test
 *
 * Usage:
 *   npm run lang:add <language-code>
 *
 * Examples:
 *   npm run lang:add ko        # Korean
 *   npm run lang:add sr-Cyrl   # Serbian Cyrillic
 *   npm run lang:add ta        # Tamil
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import chalk from 'chalk'
import { getCanonicalCode, isValidLanguageCode } from '../test/utils/language-naming.js'
import { normalizeCode } from '../test/utils/language-helpers.js'

// ============================================================================
// Template Generators
// ============================================================================

/**
 * Generate language implementation file.
 *
 * @param {string} code Language code (e.g., 'ko', 'sr-Cyrl')
 * @returns {string} File content
 */
function generateLanguageFile (code) {
  return `import { parseNumericValue } from '../utils/parse-numeric.js'

// TODO: Implement number-to-words conversion for ${code}
//
// Reference implementations by pattern:
//   Western scale: lib/languages/en.js, de.js, fr.js
//   South Asian:   lib/languages/hi.js, bn.js
//   East Asian:    lib/languages/ja.js, ko.js, zh-Hans.js
//   Slavic:        lib/languages/ru.js, pl.js, uk.js

/**
 * Converts a numeric value to words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in words
 */
function toWords (value) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  // TODO: Implement conversion logic
  throw new Error('${code} language not yet implemented')
}

export { toWords }
`
}

/**
 * Generate test fixture file.
 *
 * @param {string} code Language code
 * @returns {string} File content
 */
function generateTestFixture (code) {
  return `/**
 * Test fixtures for ${code} language
 *
 * Format: [input, expected_output, options?]
 */
export default [
  // TODO: Add test cases
  // [0, 'zero'],
  // [1, 'one'],
  // [42, 'forty-two'],
]
`
}

// ============================================================================
// File Update Functions
// ============================================================================

/**
 * Insert a line into sorted content.
 *
 * @param {string[]} lines Existing lines
 * @param {string} newLine Line to insert
 * @param {function} getSortKey Function to extract sort key from line
 * @returns {string[]} Updated lines
 */
function insertSorted (lines, newLine, getSortKey) {
  const newKey = getSortKey(newLine)
  let insertIndex = lines.length

  for (let i = 0; i < lines.length; i++) {
    const existingKey = getSortKey(lines[i])
    if (existingKey > newKey) {
      insertIndex = i
      break
    }
  }

  lines.splice(insertIndex, 0, newLine)
  return lines
}

/**
 * Update lib/n2words.js with new language.
 *
 * @param {string} code Language code (e.g., 'sr-Cyrl')
 * @param {string} normalized Normalized code (e.g., 'srCyrl')
 */
function updateN2wordsFile (code, normalized) {
  const filePath = './lib/n2words.js'
  let content = readFileSync(filePath, 'utf-8')

  // 1. Add import line
  const importLine = `import { toWords as ${normalized} } from './languages/${code}.js'`
  const importMatch = content.match(/^import \{ toWords as \w+ \} from '\.\/languages\/[\w-]+\.js'$/gm)
  if (importMatch) {
    const imports = insertSorted(
      [...importMatch],
      importLine,
      line => line.match(/as (\w+)/)?.[1] || ''
    )
    // Replace first import with all imports
    const firstImport = importMatch[0]
    const lastImport = importMatch[importMatch.length - 1]
    const importSection = content.slice(
      content.indexOf(firstImport),
      content.indexOf(lastImport) + lastImport.length
    )
    content = content.replace(importSection, imports.join('\n'))
  }

  // 2. Add to named exports
  const namedExportMatch = content.match(/export \{[\s\S]*?\n\}/)
  if (namedExportMatch) {
    const exportBlock = namedExportMatch[0]
    const exportLines = exportBlock.split('\n').filter(l => l.trim() && !l.includes('export {') && !l.includes('}'))
    const newExportLine = `  ${normalized},`
    insertSorted(exportLines, newExportLine, line => line.trim().replace(',', ''))
    const newExportBlock = 'export {\n' + exportLines.join('\n') + '\n}'
    content = content.replace(exportBlock, newExportBlock)
  }

  writeFileSync(filePath, content)
}

/**
 * Update test/types/n2words.test-d.ts with new language.
 *
 * @param {string} normalized Normalized code (e.g., 'srCyrl')
 */
function updateTypeTestFile (normalized) {
  const filePath = './test/types/n2words.test-d.ts'
  let content = readFileSync(filePath, 'utf-8')

  // 1. Add to import block
  const importMatch = content.match(/import \{([^}]+)\} from '\.\.\/\.\.\/lib\/n2words\.js'/)
  if (importMatch) {
    const imports = importMatch[1].split(',').map(s => s.trim()).filter(s => s)
    if (!imports.includes(normalized)) {
      imports.push(normalized)
      imports.sort()
      const newImportBlock = `import {\n  ${imports.join(',\n  ')}\n} from '../../lib/n2words.js'`
      content = content.replace(importMatch[0], newImportBlock)
    }
  }

  // 2. Add basic type test (find the "All converters return string" section)
  const testMarker = '// All converters return string'
  const testMarkerIndex = content.indexOf(testMarker)
  if (testMarkerIndex !== -1) {
    // Find the next section or end of tests
    const nextSectionMatch = content.slice(testMarkerIndex).match(/\n\n\/\/ ===/)
    const insertPos = nextSectionMatch
      ? testMarkerIndex + nextSectionMatch.index
      : content.length

    // Check if test already exists
    if (!content.includes(`expectType<string>(${normalized}(42))`)) {
      // Find existing tests and insert alphabetically
      const testSection = content.slice(testMarkerIndex, insertPos)
      const testLines = testSection.split('\n').filter(l => l.startsWith('expectType<string>('))

      const newTest = `expectType<string>(${normalized}(42))`
      let inserted = false

      for (let i = 0; i < testLines.length; i++) {
        const existingConverter = testLines[i].match(/expectType<string>\((\w+)\(/)?.[1]
        if (existingConverter && existingConverter > normalized) {
          const linePos = content.indexOf(testLines[i], testMarkerIndex)
          content = content.slice(0, linePos) + newTest + '\n' + content.slice(linePos)
          inserted = true
          break
        }
      }

      if (!inserted && testLines.length > 0) {
        const lastTest = testLines[testLines.length - 1]
        const lastTestEnd = content.indexOf(lastTest, testMarkerIndex) + lastTest.length
        content = content.slice(0, lastTestEnd) + '\n' + newTest + content.slice(lastTestEnd)
      }
    }
  }

  writeFileSync(filePath, content)
}

// ============================================================================
// Main
// ============================================================================

function main () {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(chalk.cyan('Usage: npm run lang:add <language-code>'))
    console.log()
    console.log(chalk.gray('Examples:'))
    console.log(chalk.gray('  npm run lang:add ko        # Korean'))
    console.log(chalk.gray('  npm run lang:add sr-Cyrl   # Serbian Cyrillic'))
    console.log(chalk.gray('  npm run lang:add ta        # Tamil'))
    process.exit(args.length === 0 ? 1 : 0)
  }

  const code = args[0]

  // Validate BCP 47 language code
  if (!isValidLanguageCode(code)) {
    console.error(chalk.red(`Error: Invalid BCP 47 language tag: ${code}`))
    console.log(chalk.gray('\nExamples: en, fr, zh-Hans, sr-Latn, fr-BE'))
    process.exit(1)
  }

  // Warn if using non-canonical form
  const canonical = getCanonicalCode(code)
  if (canonical && canonical !== code) {
    console.log(chalk.yellow(`Warning: "${code}" will be canonicalized to "${canonical}"`))
  }

  const normalized = normalizeCode(code)
  const langFilePath = `./lib/languages/${code}.js`
  const fixtureFilePath = `./test/fixtures/languages/${code}.js`

  console.log(chalk.cyan(`\nAdding language: ${code}`))
  console.log(chalk.gray(`Export name: ${normalized}`))

  // Check if language already exists
  if (existsSync(langFilePath)) {
    console.error(chalk.red(`\nError: Language file already exists: ${langFilePath}`))
    process.exit(1)
  }

  // Create language file
  console.log(chalk.gray(`\nCreating ${langFilePath}...`))
  writeFileSync(langFilePath, generateLanguageFile(code))
  console.log(chalk.green('✓ Created language file'))

  // Create test fixture
  console.log(chalk.gray(`Creating ${fixtureFilePath}...`))
  const fixtureDir = './test/fixtures/languages'
  if (!existsSync(fixtureDir)) {
    mkdirSync(fixtureDir, { recursive: true })
  }
  writeFileSync(fixtureFilePath, generateTestFixture(code))
  console.log(chalk.green('✓ Created test fixture'))

  // Update n2words.js
  console.log(chalk.gray('Updating lib/n2words.js...'))
  updateN2wordsFile(code, normalized)
  console.log(chalk.green('✓ Updated n2words.js'))

  // Update type tests
  console.log(chalk.gray('Updating test/types/n2words.test-d.ts...'))
  updateTypeTestFile(normalized)
  console.log(chalk.green('✓ Updated type tests'))

  // Success message
  console.log(chalk.green(`\n✓ Successfully scaffolded ${code} language`))
  console.log(chalk.cyan('\nNext steps:'))
  console.log(chalk.gray(`1. Implement ${langFilePath}`))
  console.log(chalk.gray(`2. Add test cases to ${fixtureFilePath}`))
  console.log(chalk.gray('3. Run: npm test'))
}

main()

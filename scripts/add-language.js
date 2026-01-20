#!/usr/bin/env node

/**
 * Language Scaffolding Tool
 *
 * Generates boilerplate code for adding a new language to n2words.
 * Creates:
 * - Language implementation file in src/
 * - Test fixture file in test/fixtures/
 * - Updates index.js with import and export
 * - Updates test/types/languages.test-d.ts with import and type test
 *
 * Usage:
 *   npm run lang:add <language-code>
 *
 * Examples:
 *   npm run lang:add ko        # Korean
 *   npm run lang:add sr-Cyrl   # Serbian Cyrillic
 *   npm run lang:add ta        # Tamil
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as readline from 'node:readline/promises'
import chalk from 'chalk'
import { getCanonicalCode, getLanguageName, isInCLDR, isValidLanguageCode, normalizeCode } from '../test/helpers/language-naming.js'

// ============================================================================
// Interactive Prompts
// ============================================================================

/**
 * Prompt user for language name when code is not in CLDR.
 *
 * @param {string} code Language code
 * @returns {Promise<string|null>} Language name from user, or null if cancelled
 */
async function promptForLanguageName (code) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  try {
    console.log(chalk.yellow(`\nNote: "${code}" is not in CLDR (language name unknown)`))
    console.log(chalk.gray('Valid BCP 47 codes may not be in Unicode CLDR (e.g., hbo = Biblical Hebrew)'))

    const name = await rl.question(chalk.cyan('\nEnter the language name: '))
    if (!name.trim()) {
      console.log(chalk.red('\nNo name provided. Aborting.'))
      return null
    }

    return name.trim()
  } finally {
    rl.close()
  }
}

// ============================================================================
// Template Generators
// ============================================================================

/**
 * Generate language implementation file.
 *
 * @param {string} code Language code (e.g., 'ko', 'sr-Cyrl')
 * @param {string} name Language name (e.g., 'Korean')
 * @returns {string} File content
 */
function generateLanguageFile (code, name) {
  return `import { parseNumericValue } from './utils/parse-numeric.js'

// TODO: Implement number-to-words conversion for ${name} (${code})
//
// Reference implementations by pattern:
//   Western scale: src/en.js, de.js, fr.js
//   South Asian:   src/hi.js, bn.js
//   East Asian:    src/ja.js, ko.js, zh-Hans.js
//   Slavic:        src/ru.js, pl.js, uk.js

/**
 * Converts a numeric value to words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in words
 */
function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  // TODO: Implement conversion logic
  throw new Error('${code} language not yet implemented')
}

export { toCardinal }
`
}

/**
 * Generate test fixture file.
 *
 * @param {string} code Language code
 * @param {string} name Language name
 * @returns {string} File content
 */
function generateTestFixture (code, name) {
  return `/**
 * Test fixtures for ${name} (${code})
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
 * Update index.js with new language.
 *
 * @param {string} code Language code (e.g., 'sr-Cyrl')
 * @param {string} normalized Normalized code (e.g., 'srCyrl')
 */
function updateIndexFile (code, normalized) {
  const filePath = './index.js'
  let content = readFileSync(filePath, 'utf-8')

  // 1. Add import line
  const importLine = `import { toCardinal as ${normalized} } from './src/${code}.js'`
  const importMatch = content.match(/^import \{ toCardinal as \w+ \} from '\.\/src\/[\w-]+\.js'$/gm)
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
 * Update test/types/languages.test-d.ts with new language.
 *
 * Adds:
 * - Import statement in the imports section
 * - expectType<string> test in the return type section
 *
 * @param {string} code Language code (e.g., 'sr-Cyrl')
 * @param {string} normalized Normalized code (e.g., 'srCyrl')
 */
function updateLanguagesTypeTest (code, normalized) {
  const filePath = './test/types/languages.test-d.ts'
  const lines = readFileSync(filePath, 'utf-8').split('\n')

  const importLine = `import { toCardinal as ${normalized} } from '../../src/${code}.js'`
  const testLine = `expectType<string>(${normalized}(1))`

  // Check if already exists
  const hasImport = lines.some(line => line.includes(`as ${normalized} }`))
  const hasTest = lines.some(line => line.includes(`${normalized}(1))`))

  if (hasImport) {
    console.log(chalk.yellow(`  Import for ${normalized} already exists`))
  }
  if (hasTest) {
    console.log(chalk.yellow(`  Type test for ${normalized} already exists`))
  }
  if (hasImport && hasTest) {
    return
  }

  const result = []
  let importInserted = hasImport
  let testInserted = hasTest
  let inImportSection = false
  let inTestSection = false
  let passedTestHeader = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Track import section (starts with first language import, ends at blank line)
    if (line.startsWith('import { toCardinal as ')) {
      inImportSection = true
    } else if (inImportSection && line.trim() === '') {
      inImportSection = false
    }

    // Track test section (starts after "Basic return type" header block)
    if (line.includes('// Basic return type')) {
      inTestSection = true
      passedTestHeader = false
    } else if (inTestSection && !passedTestHeader && line.startsWith('// ===')) {
      // Skip the closing line of the header block
      passedTestHeader = true
    } else if (inTestSection && passedTestHeader && line.startsWith('// ===')) {
      // This is the start of the next section
      inTestSection = false
    }

    // Insert import in sorted position
    if (!importInserted && inImportSection) {
      const currentName = line.match(/as (\w+)/)?.[1] || ''
      if (currentName > normalized) {
        result.push(importLine)
        importInserted = true
      }
    }

    // Insert test in sorted position
    if (!testInserted && inTestSection && line.startsWith('expectType<string>(')) {
      const currentName = line.match(/\((\w+)\(/)?.[1] || ''
      if (currentName > normalized) {
        result.push(testLine)
        testInserted = true
      }
    }

    result.push(line)

    // If we've passed the last import/test in section, insert at end
    if (!importInserted && inImportSection && !lines[i + 1]?.startsWith('import { toCardinal as ')) {
      result.push(importLine)
      importInserted = true
    }
    if (!testInserted && inTestSection && line.startsWith('expectType<string>(') && !lines[i + 1]?.startsWith('expectType<string>(')) {
      result.push(testLine)
      testInserted = true
    }
  }

  writeFileSync(filePath, result.join('\n'))
}

// ============================================================================
// Main
// ============================================================================

async function main () {
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
  const langFilePath = `./src/${code}.js`
  const fixtureFilePath = `./test/fixtures/${code}.js`

  // Check if language already exists (before prompting for name)
  if (existsSync(langFilePath)) {
    console.error(chalk.red(`\nError: Language file already exists: ${langFilePath}`))
    process.exit(1)
  }

  // Get language name from CLDR, or prompt user if not found
  let languageName = getLanguageName(code)

  if (!isInCLDR(code)) {
    const userProvidedName = await promptForLanguageName(code)
    if (userProvidedName === null) {
      process.exit(1)
    }
    languageName = userProvidedName
  }

  console.log(chalk.cyan(`\nAdding language: ${languageName} (${code})`))
  console.log(chalk.gray(`Export name: ${normalized}`))

  // Create language file
  console.log(chalk.gray(`\nCreating ${langFilePath}...`))
  writeFileSync(langFilePath, generateLanguageFile(code, languageName))
  console.log(chalk.green('✓ Created language file'))

  // Create test fixture
  console.log(chalk.gray(`Creating ${fixtureFilePath}...`))
  const fixtureDir = './test/fixtures'
  if (!existsSync(fixtureDir)) {
    mkdirSync(fixtureDir, { recursive: true })
  }
  writeFileSync(fixtureFilePath, generateTestFixture(code, languageName))
  console.log(chalk.green('✓ Created test fixture'))

  // Update index.js
  console.log(chalk.gray('Updating index.js...'))
  updateIndexFile(code, normalized)
  console.log(chalk.green('✓ Updated index.js'))

  // Update type tests
  console.log(chalk.gray('Updating test/types/languages.test-d.ts...'))
  updateLanguagesTypeTest(code, normalized)
  console.log(chalk.green('✓ Updated type tests'))

  // Regenerate LANGUAGES.md
  console.log(chalk.gray('Regenerating LANGUAGES.md...'))
  execSync('node scripts/generate-languages-md.js', { stdio: 'inherit' })

  // Success message
  console.log(chalk.green(`\n✓ Successfully scaffolded ${code} language`))
  console.log(chalk.cyan('\nNext steps:'))
  console.log(chalk.gray(`1. Implement ${langFilePath}`))
  console.log(chalk.gray(`2. Add test cases to ${fixtureFilePath}`))
  console.log(chalk.gray('3. Run: npm test'))
  console.log(chalk.gray('4. Run: npm run build:types && npm run test:types'))
}

main().catch(err => {
  console.error(chalk.red(err.message))
  process.exit(1)
})

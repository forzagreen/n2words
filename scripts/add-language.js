#!/usr/bin/env node

/**
 * Language Scaffolding Tool
 *
 * Generates boilerplate code for adding a new language to n2words.
 * Supports scaffolding multiple conversion forms (cardinal, ordinal).
 *
 * Usage:
 *   npm run lang:add <language-code> [options]
 *
 * Options:
 *   --cardinal    Scaffold cardinal number support
 *   --ordinal     Scaffold ordinal number support
 *
 * If no options provided, prompts interactively.
 *
 * Examples:
 *   npm run lang:add ko                      # Interactive prompts
 *   npm run lang:add ko --cardinal           # Cardinal only
 *   npm run lang:add ko --ordinal            # Ordinal only
 *   npm run lang:add ko --cardinal --ordinal # Both forms
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as readline from 'node:readline/promises'
import chalk from 'chalk'
import { getCanonicalCode, getLanguageName, isInCLDR, isValidLanguageCode, normalizeCode } from '../test/helpers/language-naming.js'

// ============================================================================
// CLI Argument Parsing
// ============================================================================

/**
 * Parse CLI arguments.
 *
 * @param {string[]} args Command line arguments
 * @returns {{code: string|null, forms: Set<string>, help: boolean}}
 */
function parseArgs (args) {
  const result = {
    code: null,
    forms: new Set(),
    help: false
  }

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      result.help = true
    } else if (arg === '--cardinal') {
      result.forms.add('cardinal')
    } else if (arg === '--ordinal') {
      result.forms.add('ordinal')
    } else if (!arg.startsWith('-')) {
      result.code = arg
    }
  }

  return result
}

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

/**
 * Prompt user to select which forms to scaffold.
 *
 * @param {Set<string>} existingForms Forms already implemented
 * @returns {Promise<Set<string>>} Selected forms
 */
async function promptForForms (existingForms) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const availableForms = ['cardinal', 'ordinal'].filter(f => !existingForms.has(f))

  if (availableForms.length === 0) {
    console.log(chalk.yellow('\nAll forms are already implemented for this language.'))
    return new Set()
  }

  try {
    console.log(chalk.cyan('\nWhich forms do you want to scaffold?'))
    console.log(chalk.gray('Enter comma-separated numbers (e.g., 1,2) or press Enter for all\n'))

    availableForms.forEach((form, i) => {
      console.log(chalk.white(`  ${i + 1}. ${form} (to${form.charAt(0).toUpperCase() + form.slice(1)})`))
    })

    const answer = await rl.question(chalk.cyan('\nSelection: '))

    if (!answer.trim()) {
      // Default: all available forms
      return new Set(availableForms)
    }

    const indices = answer.split(',').map(s => parseInt(s.trim(), 10) - 1)
    const selectedForms = new Set()

    for (const idx of indices) {
      if (idx >= 0 && idx < availableForms.length) {
        selectedForms.add(availableForms[idx])
      }
    }

    if (selectedForms.size === 0) {
      console.log(chalk.red('\nNo valid selection. Aborting.'))
      return new Set()
    }

    return selectedForms
  } finally {
    rl.close()
  }
}

// ============================================================================
// Template Generators
// ============================================================================

/**
 * Generate cardinal function template.
 *
 * @param {string} code Language code
 * @returns {string} Function template
 */
function generateCardinalFunction (code) {
  return `/**
 * Converts a numeric value to cardinal words.
 *
 * @param {number | string | bigint} value - The numeric value to convert
 * @returns {string} The number in words
 */
function toCardinal (value) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  // TODO: Implement conversion logic
  throw new Error('${code} cardinal not yet implemented')
}`
}

/**
 * Generate ordinal function template.
 *
 * @param {string} code Language code
 * @returns {string} Function template
 */
function generateOrdinalFunction (code) {
  return `/**
 * Converts a positive integer to ordinal words.
 *
 * @param {number | string | bigint} value - Positive integer to convert
 * @returns {string} The ordinal in words
 * @throws {RangeError} If value is not a positive integer
 */
function toOrdinal (value) {
  const { isNegative, integerPart, decimalPart } = parseNumericValue(value)

  if (isNegative || integerPart === 0n || decimalPart) {
    throw new RangeError('Ordinal numbers must be positive integers')
  }

  // TODO: Implement conversion logic
  throw new Error('${code} ordinal not yet implemented')
}`
}

/**
 * Generate language implementation file.
 *
 * @param {string} code Language code
 * @param {string} name Language name
 * @param {Set<string>} forms Forms to include
 * @returns {string} File content
 */
function generateLanguageFile (code, name, forms) {
  const hasCardinal = forms.has('cardinal')
  const hasOrdinal = forms.has('ordinal')

  const imports = "import { parseNumericValue } from './utils/parse-numeric.js'"

  const header = `// TODO: Implement number-to-words conversion for ${name} (${code})
//
// Reference implementations by pattern:
//   Western scale: src/en-US.js, de.js, fr.js
//   South Asian:   src/hi.js, bn.js
//   East Asian:    src/ja.js, ko.js, zh-Hans.js
//   Slavic:        src/ru.js, pl.js, uk.js`

  const functions = []
  if (hasCardinal) functions.push(generateCardinalFunction(code))
  if (hasOrdinal) functions.push(generateOrdinalFunction(code))

  const exports = []
  if (hasCardinal) exports.push('toCardinal')
  if (hasOrdinal) exports.push('toOrdinal')

  return `${imports}

${header}

${functions.join('\n\n')}

export { ${exports.join(', ')} }
`
}

/**
 * Generate test fixture file content.
 *
 * @param {string} code Language code
 * @param {string} name Language name
 * @param {Set<string>} forms Forms to include
 * @returns {string} File content
 */
function generateTestFixture (code, name, forms) {
  const exports = []

  if (forms.has('cardinal')) {
    exports.push(`/**
 * Cardinal number test cases for ${name} (${code})
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  // TODO: Add test cases
  // [0, 'zero'],
  // [1, 'one'],
  // [42, 'forty-two'],
]`)
  }

  if (forms.has('ordinal')) {
    exports.push(`/**
 * Ordinal number test cases for ${name} (${code})
 * Format: [input, expected_output]
 */
export const ordinal = [
  // TODO: Add test cases
  // [1, 'first'],
  // [2, 'second'],
  // [42, 'forty-second'],
]`)
  }

  return exports.join('\n\n') + '\n'
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
 * @param {string} code Language code
 * @param {string} normalized Normalized code
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
 * @param {string} code Language code
 * @param {string} normalized Normalized code
 */
function updateLanguagesTypeTest (code, normalized) {
  const filePath = './test/types/languages.test-d.ts'
  const lines = readFileSync(filePath, 'utf-8').split('\n')

  const importLine = `import { toCardinal as ${normalized} } from '../../src/${code}.js'`
  const testLine = `expectType<string>(${normalized}(1))`

  const hasImport = lines.some(line => line.includes(`as ${normalized} }`))
  const hasTest = lines.some(line => line.includes(`${normalized}(1))`))

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

    if (line.startsWith('import { toCardinal as ')) {
      inImportSection = true
    } else if (inImportSection && line.trim() === '') {
      inImportSection = false
    }

    if (line.includes('// Basic return type')) {
      inTestSection = true
      passedTestHeader = false
    } else if (inTestSection && !passedTestHeader && line.startsWith('// ===')) {
      passedTestHeader = true
    } else if (inTestSection && passedTestHeader && line.startsWith('// ===')) {
      inTestSection = false
    }

    if (!importInserted && inImportSection) {
      const currentName = line.match(/as (\w+)/)?.[1] || ''
      if (currentName > normalized) {
        result.push(importLine)
        importInserted = true
      }
    }

    if (!testInserted && inTestSection && line.startsWith('expectType<string>(')) {
      const currentName = line.match(/\((\w+)\(/)?.[1] || ''
      if (currentName > normalized) {
        result.push(testLine)
        testInserted = true
      }
    }

    result.push(line)

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

/**
 * Check which forms are already implemented for a language.
 *
 * @param {string} code Language code
 * @returns {Set<string>} Set of implemented forms
 */
function getExistingForms (code) {
  const filePath = `./src/${code}.js`
  const forms = new Set()

  if (!existsSync(filePath)) {
    return forms
  }

  const content = readFileSync(filePath, 'utf-8')

  if (content.includes('function toCardinal')) {
    forms.add('cardinal')
  }
  if (content.includes('function toOrdinal')) {
    forms.add('ordinal')
  }

  return forms
}

/**
 * Add new forms to an existing language file.
 *
 * @param {string} code Language code
 * @param {Set<string>} newForms Forms to add
 */
function addFormsToExistingFile (code, newForms) {
  const filePath = `./src/${code}.js`
  let content = readFileSync(filePath, 'utf-8')

  // Add new functions before the export statement
  const exportMatch = content.match(/export \{[^}]+\}/)
  if (!exportMatch) {
    throw new Error(`Could not find export statement in ${filePath}`)
  }

  const newFunctions = []
  const newExports = []

  if (newForms.has('ordinal')) {
    newFunctions.push('\n' + generateOrdinalFunction(code))
    newExports.push('toOrdinal')
  }

  // Insert functions before export
  const insertPos = content.indexOf(exportMatch[0])
  content = content.slice(0, insertPos) + newFunctions.join('\n') + '\n\n' + content.slice(insertPos)

  // Update export statement
  const currentExports = exportMatch[0].match(/\{ ([^}]+) \}/)?.[1].split(',').map(s => s.trim()) || []
  const allExports = [...currentExports, ...newExports]
  const newExportStatement = `export { ${allExports.join(', ')} }`
  content = content.replace(/export \{[^}]+\}/, newExportStatement)

  writeFileSync(filePath, content)
}

/**
 * Add new forms to an existing fixture file.
 *
 * @param {string} code Language code
 * @param {string} name Language name
 * @param {Set<string>} newForms Forms to add
 */
function addFormsToExistingFixture (code, name, newForms) {
  const filePath = `./test/fixtures/${code}.js`
  let content = readFileSync(filePath, 'utf-8')

  const newExports = []

  if (newForms.has('ordinal')) {
    newExports.push(`
/**
 * Ordinal number test cases for ${name} (${code})
 * Format: [input, expected_output]
 */
export const ordinal = [
  // TODO: Add test cases
  // [1, 'first'],
  // [2, 'second'],
  // [42, 'forty-second'],
]`)
  }

  content = content.trimEnd() + '\n' + newExports.join('\n') + '\n'
  writeFileSync(filePath, content)
}

// ============================================================================
// Main
// ============================================================================

async function main () {
  const { code, forms: cliFlags, help } = parseArgs(process.argv.slice(2))

  if (help || !code) {
    console.log(chalk.cyan('Usage: npm run lang:add <language-code> [options]'))
    console.log()
    console.log(chalk.gray('Options:'))
    console.log(chalk.gray('  --cardinal    Scaffold cardinal number support'))
    console.log(chalk.gray('  --ordinal     Scaffold ordinal number support'))
    console.log()
    console.log(chalk.gray('If no options provided, prompts interactively.'))
    console.log()
    console.log(chalk.gray('Examples:'))
    console.log(chalk.gray('  npm run lang:add ko                      # Interactive'))
    console.log(chalk.gray('  npm run lang:add ko --cardinal           # Cardinal only'))
    console.log(chalk.gray('  npm run lang:add ko --ordinal            # Ordinal only'))
    console.log(chalk.gray('  npm run lang:add ko --cardinal --ordinal # Both forms'))
    process.exit(help ? 0 : 1)
  }

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

  // Check existing implementation
  const existingForms = getExistingForms(code)
  const isNewLanguage = existingForms.size === 0

  // Determine which forms to scaffold
  let formsToScaffold
  if (cliFlags.size > 0) {
    // CLI flags provided - use them directly
    formsToScaffold = new Set([...cliFlags].filter(f => !existingForms.has(f)))
    if (formsToScaffold.size === 0) {
      console.log(chalk.yellow('\nAll requested forms are already implemented.'))
      process.exit(0)
    }
  } else {
    // Interactive mode
    formsToScaffold = await promptForForms(existingForms)
    if (formsToScaffold.size === 0) {
      process.exit(0)
    }
  }

  // Get language name
  let languageName = getLanguageName(code)

  if (!isInCLDR(code)) {
    const userProvidedName = await promptForLanguageName(code)
    if (userProvidedName === null) {
      process.exit(1)
    }
    languageName = userProvidedName
  }

  console.log(chalk.cyan(`\nAdding ${isNewLanguage ? 'language' : 'forms'}: ${languageName} (${code})`))
  console.log(chalk.gray(`Forms: ${[...formsToScaffold].join(', ')}`))
  console.log(chalk.gray(`Export name: ${normalized}`))

  if (isNewLanguage) {
    // Create new language file
    console.log(chalk.gray(`\nCreating ${langFilePath}...`))
    writeFileSync(langFilePath, generateLanguageFile(code, languageName, formsToScaffold))
    console.log(chalk.green('✓ Created language file'))

    // Create test fixture
    console.log(chalk.gray(`Creating ${fixtureFilePath}...`))
    const fixtureDir = './test/fixtures'
    if (!existsSync(fixtureDir)) {
      mkdirSync(fixtureDir, { recursive: true })
    }
    writeFileSync(fixtureFilePath, generateTestFixture(code, languageName, formsToScaffold))
    console.log(chalk.green('✓ Created test fixture'))

    // Update index.js
    console.log(chalk.gray('Updating index.js...'))
    updateIndexFile(code, normalized)
    console.log(chalk.green('✓ Updated index.js'))

    // Update type tests
    console.log(chalk.gray('Updating test/types/languages.test-d.ts...'))
    updateLanguagesTypeTest(code, normalized)
    console.log(chalk.green('✓ Updated type tests'))
  } else {
    // Add forms to existing files
    console.log(chalk.gray(`\nUpdating ${langFilePath}...`))
    addFormsToExistingFile(code, formsToScaffold)
    console.log(chalk.green('✓ Updated language file'))

    console.log(chalk.gray(`Updating ${fixtureFilePath}...`))
    addFormsToExistingFixture(code, languageName, formsToScaffold)
    console.log(chalk.green('✓ Updated test fixture'))
  }

  // Regenerate LANGUAGES.md
  console.log(chalk.gray('Regenerating LANGUAGES.md...'))
  execSync('node scripts/generate-languages-md.js', { stdio: 'inherit' })

  // Success message
  console.log(chalk.green(`\n✓ Successfully scaffolded ${code} ${isNewLanguage ? 'language' : 'forms'}`))
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

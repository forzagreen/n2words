#!/usr/bin/env node

/**
 * Language Scaffolding Tool
 *
 * Generates boilerplate code for adding a new language to n2words.
 * Supports scaffolding multiple conversion forms (cardinal, ordinal).
 *
 * Usage:
 *   npm run lang:add [language-code] [options]
 *
 * Options:
 *   --cardinal    Scaffold cardinal number support
 *   --ordinal     Scaffold ordinal number support
 *
 * If no code provided, prompts interactively.
 * If no form options provided, prompts for form selection.
 *
 * Examples:
 *   npm run lang:add                         # Fully interactive
 *   npm run lang:add ko                      # Prompts for forms
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
 * Prompt user for language code.
 *
 * @returns {Promise<string|null>} Language code from user, or null if cancelled
 */
async function promptForLanguageCode () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  try {
    console.log(chalk.cyan('\nEnter a BCP 47 language code'))
    console.log(chalk.gray('Examples: ko, zh-Hans, pt-BR, sr-Latn\n'))

    const code = await rl.question(chalk.cyan('Language code: '))
    const trimmed = code.trim()

    if (!trimmed) {
      console.log(chalk.red('\nNo code provided. Aborting.'))
      return null
    }

    return trimmed
  } finally {
    rl.close()
  }
}

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
  const { isNegative, integerPart, decimalPart } = parseCardinalValue(value)

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
  const integerPart = parseOrdinalValue(value)

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

  const importLines = []
  if (hasCardinal) {
    importLines.push("import { parseCardinalValue } from './utils/parse-cardinal.js'")
  }
  if (hasOrdinal) {
    importLines.push("import { parseOrdinalValue } from './utils/parse-ordinal.js'")
  }
  const imports = importLines.join('\n')

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
  const { code: cliCode, forms: cliFlags, help } = parseArgs(process.argv.slice(2))

  if (help) {
    console.log(chalk.cyan('Usage: npm run lang:add [language-code] [options]'))
    console.log()
    console.log(chalk.gray('Options:'))
    console.log(chalk.gray('  --cardinal    Scaffold cardinal number support'))
    console.log(chalk.gray('  --ordinal     Scaffold ordinal number support'))
    console.log()
    console.log(chalk.gray('If no code provided, prompts interactively.'))
    console.log(chalk.gray('If no form options provided, prompts for form selection.'))
    console.log()
    console.log(chalk.gray('Examples:'))
    console.log(chalk.gray('  npm run lang:add                         # Fully interactive'))
    console.log(chalk.gray('  npm run lang:add ko                      # Prompts for forms'))
    console.log(chalk.gray('  npm run lang:add ko --cardinal           # Cardinal only'))
    console.log(chalk.gray('  npm run lang:add ko --ordinal            # Ordinal only'))
    console.log(chalk.gray('  npm run lang:add ko --cardinal --ordinal # Both forms'))
    process.exit(0)
  }

  // Get language code (from CLI or prompt)
  let code = cliCode
  if (!code) {
    code = await promptForLanguageCode()
    if (!code) {
      process.exit(1)
    }
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

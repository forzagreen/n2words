#!/usr/bin/env node

/**
 * Language Scaffolding Tool
 *
 * This script generates boilerplate code for adding a new language to n2words.
 * It creates:
 * - Language implementation file in lib/languages/
 * - Test fixture file in test/fixtures/languages/
 * - Updates lib/n2words.js with import and export
 *
 * Usage:
 *   npm run lang:add <language-code>
 *
 * Examples:
 *   npm run lang:add ko        # Korean
 *   npm run lang:add zh-Hans   # Simplified Chinese
 *   npm run lang:add fr-CA     # Canadian French
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import chalk from 'chalk'
import { getExpectedClassName, validateLanguageCode } from './validate-language.js'

/**
 * Get language name from code using CLDR data (via validator)
 * Falls back to simple capitalization if CLDR doesn't recognize the code
 * @param {string} code - IETF BCP 47 language code
 * @returns {string} Pascal case language name
 */
function getLanguageName (code) {
  // Try to get the canonical name from CLDR first
  const cldrName = getExpectedClassName(code)
  if (cldrName) {
    return cldrName
  }

  // Fallback: simple capitalization for codes CLDR doesn't recognize
  // (e.g., historical languages like 'hbo' for Biblical Hebrew)
  const parts = code.split('-')
  return parts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/**
 * Generate language implementation file
 * @param {string} code - Language code
 * @param {string} className - Class name (e.g., 'English')
 * @returns {string}
 */
function generateLanguageFile (code, className) {
  return `import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * ${className} language converter.
 *
 * Converts numbers to ${className} words, supporting:
 * - Negative numbers (prepended with negative word)
 * - Decimal numbers (separator word between whole and fractional parts)
 * - Large numbers
 *
 * TODO: Document merge rules and language-specific behavior
 */
export class ${className} extends GreedyScaleLanguage {
  negativeWord = 'minus' // TODO: Replace with ${className} word for negative
  decimalSeparatorWord = 'point' // TODO: Replace with ${className} decimal separator
  zeroWord = 'zero' // TODO: Replace with ${className} word for zero

  scaleWordPairs = [
    // TODO: Add scale word pairs in descending order
    // Format: [value as bigint, word as string]
    // Example:
    // [1000000n, 'million'],
    // [1000n, 'thousand'],
    // [100n, 'hundred'],
    // [90n, 'ninety'],
    // ... down to 1n
    [1n, 'one'] // Placeholder - replace with complete list
  ]

  /**
   * Defines how to merge scale components.
   *
   * @param {string} leftWords - Words for the left (higher scale) component
   * @param {bigint} leftScale - The scale value of the left component
   * @param {string} rightWords - Words for the right (lower scale) component
   * @param {bigint} rightScale - The scale value of the right component
   * @returns {string} The merged result
   *
   * TODO: Implement language-specific merge rules
   * Common patterns:
   * - Space-separated: "twenty three" → return leftWords + ' ' + rightWords
   * - Hyphenated: "twenty-three" → return leftWords + '-' + rightWords
   * - With connector: "twenty and three" → return leftWords + ' and ' + rightWords
   */
  mergeScales (leftWords, leftScale, rightWords, rightScale) {
    // TODO: Implement merge logic
    return leftWords + ' ' + rightWords
  }
}
`
}

/**
 * Generate test fixture file
 * @param {string} code - Language code
 * @returns {string}
 */
function generateTestFixture (code) {
  return `/**
 * Test fixtures for ${code} language
 *
 * Format: [input, expected_output, options]
 * - input: number, bigint, or string to convert
 * - expected_output: expected string result
 * - options: (optional) converter options object
 */
export default [
  // TODO: Add comprehensive test cases
  // Basic numbers
  [0, 'zero'], // TODO: Replace with actual ${code} word
  [1, 'one'],
  [2, 'two'],

  // Teens
  [13, 'thirteen'],

  // Tens
  [20, 'twenty'],
  [42, 'forty-two'],

  // Hundreds
  [100, 'one hundred'],
  [123, 'one hundred and twenty-three'],

  // Thousands
  [1000, 'one thousand'],
  [1234, 'one thousand two hundred and thirty-four'],

  // Millions
  [1000000, 'one million'],

  // Negatives
  [-1, 'minus one'],
  [-42, 'minus forty-two'],

  // Decimals
  [3.14, 'three point one four'],

  // BigInt
  [BigInt(999), 'nine hundred and ninety-nine']

  // Language-specific options (if applicable)
  // [42, 'expected output', { option: true }]
]
`
}

/**
 * Update n2words.js with new language
 * @param {string} code - Language code
 * @param {string} className - Class name
 */
function updateN2wordsFile (code, className) {
  const n2wordsPath = './lib/n2words.js'
  let content = readFileSync(n2wordsPath, 'utf-8')

  // Find the last import statement
  const importLines = content.split('\n').filter(line => line.startsWith('import {'))
  const lastImport = importLines[importLines.length - 1]
  const lastImportIndex = content.indexOf(lastImport)
  const insertImportPos = content.indexOf('\n', lastImportIndex) + 1

  // Add import
  const importStatement = `import { ${className} } from './languages/${code}.js'\n`
  content = content.slice(0, insertImportPos) + importStatement + content.slice(insertImportPos)

  // Find the converter creation section
  const converterSectionStart = content.indexOf('// Create wrapper functions for ALL languages')
  const converterSectionEnd = content.indexOf('\nexport {', converterSectionStart)
  const lastConverterLine = content.lastIndexOf('\nconst', converterSectionEnd)
  const insertConverterPos = content.indexOf('\n', lastConverterLine) + 1

  // Add converter creation
  const converterStatement = `const ${className}Converter = makeConverter(${className})\n`
  content = content.slice(0, insertConverterPos) + converterStatement + content.slice(insertConverterPos)

  // Find export section
  const exportStart = content.indexOf('export {')
  const exportEnd = content.indexOf('}', exportStart)
  const lastExport = content.lastIndexOf(',', exportEnd)
  const insertExportPos = lastExport + 1

  // Add export (with proper indentation)
  const exportStatement = `\n  ${className}Converter`
  content = content.slice(0, insertExportPos) + exportStatement + content.slice(insertExportPos)

  writeFileSync(n2wordsPath, content)
}

/**
 * Main function
 */
function main () {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error(chalk.red('Error: Language code required'))
    console.log(chalk.gray('\nUsage: npm run lang:add <language-code>'))
    console.log(chalk.gray('\nExamples:'))
    console.log(chalk.gray('  npm run lang:add ko        # Korean'))
    console.log(chalk.gray('  npm run lang:add zh-Hans   # Simplified Chinese'))
    console.log(chalk.gray('  npm run lang:add fr-CA     # Canadian French'))
    process.exit(1)
  }

  const code = args[0]

  // Validate language code using Intl API (same as validator)
  const validation = validateLanguageCode(code)
  if (!validation.valid) {
    console.error(chalk.red(`Error: ${validation.error}`))
    console.log(chalk.gray('\nLanguage codes must follow IETF BCP 47 format:'))
    console.log(chalk.gray('  - 2-3 lowercase letters (language)'))
    console.log(chalk.gray('  - Optional: -Script (e.g., -Hans, -Latn)'))
    console.log(chalk.gray('  - Optional: -REGION (e.g., -US, -GB)'))
    console.log(chalk.gray('\nExamples: en, fr, zh-Hans, sr-Latn, fr-BE'))
    console.log(chalk.gray('\nSee: https://en.wikipedia.org/wiki/IETF_language_tag'))
    process.exit(1)
  }

  // Warn if using non-canonical form
  if (validation.canonical && validation.canonical !== code) {
    console.log(chalk.yellow(`\nWarning: Language code "${code}" will be canonicalized to "${validation.canonical}"`))
    console.log(chalk.gray('Consider using the canonical form for consistency.\n'))
  }

  const className = getLanguageName(code)
  const langFilePath = `./lib/languages/${code}.js`
  const fixtureFilePath = `./test/fixtures/languages/${code}.js`

  console.log(chalk.cyan(`\nAdding new language: ${code}`))
  console.log(chalk.gray(`Class name: ${className}`))

  // Check if language already exists
  if (existsSync(langFilePath)) {
    console.error(chalk.red(`\nError: Language file already exists: ${langFilePath}`))
    process.exit(1)
  }

  // Create language file
  console.log(chalk.gray(`\nCreating ${langFilePath}...`))
  writeFileSync(langFilePath, generateLanguageFile(code, className))
  console.log(chalk.green('✓ Created language file'))

  // Create test fixture file
  console.log(chalk.gray(`Creating ${fixtureFilePath}...`))
  const fixtureDir = './test/fixtures/languages'
  if (!existsSync(fixtureDir)) {
    mkdirSync(fixtureDir, { recursive: true })
  }
  writeFileSync(fixtureFilePath, generateTestFixture(code))
  console.log(chalk.green('✓ Created test fixture'))

  // Update n2words.js
  console.log(chalk.gray('Updating lib/n2words.js...'))
  updateN2wordsFile(code, className)
  console.log(chalk.green('✓ Updated n2words.js'))

  // Success message with next steps
  console.log(chalk.green(`\n✓ Successfully scaffolded ${code} language`))
  console.log(chalk.cyan('\nNext steps:'))
  console.log(chalk.gray('1. Edit ') + chalk.white(langFilePath))
  console.log(chalk.gray('   - Replace placeholder values'))
  console.log(chalk.gray('   - Add complete scaleWordPairs'))
  console.log(chalk.gray('   - Implement mergeScales() logic'))
  console.log(chalk.gray('\n2. Edit ') + chalk.white(fixtureFilePath))
  console.log(chalk.gray('   - Add comprehensive test cases'))
  console.log(chalk.gray('   - Include edge cases and language-specific features'))
  console.log(chalk.gray('\n3. Validate implementation:'))
  console.log(chalk.white(`   npm run lang:validate -- ${code} --verbose`))
  console.log(chalk.gray('\n4. Run tests:'))
  console.log(chalk.white('   npm test'))
}

main()

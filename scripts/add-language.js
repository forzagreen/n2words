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
 *   npm run lang:add <language-code> [--base=<base-class>]
 *
 * Base Classes:
 *   --base=greedy         GreedyScaleLanguage (default) - Scale-based decomposition
 *   --base=slavic         SlavicLanguage - Three-form pluralization (Slavic languages)
 *   --base=south-asian    SouthAsianLanguage - Indian numbering system
 *   --base=turkic         TurkicLanguage - Turkish-style implicit "bir" rules
 *   --base=abstract       AbstractLanguage - Direct implementation (advanced)
 *
 * Examples:
 *   npm run lang:add ko                      # Korean (GreedyScaleLanguage)
 *   npm run lang:add sr-Cyrl --base=slavic  # Serbian Cyrillic (SlavicLanguage)
 *   npm run lang:add ta --base=south-asian  # Tamil (SouthAsianLanguage)
 *   npm run lang:add az --base=turkic       # Azerbaijani (TurkicLanguage)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import chalk from 'chalk'
import { getExpectedClassName, validateLanguageCode } from './validate-language.js'

/**
 * Base class configurations
 */
const BASE_CLASSES = {
  greedy: {
    name: 'GreedyScaleLanguage',
    import: '../classes/greedy-scale-language.js',
    description: 'Scale-based decomposition (most common)'
  },
  slavic: {
    name: 'SlavicLanguage',
    import: '../classes/slavic-language.js',
    description: 'Three-form pluralization (Slavic languages)'
  },
  'south-asian': {
    name: 'SouthAsianLanguage',
    import: '../classes/south-asian-language.js',
    description: 'Indian numbering system (lakh, crore)'
  },
  turkic: {
    name: 'TurkicLanguage',
    import: '../classes/turkic-language.js',
    description: 'Turkish-style implicit "bir" rules'
  },
  abstract: {
    name: 'AbstractLanguage',
    import: '../classes/abstract-language.js',
    description: 'Direct implementation (advanced)'
  }
}

/**
 * Generate language implementation file
 * @param {string} className - Class name (e.g., 'English')
 * @param {string} baseType - Base class type ('greedy', 'slavic', 'south-asian', 'turkic', 'abstract')
 * @returns {string}
 */
function generateLanguageFile (className, baseType = 'greedy') {
  const base = BASE_CLASSES[baseType]

  if (baseType === 'greedy') {
    return generateGreedyLanguageFile(className, base)
  } else if (baseType === 'slavic') {
    return generateSlavicLanguageFile(className, base)
  } else if (baseType === 'south-asian') {
    return generateSouthAsianLanguageFile(className, base)
  } else if (baseType === 'turkic') {
    return generateTurkicLanguageFile(className, base)
  } else if (baseType === 'abstract') {
    return generateAbstractLanguageFile(className, base)
  }
}

/**
 * Generate GreedyScaleLanguage template
 * @param {string} className - Class name
 * @param {Object} base - Base class config
 * @returns {string}
 */
function generateGreedyLanguageFile (className, base) {
  return `import { ${base.name} } from '${base.import}'

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
export class ${className} extends ${base.name} {
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
 * Generate SlavicLanguage template
 * @param {string} className - Class name
 * @param {Object} base - Base class config
 * @returns {string}
 */
function generateSlavicLanguageFile (className, base) {
  return `import { ${base.name} } from '${base.import}'

/**
 * ${className} language converter.
 *
 * Supports three-form pluralization (singular/few/many) common in Slavic languages.
 * Gender agreement (masculine/feminine) is inherited from SlavicLanguage base class.
 *
 * TODO: Document language-specific pluralization rules
 */
export class ${className} extends ${base.name} {
  negativeWord = 'minus' // TODO: Replace with ${className} word
  decimalSeparatorWord = 'point' // TODO: Replace with ${className} word
  zeroWord = 'zero' // TODO: Replace with ${className} word

  // TODO: Define masculine forms for 1-9
  ones = {
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine'
  }

  // TODO: Define feminine forms for 1-9 (if applicable)
  onesFeminine = {
    1: 'one',
    2: 'two',
    // ... etc
  }

  // TODO: Define words for 10-19
  tens = {
    0: 'ten',
    1: 'eleven',
    2: 'twelve',
    3: 'thirteen',
    4: 'fourteen',
    5: 'fifteen',
    6: 'sixteen',
    7: 'seventeen',
    8: 'eighteen',
    9: 'nineteen'
  }

  // TODO: Define words for 20-90 (multiples of ten)
  twenties = {
    2: 'twenty',
    3: 'thirty',
    4: 'forty',
    5: 'fifty',
    6: 'sixty',
    7: 'seventy',
    8: 'eighty',
    9: 'ninety'
  }

  // TODO: Define words for hundreds (100-900)
  hundreds = {
    1: 'one hundred',
    2: 'two hundred',
    // ... etc
  }

  // TODO: Define plural forms for scale words [singular, few, many]
  // Example for Russian: ['тысяча', 'тысячи', 'тысяч']
  pluralForms = {
    1: ['thousand', 'thousands', 'thousands'], // 10^3 - TODO: Replace
    2: ['million', 'millions', 'millions'], // 10^6 - TODO: Replace
    3: ['billion', 'billions', 'billions'], // 10^9 - TODO: Replace
    4: ['trillion', 'trillions', 'trillions'] // 10^12 - TODO: Replace
  }
}
`
}

/**
 * Generate SouthAsianLanguage template
 * @param {string} className - Class name
 * @param {Object} base - Base class config
 * @returns {string}
 */
function generateSouthAsianLanguageFile (className, base) {
  return `import { ${base.name} } from '${base.import}'

/**
 * ${className} language converter.
 *
 * Uses Indian numbering system with lakh (100,000) and crore (10,000,000).
 *
 * TODO: Document language-specific number patterns
 */
export class ${className} extends ${base.name} {
  negativeWord = 'minus' // TODO: Replace with ${className} word
  decimalSeparatorWord = 'point' // TODO: Replace with ${className} word
  zeroWord = 'zero' // TODO: Replace with ${className} word

  // TODO: Define words for 0-99 (belowHundred array)
  belowHundred = [
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
    'twenty', 'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine',
    // TODO: Continue through 99
  ]

  // TODO: Define word for "hundred"
  hundredWord = 'hundred'

  // TODO: Define scale words [empty, thousand, lakh, crore, ...]
  scaleWords = [
    '',         // ones (no scale word)
    'thousand', // TODO: Replace with ${className} word for 1,000
    'lakh',     // TODO: Replace with ${className} word for 100,000
    'crore',    // TODO: Replace with ${className} word for 10,000,000
    'arab'      // TODO: Replace with ${className} word for 1,000,000,000
  ]
}
`
}

/**
 * Generate TurkicLanguage template
 * @param {string} className - Class name
 * @param {Object} base - Base class config
 * @returns {string}
 */
function generateTurkicLanguageFile (className, base) {
  return `import { ${base.name} } from '${base.import}'

/**
 * ${className} language converter.
 *
 * Turkic languages typically omit "bir" (one) before hundreds and thousands.
 * Inherits from GreedyScaleLanguage with Turkic-specific merge logic.
 *
 * TODO: Document language-specific grammar rules
 */
export class ${className} extends ${base.name} {
  negativeWord = 'minus' // TODO: Replace with ${className} word
  decimalSeparatorWord = 'point' // TODO: Replace with ${className} word
  zeroWord = 'zero' // TODO: Replace with ${className} word

  scaleWordPairs = [
    // TODO: Add scale word pairs in descending order
    // Format: [value as bigint, word as string]
    // Example for Turkish:
    // [1000000n, 'milyon'],
    // [1000n, 'bin'],
    // [100n, 'yüz'],
    // [90n, 'doksan'],
    // ... down to 1n
    [1n, 'one'] // Placeholder - replace with complete list
  ]

  // Note: TurkicLanguage provides default mergeScales() implementation
  // that handles implicit "bir" rules. Override only if needed.
}
`
}

/**
 * Generate AbstractLanguage template
 * @param {string} className - Class name
 * @param {Object} base - Base class config
 * @returns {string}
 */
function generateAbstractLanguageFile (className, base) {
  return `import { ${base.name} } from '${base.import}'

/**
 * ${className} language converter.
 *
 * Direct implementation using AbstractLanguage.
 * This requires implementing convertWholePart() from scratch.
 *
 * TODO: Document language-specific conversion logic
 */
export class ${className} extends ${base.name} {
  negativeWord = 'minus' // TODO: Replace with ${className} word
  decimalSeparatorWord = 'point' // TODO: Replace with ${className} word
  zeroWord = 'zero' // TODO: Replace with ${className} word
  wordSeparator = ' '

  /**
   * Convert a whole number (bigint) to words.
   *
   * @param {bigint} wholeNumber - The number to convert
   * @returns {string} The number in words
   */
  convertWholePart (wholeNumber) {
    if (wholeNumber === 0n) {
      return this.zeroWord
    }

    // TODO: Implement conversion logic for ${className}
    // This is where you write the core number-to-words algorithm
    // for your language.

    throw new Error('convertWholePart() not yet implemented for ${className}')
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

  // Find the Language Imports section and add import alphabetically
  const importSectionStart = content.indexOf('// Language Imports')
  const importSectionEnd = content.indexOf('\n// =', importSectionStart + 1)

  // Find where the closing divider ends (after the ====... line)
  const dividerEnd = content.indexOf('\n', importSectionEnd + 1)

  // Skip any empty lines after the divider to find first import
  let importStart = dividerEnd + 1
  while (content[importStart] === '\n') {
    importStart++
  }

  const importSection = content.slice(importStart, content.indexOf('\n// =', importStart))
  const importLines = importSection.split('\n').filter(line => line.trim().startsWith('import {'))

  // Create new import statement
  const newImport = `import { ${className} } from './languages/${code}.js'`

  // Find the correct position alphabetically
  let insertPos = -1
  for (let i = 0; i < importLines.length; i++) {
    if (importLines[i] > newImport) {
      const lineInFullContent = content.indexOf(importLines[i], importStart)
      insertPos = lineInFullContent
      break
    }
  }

  // If not found, insert at the end of imports (before next section divider)
  if (insertPos === -1) {
    // Find the next section divider
    const nextDivider = content.indexOf('\n// =', importStart)
    insertPos = nextDivider
  }

  content = content.slice(0, insertPos) + newImport + '\n' + content.slice(insertPos)

  // Find the Language Converters section and add converter alphabetically
  const converterSectionStart = content.indexOf('// Language Converters')
  const converterDividerEnd = content.indexOf('\n', content.indexOf('\n// =', converterSectionStart) + 1)

  // Skip any empty lines and comments after the divider
  let converterStart = converterDividerEnd + 1
  while (content[converterStart] === '\n' || content.substring(converterStart, converterStart + 2) === '//') {
    converterStart = content.indexOf('\n', converterStart) + 1
  }

  const converterSectionEnd = content.indexOf('\n// =', converterStart)
  const converterSection = content.slice(converterStart, converterSectionEnd)
  const converterLines = converterSection.split('\n').filter(line => line.trim().startsWith('const ') && line.includes('Converter'))

  // Create new converter statement (no options for new languages by default)
  const newConverter = `const ${className}Converter = /** @type {(value: NumericValue) => string} */ (makeConverter(${className}))`

  // Find the correct position alphabetically by converter name
  const converterName = `${className}Converter`
  insertPos = -1
  for (let i = 0; i < converterLines.length; i++) {
    const existingConverterName = converterLines[i].match(/const\s+(\w+Converter)/)?.[1]
    if (existingConverterName && existingConverterName > converterName) {
      const lineInFullContent = content.indexOf(converterLines[i], converterStart)
      insertPos = lineInFullContent
      break
    }
  }

  // If not found, insert at the end of converters (before next section divider)
  if (insertPos === -1) {
    insertPos = converterSectionEnd
  }

  content = content.slice(0, insertPos) + newConverter + '\n' + content.slice(insertPos)

  // Find export section and add export alphabetically
  const exportStart = content.indexOf('export {')
  const exportEnd = content.indexOf('}', exportStart)
  const exportSection = content.slice(exportStart, exportEnd)
  const exportLines = exportSection.split('\n').filter(line => line.trim() && line.trim() !== 'export {')

  // Create new export statement
  const newExport = `  ${className}Converter,`

  // Find the correct position alphabetically
  insertPos = -1
  for (let i = 0; i < exportLines.length; i++) {
    const trimmed = exportLines[i].trim()
    if (trimmed > `${className}Converter,`) {
      const lineInFullContent = content.indexOf(exportLines[i], exportStart)
      insertPos = lineInFullContent
      break
    }
  }

  // If not found, insert before the closing brace
  if (insertPos === -1) {
    insertPos = exportEnd
  }

  content = content.slice(0, insertPos) + newExport + '\n' + content.slice(insertPos)

  writeFileSync(n2wordsPath, content)
}

/**
 * Prompt user for base class selection
 * @returns {Promise<string>} Selected base class type
 */
async function promptForBaseClass () {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  console.log(chalk.cyan('\nSelect a base class for your language:\n'))

  const options = Object.entries(BASE_CLASSES).map(([key, config], index) => ({
    key,
    index: index + 1,
    ...config
  }))

  // Display options
  options.forEach(option => {
    const isDefault = option.key === 'greedy' ? chalk.yellow(' (default)') : ''
    console.log(`  ${chalk.white(option.index)}. ${chalk.bold(option.name)}${isDefault}`)
    console.log(`     ${chalk.gray(option.description)}`)
    console.log()
  })

  return new Promise((resolve) => {
    rl.question(chalk.cyan('Enter your choice (1-5) [1]: '), (answer) => {
      rl.close()

      const trimmed = answer.trim()

      // Default to greedy if empty
      if (trimmed === '') {
        console.log(chalk.gray('Using default: GreedyScaleLanguage\n'))
        resolve('greedy')
        return
      }

      // Parse selection
      const selection = parseInt(trimmed, 10)

      if (isNaN(selection) || selection < 1 || selection > options.length) {
        console.error(chalk.red(`\nInvalid selection: "${answer}"`))
        console.log(chalk.gray('Please run the command again and choose 1-5.\n'))
        process.exit(1)
      }

      const selected = options[selection - 1]
      console.log(chalk.gray(`Selected: ${selected.name}\n`))
      resolve(selected.key)
    })
  })
}

/**
 * Main function
 */
async function main () {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error(chalk.red('Error: Language code required'))
    console.log(chalk.gray('\nUsage: npm run lang:add <language-code> [--base=<base-class>]'))
    console.log(chalk.gray('\nBase Classes:'))
    for (const [key, config] of Object.entries(BASE_CLASSES)) {
      console.log(chalk.gray(`  --base=${key.padEnd(12)} ${config.description}`))
    }
    console.log(chalk.gray('\nExamples:'))
    console.log(chalk.gray('  npm run lang:add ko                      # Korean (GreedyScaleLanguage)'))
    console.log(chalk.gray('  npm run lang:add sr-Cyrl --base=slavic  # Serbian Cyrillic (SlavicLanguage)'))
    console.log(chalk.gray('  npm run lang:add ta --base=south-asian  # Tamil (SouthAsianLanguage)'))
    process.exit(1)
  }

  // Parse arguments
  const code = args.find(arg => !arg.startsWith('--'))
  const baseArg = args.find(arg => arg.startsWith('--base='))
  let baseType = baseArg ? baseArg.split('=')[1] : null

  if (!code) {
    console.error(chalk.red('Error: Language code required'))
    process.exit(1)
  }

  // Validate base class type if provided via argument
  if (baseType && !BASE_CLASSES[baseType]) {
    console.error(chalk.red(`Error: Invalid base class "${baseType}"`))
    console.log(chalk.gray('\nValid base classes:'))
    for (const [key, config] of Object.entries(BASE_CLASSES)) {
      console.log(chalk.gray(`  ${key.padEnd(12)} - ${config.description}`))
    }
    process.exit(1)
  }

  // If no base class specified via argument, prompt the user
  if (!baseType) {
    baseType = await promptForBaseClass()
  }

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

  const className = getExpectedClassName(code)

  // If CLDR doesn't provide a name (rare/historical languages), ask user or use code
  if (!className) {
    console.log(chalk.yellow(`\nWarning: CLDR does not provide a display name for "${code}"`))
    console.log(chalk.gray('For rare or historical languages, you must provide a descriptive class name.'))
    console.log(chalk.gray('Example: "hbo" → "BiblicalHebrew"\n'))
    console.error(chalk.red('Error: Cannot auto-generate class name for this language code.'))
    console.log(chalk.gray('Please add this language manually or use a recognized language code.'))
    process.exit(1)
  }

  const langFilePath = `./lib/languages/${code}.js`
  const fixtureFilePath = `./test/fixtures/languages/${code}.js`
  const baseClass = BASE_CLASSES[baseType]

  console.log(chalk.cyan(`\nAdding new language: ${code}`))
  console.log(chalk.gray(`Class name: ${className}`))
  console.log(chalk.gray(`Base class: ${baseClass.name} (${baseClass.description})`))

  // Check if language already exists
  if (existsSync(langFilePath)) {
    console.error(chalk.red(`\nError: Language file already exists: ${langFilePath}`))
    process.exit(1)
  }

  // Create language file
  console.log(chalk.gray(`\nCreating ${langFilePath}...`))
  writeFileSync(langFilePath, generateLanguageFile(className, baseType))
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
  console.log(chalk.green(`\n✓ Successfully scaffolded ${code} language using ${baseClass.name}`))
  console.log(chalk.cyan('\nNext steps:'))
  console.log(chalk.gray('1. Edit ') + chalk.white(langFilePath))
  console.log(chalk.gray('   - Replace placeholder values with actual ' + code + ' words'))

  // Base-class specific instructions
  if (baseType === 'greedy' || baseType === 'turkic') {
    console.log(chalk.gray('   - Add complete scaleWordPairs array'))
    console.log(chalk.gray('   - Implement mergeScales() logic (if needed)'))
  } else if (baseType === 'slavic') {
    console.log(chalk.gray('   - Define ones, tens, twenties, hundreds dictionaries'))
    console.log(chalk.gray('   - Add pluralForms for scale words [singular, few, many]'))
  } else if (baseType === 'south-asian') {
    console.log(chalk.gray('   - Complete belowHundred array (0-99)'))
    console.log(chalk.gray('   - Define scaleWords [hazaar, lakh, crore, arab]'))
  } else if (baseType === 'abstract') {
    console.log(chalk.gray('   - Implement convertWholePart() method'))
  }

  console.log(chalk.gray('\n2. Edit ') + chalk.white(fixtureFilePath))
  console.log(chalk.gray('   - Add comprehensive test cases'))
  console.log(chalk.gray('   - Include edge cases and language-specific features'))
  console.log(chalk.gray('\n3. Validate implementation:'))
  console.log(chalk.white(`   npm run lang:validate -- ${code} --verbose`))
  console.log(chalk.gray('\n4. Run tests:'))
  console.log(chalk.white('   npm test'))
}

main()

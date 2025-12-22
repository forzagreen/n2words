#!/usr/bin/env node

/**
 * Interactive script to add a new language to n2words
 *
 * Usage: node scripts/add-language.js
 *
 * This script will:
 * 1. Prompt for language details (code, name, base class)
 * 2. Generate language implementation boilerplate
 * 3. Generate test file boilerplate
 * 4. Update lib/n2words.js with imports and registration
 * 5. Provide next steps for implementation
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import chalk from 'chalk'

const rl = createInterface({ input, output })

console.log(chalk.gray('='.repeat(60)))
console.log(chalk.cyan('n2words - Add New Language'))
console.log(chalk.gray('='.repeat(60)))
console.log()

// Prompt for language details
const langCode = await rl.question(
  'Language code (e.g., "ja", "sv", "fr-CA"): '
)
const langName = await rl.question(
  'Language name (e.g., "Japanese", "Swedish"): '
)
console.log(chalk.cyan('\nBase class options:'))
console.log(
  '  1. GreedyScaleLanguage (most languages: en, de, fr, es, pt, etc.)'
)
console.log('  2. SlavicLanguage (Slavic/Baltic: ru, pl, cs, uk, he, lt, lv)')
console.log('  3. TurkicLanguage (Turkic: tr, az)')
console.log('  4. SouthAsianLanguage (Indian-style grouping: hi, bn, ur, pa, mr, gu, kn)')
console.log('  5. AbstractLanguage (custom implementations: ar, vi, ro, etc.)')
const baseClassChoice =
  (await rl.question('Choose base class (1-5) [1]: ')) || '1'
const baseClassMap = {
  1: 'GreedyScaleLanguage',
  2: 'SlavicLanguage',
  3: 'TurkicLanguage',
  4: 'SouthAsianLanguage',
  5: 'AbstractLanguage'
}
const baseClass = baseClassMap[baseClassChoice] || 'GreedyScaleLanguage'
const negativeWord =
  (await rl.question(
    'Word for negative numbers (e.g., "minus", "negative") [minus]: '
  )) || 'minus'
const separatorWord =
  (await rl.question(
    'Word for decimal point (e.g., "point", "dot") [point]: '
  )) || 'point'
const zeroWord = (await rl.question('Word for zero [zero]: ')) || 'zero'

rl.close()

console.log()
console.log(chalk.cyan('Generating files...'))

// Validate inputs
if (!langCode || !langCode.match(/^[a-z]{2,3}(-[A-Z]{2})?(-[a-zA-Z0-9]{4,8})*$/)) {
  console.error(chalk.red('✗ Error: Invalid language code. Use IETF BCP 47 format (e.g., "en", "fr-BE", "nb", "fil")'))
  process.exit(1)
}

/**
 * Convert a language name to a PascalCase class name.
 * Strips diacritics, normalizes characters, and capitalizes words.
 *
 * @param {string} name The language name (e.g., "Japanese", "Français")
 * @param {string} code Fallback language code if name is empty
 * @returns {string} PascalCase class name (e.g., "Japanese", "Francais")
 */
function toClassName (name, code) {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()

  if (!normalized) return code.toUpperCase().replace('-', '')

  return normalized
    .split(/\s+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

const fileName = langCode
const className = toClassName(langName, langCode)
const constName = langCode.replace('-', '')

if (existsSync(`lib/languages/${fileName}.js`)) {
  console.error(chalk.red(`✗ Error: Language file lib/languages/${fileName}.js already exists`))
  process.exit(1)
}

const baseClassFile = baseClass
  .replace(/([A-Z])/g, '-$1')
  .toLowerCase()
  .substring(1) // Remove leading hyphen
let languageTemplate

if (baseClass === 'SouthAsianLanguage') {
  languageTemplate = `import ${baseClass} from '../classes/${baseClassFile}.js'

/**
 * ${langName} language implementation
 * Converts numeric values to written ${langName}.
 *
 * @example
 * convertToWords(42) // => TODO: Add example output
 * convertToWords(1000) // => TODO: Add example output
 */
export default function convertToWords (value, options = {}) {
  return new ${className}(options).convertToWords(value)
}

/**
 * ${langName} number-to-words converter
 */
class ${className} extends ${baseClass} {
  negativeWord = '${negativeWord}'
  decimalSeparatorWord = '${separatorWord}'
  zeroWord = '${zeroWord}'
  convertDecimalsPerDigit = false

  // South Asian grouping properties
  hundredWord = 'TODO' // e.g., 'सौ' (Hindi) / 'শত' (Bengali)
  belowHundred = [
    // Fill words for 0..99 in order
    // 'TODO 0', 'TODO 1', ..., 'TODO 99'
  ]

  // Indexed scale words: 0 = none, 1 = thousand, 2 = lakh, 3 = crore, etc.
  scaleWords = [
    '',
    'TODO thousand',
    'TODO lakh',
    'TODO crore'
  ]
}
`
} else if (baseClass === 'SlavicLanguage') {
  languageTemplate = `import ${baseClass} from '../classes/${baseClassFile}.js'

/**
 * ${langName} language implementation
 * Converts numeric values to written ${langName}.
 */
export default function convertToWords (value, options = {}) {
  return new ${className}(options).convertToWords(value)
}

class ${className} extends ${baseClass} {
  negativeWord = '${negativeWord}'
  decimalSeparatorWord = '${separatorWord}'
  zeroWord = '${zeroWord}'

  // Core maps (fill with language words)
  ones = {}
  onesFeminine = {}
  tens = {}
  twenties = {}
  hundreds = {}
  thousands = {}

  // Optional: feminine forms flag
  constructor (options = {}) {
    options = {
      ...{
        feminine: false
      },
      ...options
    }

    super()
    this.feminine = options.feminine
  }
}
`
} else {
  // GreedyScaleLanguage and TurkicLanguage (scale-based)
  languageTemplate = `import ${baseClass} from '../classes/${baseClassFile}.js'

/**
 * ${langName} language implementation
 * Converts numeric values to written ${langName}.
 *
 * @example
 * convertToWords(42) // => TODO: Add example output
 * convertToWords(1000) // => TODO: Add example output
 */
export default function convertToWords (value, options = {}) {
  return new ${className}(options).convertToWords(value)
}

/**
 * ${langName} number-to-words converter
 */
class ${className} extends ${baseClass} {
  negativeWord = '${negativeWord}'
  decimalSeparatorWord = '${separatorWord}'
  zeroWord = '${zeroWord}'
  convertDecimalsPerDigit = false

  // Define scaleWordPairs in DESCENDING order
  // Format: [value_as_BigInt, 'word']
  scaleWordPairs = [
    // [1000000n, 'million'],
    // [1000n, 'thousand'],
    // [100n, 'hundred'],
    // [90n, 'ninety'],
    // ...
    // [1n, 'one']
  ]

  // Optional: override mergeScales for language-specific grammar
  // mergeScales (leftWordSet, rightWordSet) {
  //   // TODO: Implement if needed
  // }
}
`
}

// Generate test file
const testTemplate = `/**
 * ${langName} (${langCode}) language tests
 *
 * Test cases for ${langName} number-to-words conversion
 */

export default [
  // Basic numbers
  [0, '${zeroWord}'],
  [1, 'TODO'], // Add ${langName} word for "one"
  [2, 'TODO'], // Add ${langName} word for "two"
  [10, 'TODO'], // Add ${langName} word for "ten"
  [11, 'TODO'],
  [19, 'TODO'],
  [20, 'TODO'],
  [21, 'TODO'],
  [99, 'TODO'],
  [100, 'TODO'],
  [101, 'TODO'],
  [200, 'TODO'],
  [999, 'TODO'],

  // Thousands
  [1000, 'TODO'],
  [1001, 'TODO'],
  [2000, 'TODO'],
  [12345, 'TODO'],

  // Millions
  [1000000, 'TODO'],

  // Negative numbers
  [-5, '${negativeWord} TODO'], // Combine negative word with number

  // Decimals
  ['3.14', 'TODO ${separatorWord} TODO'], // "three point one four" or equivalent
  ['0.5', 'TODO ${separatorWord} TODO']

  // TODO: Add more test cases covering:
  // - Edge cases specific to ${langName}
  // - Large numbers
  // - Special grammar rules
  // - Decimal numbers with leading zeros (e.g., '3.005')
]
`

// Write language file
writeFileSync(`lib/languages/${fileName}.js`, languageTemplate)
console.log(chalk.green(`✓ Created lib/languages/${fileName}.js`))

// Write test file
writeFileSync(`test/fixtures/languages/${fileName}.js`, testTemplate)
console.log(chalk.green(`✓ Created test/fixtures/languages/${fileName}.js`))

// Update lib/n2words.js
const n2wordsPath = 'lib/n2words.js'
let n2wordsContent = readFileSync(n2wordsPath, 'utf8')

// Find the last import and add new import after it
const lastImportMatch = n2wordsContent.match(
  /import \w+ from '\.\/languages\/[^']+\.js'\n/g
)
if (lastImportMatch) {
  const lastImport = lastImportMatch[lastImportMatch.length - 1]
  const importStatement = `import ${constName} from './languages/${fileName}.js'\n`
  n2wordsContent = n2wordsContent.replace(
    lastImport,
    lastImport + importStatement
  )
  console.log(chalk.green('✓ Added import to lib/n2words.js'))
}

// Add to dict (find last entry and add new one)
const dictMatch = n2wordsContent.match(/const dict = \{[\s\S]*?\n\}/m)
if (dictMatch) {
  const dictBlock = dictMatch[0]
  const lines = dictBlock.split('\n')
  const closingBraceIndex = lines.length - 1

  // Find the last non-empty line before closing brace and ensure it has a trailing comma
  for (let i = closingBraceIndex - 1; i >= 0; i--) {
    const line = lines[i].trim()
    if (line && !line.startsWith('//')) {
      // Add comma if missing
      if (!line.endsWith(',')) {
        lines[i] = lines[i] + ','
      }
      break
    }
  }

  // Determine if we need quoted key or not
  const dictEntry = langCode.includes('-')
    ? `  '${langCode}': ${constName}`
    : `  ${constName}`

  lines.splice(closingBraceIndex, 0, dictEntry)
  const newDictBlock = lines.join('\n')
  n2wordsContent = n2wordsContent.replace(dictBlock, newDictBlock)
  console.log(chalk.green(`✓ Added '${langCode}' to dict in lib/n2words.js`))
}

writeFileSync(n2wordsPath, n2wordsContent)

console.log()
console.log(chalk.gray('='.repeat(60)))
console.log(chalk.green('✓ Language boilerplate created successfully!'))
console.log(chalk.gray('='.repeat(60)))
console.log()
console.log(chalk.cyan('Next steps:'))
console.log()
console.log(`1. Edit lib/languages/${fileName}.js:`)
if (baseClass === 'SouthAsianLanguage') {
  console.log('   - Fill in the belowHundred array (0..99)')
  console.log('   - Set hundredWord and scaleWords (indexed grouping words)')
} else if (baseClass === 'SlavicLanguage') {
  console.log('   - Fill ones/onesFeminine/tens/twenties/hundreds/thousands maps')
  console.log('   - Use feminine option if needed')
} else {
  console.log('   - Fill in the scaleWordPairs array in DESCENDING order')
  console.log('   - Implement/adjust mergeScales() according to grammar (if needed)')
}
console.log()
console.log(`2. Edit test/fixtures/languages/${fileName}.js:`)
console.log('   - Replace "TODO" with actual expected outputs')
console.log('   - Add comprehensive test cases')
console.log()
console.log('3. Test your implementation:')
console.log('   npm test')
console.log()
console.log('4. Run the linter:')
console.log('   npm run lint:js')
console.log()
console.log('5. Build and verify:')
console.log('   npm run web:build')
console.log()
console.log(chalk.cyan('Reference implementations:'))
console.log('   - Simple: lib/languages/en.js')
console.log('   - Complex: lib/languages/pt.js, lib/languages/fr.js')
console.log()

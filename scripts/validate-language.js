#!/usr/bin/env node

/**
 * Validate a language implementation
 *
 * Usage: node scripts/validate-language.js <language-code>
 *
 * Checks:
 * - Language file exists and exports correctly
 * - Test file exists and has comprehensive cases
 * - Language is registered in lib/n2words.js
 * - Implementation follows best practices
 */

import { existsSync, readFileSync } from 'node:fs'
import { argv } from 'node:process'
import chalk from 'chalk'

const langCode = argv[2]

if (!langCode) {
  console.error(chalk.red('Usage: node scripts/validate-language.js <language-code>'))
  console.error(chalk.gray('Example: node scripts/validate-language.js fr'))
  process.exit(1)
}

console.log(chalk.cyan(`Validating language: ${langCode}`))
console.log(chalk.gray('='.repeat(60)))

let errors = 0
let warnings = 0

// Check 1: Language file exists
const langFile = `lib/i18n/${langCode}.js`
if (!existsSync(langFile)) {
  console.error(chalk.red(`✗ Language file not found: ${langFile}`))
  errors++
} else {
  console.log(chalk.green(`✓ Language file exists: ${langFile}`))

  // Check file content
  const content = readFileSync(langFile, 'utf8')

  // Check for default export
  if (!content.includes('export default')) {
    console.error(chalk.red('  ✗ Missing default export'))
    errors++
  } else {
    console.log(chalk.green('  ✓ Has default export'))
  }

  // Check for BigInt literals in cards (not required for all AbstractLanguage implementations)
  if (!content.includes('n,') && !content.includes('n]') && !content.includes('n ')) {
    console.warn(
      chalk.yellow('  ⚠ No BigInt literals found (cards/numbers should use 1000n, 100n, etc.)')
    )
    warnings++
  } else {
    console.log(chalk.green('  ✓ Uses BigInt literals'))
  }

  // Check for merge method
  // - CardMatchLanguage: requires merge() override OR toCardinal() override
  // - SlavicLanguage: has merge() in base class (no override needed)
  // - ScandinavianLanguage: has merge() in base class (no override needed)
  // - TurkicLanguage: has merge() in base class (no override needed)
  // - AbstractLanguage: doesn't use merge()
  const usesCardMatch = content.includes('extends CardMatchLanguage')
  const hasMerge = content.includes('merge')
  const hasToCardinal = content.includes('toCardinal')

  if (usesCardMatch && !hasMerge && !hasToCardinal) {
    console.error(chalk.red('  ✗ Missing merge() or toCardinal() method (required for CardMatchLanguage)'))
    errors++
  } else if (hasMerge) {
    console.log(chalk.green('  ✓ Has merge() method'))
  } else if (usesCardMatch && hasToCardinal) {
    console.log(chalk.green('  ✓ Overrides toCardinal() method'))
  } else {
    console.log(chalk.green('  ✓ Base class provides merge() implementation'))
  }

  // Check for TODO comments
  if (content.includes('TODO')) {
    console.warn(
      chalk.yellow('  ⚠ Contains TODO comments - implementation may be incomplete')
    )
    warnings++
  }

  // Check imports
  if (
    !content.includes('CardMatchLanguage') &&
    !content.includes('SlavicLanguage') &&
    !content.includes('ScandinavianLanguage') &&
    !content.includes('TurkicLanguage') &&
    !content.includes('AbstractLanguage') &&
    !content.match(/extends [A-Z]{2,}/) // Allow extending other language classes (e.g., FR)
  ) {
    console.error(chalk.red('  ✗ Does not extend any recognized base class or language'))
    errors++
  } else {
    console.log(chalk.green('  ✓ Extends appropriate base class'))
  }
}

// Check 2: Test file exists
const testFile = `test/i18n/${langCode}.js`
if (!existsSync(testFile)) {
  console.error(chalk.red(`✗ Test file not found: ${testFile}`))
  errors++
} else {
  console.log(chalk.green(`✓ Test file exists: ${testFile}`))

  const testContent = readFileSync(testFile, 'utf8')

  // Check for export default
  if (!testContent.includes('export default')) {
    console.error(chalk.red('  ✗ Missing export default'))
    errors++
  } else {
    console.log(chalk.green('  ✓ Exports test cases'))
  }

  // Check for test cases
  const testCases = (testContent.match(/\[.*,.*\]/g) || []).length
  if (testCases < 10) {
    console.warn(chalk.yellow(`  ⚠ Only ${testCases} test cases found (recommended: 20+)`))
    warnings++
  } else {
    console.log(chalk.green(`  ✓ Has ${testCases} test cases`))
  }

  // Check for TODO in tests
  if (testContent.includes('TODO')) {
    console.warn(chalk.yellow('  ⚠ Test file contains TODO - tests may be incomplete'))
    warnings++
  }

  // Check for key test scenarios
  const scenarios = {
    negative: testContent.includes('-'),
    decimal: testContent.includes('.'),
    large: testContent.includes('1000000') || testContent.includes('million'),
    zero: testContent.includes('[0,')
  }

  if (scenarios.negative) console.log(chalk.green('  ✓ Tests negative numbers'))
  else {
    console.warn(chalk.yellow('  ⚠ Missing negative number tests'))
    warnings++
  }

  if (scenarios.decimal) console.log(chalk.green('  ✓ Tests decimal numbers'))
  else {
    console.warn(chalk.yellow('  ⚠ Missing decimal number tests'))
    warnings++
  }

  if (scenarios.large) console.log(chalk.green('  ✓ Tests large numbers'))
  else {
    console.warn(chalk.yellow('  ⚠ Missing large number tests'))
    warnings++
  }

  if (scenarios.zero) console.log(chalk.green('  ✓ Tests zero'))
  else {
    console.warn(chalk.yellow('  ⚠ Missing zero test'))
    warnings++
  }
}

// Check 3: Registration in lib/n2words.js
const n2wordsFile = 'lib/n2words.js'
const n2wordsContent = readFileSync(n2wordsFile, 'utf8')

const constName = langCode.replace('-', '')
const importRegex = new RegExp(
  `import ${constName} from '\\./i18n/${langCode}\\.js'`
)
if (!importRegex.test(n2wordsContent)) {
  console.error(chalk.red(`✗ Not imported in ${n2wordsFile}`))
  errors++
} else {
  console.log(chalk.green(`✓ Imported in ${n2wordsFile}`))
}

const dictKeyRegex = langCode.includes('-')
  ? new RegExp(`['"]${langCode}['"]:\\s*${constName}[,\\s\\}]`)
  : new RegExp(`\\b${constName}[,\\s\\}]`)

if (!dictKeyRegex.test(n2wordsContent)) {
  console.error(chalk.red(`✗ Not registered in dict in ${n2wordsFile}`))
  errors++
} else {
  console.log(chalk.green('✓ Registered in dict'))
}

console.log(chalk.gray('='.repeat(60)))

if (errors === 0 && warnings === 0) {
  console.log(chalk.green('✓ Validation passed! Language implementation looks good.'))
  console.log()
  console.log(chalk.cyan('Next steps:'))
  console.log(chalk.gray('  1. Run tests: npm test'))
  console.log(chalk.gray('  2. Run linter: npm run lint:js'))
  console.log(chalk.gray('  3. Build: npm run build:web'))
  process.exit(0)
} else {
  if (errors > 0) {
    console.error(
      chalk.red(`\n✗ Validation failed with ${errors} error(s) and ${warnings} warning(s)`)
    )
    console.error(chalk.red('Please fix the errors above before proceeding.'))
    process.exit(1)
  } else {
    console.warn(chalk.yellow(`\n⚠ Validation passed with ${warnings} warning(s)`))
    console.warn(
      chalk.yellow('Consider addressing the warnings for a complete implementation.')
    )
    process.exit(0)
  }
}

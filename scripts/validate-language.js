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

const langCode = argv[2]

if (!langCode) {
  console.error('Usage: node scripts/validate-language.js <language-code>')
  console.error('Example: node scripts/validate-language.js fr')
  process.exit(1)
}

console.log(`Validating language: ${langCode}`)
console.log('='.repeat(60))

let errors = 0
let warnings = 0

// Check 1: Language file exists
const langFile = `lib/i18n/${langCode}.js`
if (!existsSync(langFile)) {
  console.error(`✗ Language file not found: ${langFile}`)
  errors++
} else {
  console.log(`✓ Language file exists: ${langFile}`)

  // Check file content
  const content = readFileSync(langFile, 'utf8')

  // Check for default export
  if (!content.includes('export default')) {
    console.error('  ✗ Missing default export')
    errors++
  } else {
    console.log('  ✓ Has default export')
  }

  // Check for BigInt literals in cards
  if (!content.includes('n,') && !content.includes('n]')) {
    console.warn('  ⚠ No BigInt literals found (cards should use 1000n, 100n, etc.)')
    warnings++
  } else {
    console.log('  ✓ Uses BigInt literals')
  }

  // Check for merge method
  if (!content.includes('merge')) {
    console.error('  ✗ Missing merge() method')
    errors++
  } else {
    console.log('  ✓ Has merge() method')
  }

  // Check for TODO comments
  if (content.includes('TODO')) {
    console.warn('  ⚠ Contains TODO comments - implementation may be incomplete')
    warnings++
  }

  // Check imports
  if (!content.includes('BaseLanguage') && !content.includes('AbstractLanguage')) {
    console.error('  ✗ Does not extend BaseLanguage or AbstractLanguage')
    errors++
  } else {
    console.log('  ✓ Extends appropriate base class')
  }
}

// Check 2: Test file exists
const testFile = `test/i18n/${langCode}.js`
if (!existsSync(testFile)) {
  console.error(`✗ Test file not found: ${testFile}`)
  errors++
} else {
  console.log(`✓ Test file exists: ${testFile}`)

  const testContent = readFileSync(testFile, 'utf8')

  // Check for export default
  if (!testContent.includes('export default')) {
    console.error('  ✗ Missing export default')
    errors++
  } else {
    console.log('  ✓ Exports test cases')
  }

  // Check for test cases
  const testCases = (testContent.match(/\[.*,.*\]/g) || []).length
  if (testCases < 10) {
    console.warn(`  ⚠ Only ${testCases} test cases found (recommended: 20+)`)
    warnings++
  } else {
    console.log(`  ✓ Has ${testCases} test cases`)
  }

  // Check for TODO in tests
  if (testContent.includes('TODO')) {
    console.warn('  ⚠ Test file contains TODO - tests may be incomplete')
    warnings++
  }

  // Check for key test scenarios
  const scenarios = {
    negative: testContent.includes('-'),
    decimal: testContent.includes('.'),
    large: testContent.includes('1000000') || testContent.includes('million'),
    zero: testContent.includes('[0,')
  }

  if (scenarios.negative) console.log('  ✓ Tests negative numbers')
  else { console.warn('  ⚠ Missing negative number tests'); warnings++ }

  if (scenarios.decimal) console.log('  ✓ Tests decimal numbers')
  else { console.warn('  ⚠ Missing decimal number tests'); warnings++ }

  if (scenarios.large) console.log('  ✓ Tests large numbers')
  else { console.warn('  ⚠ Missing large number tests'); warnings++ }

  if (scenarios.zero) console.log('  ✓ Tests zero')
  else { console.warn('  ⚠ Missing zero test'); warnings++ }
}

// Check 3: Registration in lib/n2words.js
const n2wordsFile = 'lib/n2words.js'
const n2wordsContent = readFileSync(n2wordsFile, 'utf8')

const constName = langCode.replace('-', '')
const importRegex = new RegExp(`import ${constName} from '\\./i18n/${langCode}\\.js'`)
if (!importRegex.test(n2wordsContent)) {
  console.error(`✗ Not imported in ${n2wordsFile}`)
  errors++
} else {
  console.log(`✓ Imported in ${n2wordsFile}`)
}

const dictKeyRegex = langCode.includes('-')
  ? new RegExp(`['"]${langCode}['"]:\\s*${constName}`)
  : new RegExp(`${constName}[,\\s]`)

if (!dictKeyRegex.test(n2wordsContent)) {
  console.error(`✗ Not registered in dict in ${n2wordsFile}`)
  errors++
} else {
  console.log('✓ Registered in dict')
}

console.log('='.repeat(60))

if (errors === 0 && warnings === 0) {
  console.log('✓ Validation passed! Language implementation looks good.')
  console.log()
  console.log('Next steps:')
  console.log('  1. Run tests: npm test')
  console.log('  2. Run linter: npm run lint:js')
  console.log('  3. Build: npm run build:web')
  process.exit(0)
} else {
  if (errors > 0) {
    console.error(`\n✗ Validation failed with ${errors} error(s) and ${warnings} warning(s)`)
    console.error('Please fix the errors above before proceeding.')
    process.exit(1)
  } else {
    console.warn(`\n⚠ Validation passed with ${warnings} warning(s)`)
    console.warn('Consider addressing the warnings for a complete implementation.')
    process.exit(0)
  }
}

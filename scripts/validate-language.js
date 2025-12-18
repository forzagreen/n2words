#!/usr/bin/env node

/**
 * Validate a language implementation
 *
 * Usage: node scripts/validate-language.js <language-code>
 *        node scripts/validate-language.js    (validates all languages)
 *
 * Checks:
 * - Language file exists and exports correctly
 * - Test file exists and has comprehensive cases
 * - Language is registered in lib/n2words.js
 * - Implementation follows best practices
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { argv } from 'node:process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import chalk from 'chalk'

const ISO_CODE_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/
const INTERNAL_SUFFIXES = ['-fast.js', '-iterative.js']

function listLanguages () {
  return readdirSync('lib/i18n')
    .filter(name => name.endsWith('.js'))
    .filter(name => !INTERNAL_SUFFIXES.some(suffix => name.endsWith(suffix)))
    .map(name => name.replace(/\.js$/, ''))
}

function ensureIsoCode (lang) {
  if (!ISO_CODE_PATTERN.test(lang)) {
    console.error(chalk.red(`✗ Language code is not ISO 639-1 (optional region): ${lang}`))
    return 1
  }
  console.log(chalk.green(`✓ Language code format OK: ${lang}`))
  return 0
}

function extractClassName (content) {
  const match = content.match(/class\s+([A-Za-z][A-Za-z0-9_]*)\s+extends/)
  return match ? match[1] : null
}

function extractDefaultCtorName (content) {
  // Looks for `return new ClassName(` inside the default export function
  const match = content.match(/return\s+new\s+([A-Za-z][A-Za-z0-9_]*)\s*\(/)
  return match ? match[1] : null
}

function hasLargeNumberCase (testContent) {
  // Scan bracketed tuples like [123, 'one two three'] and detect literals >= 1_000_000
  const tupleNumberRegex = /\[\s*(-?\d[\d_]*n?)\s*,/g
  let match

  while ((match = tupleNumberRegex.exec(testContent))) {
    const normalized = match[1].replace(/n$/, '').replace(/_/g, '')
    if (!normalized) continue
    const value = BigInt(normalized)
    if (value >= 1_000_000n || value <= -1_000_000n) return true
  }

  return false
}

function checkClassNameFullLanguage (className, lang) {
  if (!className) {
    console.error(chalk.red('  ✗ No class declaration found (expected a named class extending a base language)'))
    return 1
  }

  const codeNormalized = lang.replace(/-/g, '').toLowerCase()
  if (className.toLowerCase() === codeNormalized) {
    console.error(chalk.red(`  ✗ Class name should be the full language name, not code '${className}'`))
    return 1
  }

  console.log(chalk.green(`  ✓ Class name looks descriptive: ${className}`))
  return 0
}

async function smokeTestLanguageOutput (langCode, langFile) {
  let errors = 0

  try {
    const fileUrl = pathToFileURL(resolve(langFile)).href
    const mod = await import(fileUrl)
    const fn = mod.default
    if (typeof fn !== 'function') {
      console.error(chalk.red('  ✗ Default export is not a function'))
      return 1
    }

    const samples = [0, 1, 21, 105, 1234, -5, '3.14']
    for (const sample of samples) {
      try {
        const out = fn(sample)
        if (typeof out !== 'string' || !out.trim()) {
          console.error(chalk.red(`  ✗ Output for ${sample} is not a non-empty string`))
          errors++
        }
        if (typeof out === 'string' && out.includes('TODO')) {
          console.error(chalk.red(`  ✗ Output for ${sample} contains placeholder TODO`))
          errors++
        }
      } catch (err) {
        console.error(chalk.red(`  ✗ Threw when converting ${sample}: ${err.message}`))
        errors++
      }
    }
  } catch (err) {
    console.error(chalk.red(`  ✗ Failed to load language module: ${err.message}`))
    errors++
  }

  if (errors === 0) {
    console.log(chalk.green('  ✓ Default export produces strings for sample inputs'))
  }
  return errors
}

async function validateLanguage (langCode) {
  console.log(chalk.cyan(`Validating language: ${langCode}`))
  console.log(chalk.gray('='.repeat(60)))

  let errors = ensureIsoCode(langCode)
  let warnings = 0

  // Check 1: Language file exists
  const langFile = `lib/i18n/${langCode}.js`
  if (!existsSync(langFile)) {
    console.error(chalk.red(`✗ Language file not found: ${langFile}`))
    errors++
    return { errors, warnings }
  }

  console.log(chalk.green(`✓ Language file exists: ${langFile}`))

  const content = readFileSync(langFile, 'utf8')

  // Check for default export
  if (!content.includes('export default')) {
    console.error(chalk.red('  ✗ Missing default export'))
    errors++
  } else {
    console.log(chalk.green('  ✓ Has default export'))
  }

  // Check class naming
  const className = extractClassName(content)
  errors += checkClassNameFullLanguage(className, langCode)

  // Check default export instantiates the declared class
  const ctorName = extractDefaultCtorName(content)
  if (!ctorName) {
    console.error(chalk.red('  ✗ Default export does not instantiate a class (return new ClassName(...))'))
    errors++
  } else if (className && ctorName !== className) {
    console.error(chalk.red(`  ✗ Default export instantiates '${ctorName}', expected '${className}'`))
    errors++
  } else {
    console.log(chalk.green(`  ✓ Default export instantiates ${ctorName}`))
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
    !content.includes('TurkicLanguage') &&
    !content.includes('AbstractLanguage') &&
    !content.match(/extends\s+[A-Z][A-Za-z0-9_]*/)
  ) {
    console.error(chalk.red('  ✗ Does not extend any recognized base class or language'))
    errors++
  } else {
    console.log(chalk.green('  ✓ Extends appropriate base class'))
  }

  // Check 2: Test file exists
  const testFile = `test/i18n/${langCode}.js`
  if (!existsSync(testFile)) {
    console.error(chalk.red(`✗ Test file not found: ${testFile}`))
    errors++
  } else {
    console.log(chalk.green(`✓ Test file exists: ${testFile}`))

    const testContent = readFileSync(testFile, 'utf8')

    if (!testContent.includes('export default')) {
      console.error(chalk.red('  ✗ Missing export default'))
      errors++
    } else {
      console.log(chalk.green('  ✓ Exports test cases'))
    }

    const testCases = (testContent.match(/\[.*,.*\]/g) || []).length
    if (testCases < 10) {
      console.warn(chalk.yellow(`  ⚠ Only ${testCases} test cases found (recommended: 20+)`))
      warnings++
    } else {
      console.log(chalk.green(`  ✓ Has ${testCases} test cases`))
    }

    if (testContent.includes('TODO')) {
      console.warn(chalk.yellow('  ⚠ Test file contains TODO - tests may be incomplete'))
      warnings++
    }

    const scenarios = {
      negative: testContent.includes('-'),
      decimal: testContent.includes('.'),
      large: hasLargeNumberCase(testContent),
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

  // Check 4: Default export produces output strings
  errors += await smokeTestLanguageOutput(langCode, langFile)

  console.log(chalk.gray('='.repeat(60)))
  return { errors, warnings }
}

const targetLangs = argv[2] ? [argv[2]] : listLanguages()

if (targetLangs.length === 0) {
  console.error(chalk.red('No languages found to validate.'))
  process.exit(1)
}

let totalErrors = 0
let totalWarnings = 0

for (const lang of targetLangs) {
  const { errors, warnings } = await validateLanguage(lang)
  totalErrors += errors
  totalWarnings += warnings
}

if (totalErrors === 0 && totalWarnings === 0) {
  console.log(chalk.green('✓ Validation passed! All language implementations look good.'))
  console.log()
  console.log(chalk.cyan('Next steps:'))
  console.log(chalk.gray('  1. Run tests: npm test'))
  console.log(chalk.gray('  2. Run linter: npm run lint:js'))
  console.log(chalk.gray('  3. Build: npm run build:web'))
  process.exit(0)
} else if (totalErrors > 0) {
  console.error(
    chalk.red(`\n✗ Validation failed with ${totalErrors} error(s) and ${totalWarnings} warning(s)`)
  )
  console.error(chalk.red('Please fix the errors above before proceeding.'))
  process.exit(1)
} else {
  console.warn(chalk.yellow(`\n⚠ Validation passed with ${totalWarnings} warning(s)`))
  console.warn(
    chalk.yellow('Consider addressing the warnings for a complete implementation.')
  )
  process.exit(0)
}

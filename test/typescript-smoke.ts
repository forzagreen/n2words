/**
 * TypeScript smoke test for n2words
 * Verifies that TypeScript can import and use n2words with proper types
 */

import n2words, { type N2WordsOptions } from 'n2words'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

console.log('=== TypeScript Smoke Test for n2words ===\n')

// Test N2WordsOptions type
const options1: N2WordsOptions = { lang: 'en' }

// Test main module import
const result1: string = n2words(42)
console.log('Main module (default lang):', result1)

// Test main module with language option using typed options
const result2: string = n2words(100, options1)
console.log('Main module with lang option:', result2)

// Test a few direct imports for type checking
const { default: en } = await import('n2words/i18n/en')
const { default: es } = await import('n2words/i18n/es')
const { default: fr } = await import('n2words/i18n/fr')

// Test direct language import
const result3: string = en(123)
console.log('Direct import (en):', result3)

// Test language-specific options
const result4: string = es(456)
console.log('Direct import (es):', result4)

// Test French
const result5: string = fr(789)
console.log('Direct import (fr):', result5)

// Test with BigInt
const result6: string = n2words(1000000n)
console.log('BigInt support:', result6)

// Test with string
const result7: string = n2words('42')
console.log('String input:', result7)

// Test with negative number
const result8: string = n2words(-42, { lang: 'en' })
console.log('Negative number:', result8)

// Test with decimal
const result9: string = n2words(3.14, { lang: 'en' })
console.log('Decimal number:', result9)

console.log('\n=== Testing All Language Imports ===\n')

// Dynamically discover all language files
const i18nDir = join(process.cwd(), 'lib', 'i18n')
const languageFiles = readdirSync(i18nDir)
  .filter(file => file.endsWith('.js'))
  .map(file => file.replace('.js', ''))
  .sort()

// Test all language imports with a simple number
const testNumber = 42
const allLanguageTests: Array<{ lang: string; result: string }> = []

for (const langCode of languageFiles) {
  try {
    const { default: langFn } = await import(`n2words/i18n/${langCode}`)
    const result: string = langFn(testNumber)
    allLanguageTests.push({ lang: langCode, result })
  } catch (error) {
    console.error(`❌ ${langCode}: Failed to import or execute`)
    throw error
  }
}

// Verify all language imports work and return strings
let failedLanguages = 0
for (const test of allLanguageTests) {
  if (typeof test.result !== 'string' || test.result.length === 0) {
    console.error(`❌ ${test.lang}: Failed (got ${typeof test.result})`)
    failedLanguages++
  } else {
    console.log(`✓ ${test.lang}: ${test.result}`)
  }
}

// Test type constraints - N2WordsOptions validation
const typedOptions: N2WordsOptions[] = [
  { lang: 'en' },
  { lang: 'es' },
  { lang: 'fr-BE' },
  {}
]
console.log(`N2WordsOptions type works with ${typedOptions.length} configurations`)

// Verify all results are strings
const allResults = [result1, result2, result3, result4, result5, result6, result7, result8, result9]
const allStrings = allResults.every(r => typeof r === 'string')

if (!allStrings) {
  throw new Error('TypeScript smoke test failed: Not all results are strings')
}

if (failedLanguages > 0) {
  throw new Error(`TypeScript smoke test failed: ${failedLanguages} language(s) failed`)
}

console.log('\n✅ TypeScript smoke test passed!')
console.log(`  - All ${allResults.length} basic test cases returned strings`)
console.log(`  - All ${allLanguageTests.length} language imports work correctly`)
console.log('  - Main module import works')
console.log('  - Language-specific subpath imports work')
console.log('  - N2WordsOptions type exported and usable')
console.log('  - Type checking passed')

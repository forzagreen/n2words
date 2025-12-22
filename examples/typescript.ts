/**
 * TypeScript Examples for n2words
 *
 * This file demonstrates proper TypeScript usage of the n2words library,
 * including individual language imports, type-safe options, and generated typings.
 *
 * Note: This file is for documentation purposes. In a real project, you would
 * install n2words via npm and import from 'n2words' package.
 */

// In a real project, these would be:
// import n2words from 'n2words'
// import type { N2WordsOptions, LanguageCode } from 'n2words'
// import { English, French, Spanish, ChineseSimplified, Dutch } from 'n2words'

import n2words from '../lib/n2words.js'
import type { N2WordsOptions, LanguageCode } from '../lib/n2words.js'

// Individual language imports with proper typings (using descriptive names)
import { English, French, Spanish, ChineseSimplified, Dutch } from '../lib/n2words.js'

// === Basic Usage ===
const basic: string = n2words(42)
console.log(basic) // 'forty-two'

// === Main Export with Type-Safe Language Codes ===
const languageCode: LanguageCode = 'fr-BE'
const withTypedLang: string = n2words(70, { lang: languageCode })
console.log(withTypedLang) // 'septante'

// === Direct Language Imports (Type-Safe) ===

// English (no options)
const englishDirect = English(42)
console.log(englishDirect) // 'forty-two'

// French with explicit type annotation
const frenchWithOptions = French(2824, { withHyphenSeparator: true })
console.log(frenchWithOptions) // 'deux-mille-huit-cent-vingt-quatre'

// Spanish with gender options (using type inference)
const spanishFeminine = Spanish(21, { genderStem: 'a' })
console.log(spanishFeminine) // 'veintiuna'

// Chinese with formal option (explicit typing)
const chineseFormal = ChineseSimplified(123, { formal: true })
console.log(chineseFormal) // '壹佰贰拾叁'

// Dutch with multiple language-specific options
const dutchCustom = Dutch(21, {
  includeOptionalAnd: true,
  accentOne: false
})
console.log(dutchCustom) // 'eenentwintig'

// === Type Inference vs Explicit Typing ===

// Type inference (recommended) - cleaner code, same safety
const inferredFrench = French(91, { withHyphenSeparator: true })
const inferredSpanish = Spanish(21, { genderStem: 'a' })
const inferredChinese = ChineseSimplified(100, { formal: true })

console.log(inferredFrench)  // 'quatre-vingt-onze'
console.log(inferredSpanish) // 'veintiuna'
console.log(inferredChinese) // '壹佰'

// Multi-language conversion with type safety
function smartConvert(lang: 'fr' | 'es' | 'zh-Hans', value: number): string {
  switch (lang) {
    case 'fr':
      return French(value, { withHyphenSeparator: true })
    case 'es':
      return Spanish(value, { genderStem: 'a' })
    case 'zh-Hans':
      return ChineseSimplified(value, { formal: true })
    default:
      // This should never happen due to TypeScript constraints, but satisfies compiler
      return French(value)
  }
}

const smartResults = [42, 21, 100].map(num => ({
  fr: smartConvert('fr', num),
  es: smartConvert('es', num),
  'zh-Hans': smartConvert('zh-Hans', num)
}))

console.log('Smart conversion results:', smartResults)

// === BigInt and String Support ===
const bigintResult = English(123456789012345n)
const decimalResult = English('3.14159')

console.log(bigintResult) // 'one hundred and twenty-three trillion...'
console.log(decimalResult) // 'three point one four one five nine'

// === Dynamic Language Loading (Updated Pattern) ===
// With the new architecture, prefer using the main module with lang option
// This is more efficient as it uses the pre-loaded converters

async function convertWithLanguageOption(
  value: number,
  lang: LanguageCode
): Promise<string> {
  // Import main module (all languages are pre-loaded)
  const { default: convert } = await import('../lib/n2words.js')
  return convert(value, { lang })
}

// Usage
convertWithLanguageOption(42, 'fr').then(result => {
  console.log(result) // 'quarante-deux'
})

// === Batch Conversion ===
function convertToMultipleLanguages(
  value: number,
  languages: LanguageCode[]
): Record<string, string> {
  const results: Record<string, string> = {}

  for (const lang of languages) {
    results[lang] = n2words(value, { lang })
  }

  return results
}

const multiResults = convertToMultipleLanguages(42, ['en', 'fr', 'es', 'de'])
console.log(multiResults)
// { en: 'forty-two', fr: 'quarante-deux', es: 'cuarenta y dos', de: 'zweiundvierzig' }

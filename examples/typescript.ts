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
// import convertToFrench, { type FrenchOptions } from 'n2words/languages/fr'

import n2words from '../lib/n2words.js'
import type { N2WordsOptions, LanguageCode } from '../lib/n2words.js'

// Individual language imports with proper typings
import convertToEnglish from '../lib/languages/en.js'
import convertToFrench, { type FrenchOptions } from '../lib/languages/fr.js'
import convertToSpanish, { type SpanishOptions } from '../lib/languages/es.js'
import convertToChinese, { type ChineseOptions } from '../lib/languages/zh-Hans.js'
import convertToDutch, { type DutchOptions } from '../lib/languages/nl.js'

// === Basic Usage ===
const basic: string = n2words(42)
console.log(basic) // 'forty-two'

// === Main Export with Type-Safe Language Codes ===
const languageCode: LanguageCode = 'fr-BE'
const withTypedLang: string = n2words(70, { lang: languageCode })
console.log(withTypedLang) // 'septante'

// === Direct Language Imports (Type-Safe) ===

// English (no options)
const englishDirect = convertToEnglish(42)
console.log(englishDirect) // 'forty-two'

// French with explicit type annotation
const frenchOptions: FrenchOptions = { withHyphenSeparator: true }
const frenchWithOptions = convertToFrench(2824, frenchOptions)
console.log(frenchWithOptions) // 'deux-mille-huit-cent-vingt-quatre'

// Spanish with gender options (using type inference)
const spanishFeminine = convertToSpanish(21, { genderStem: 'a' })
console.log(spanishFeminine) // 'veintiuna'

// Chinese with formal option (explicit typing)
const chineseOptions: ChineseOptions = { formal: true }
const chineseFormal = convertToChinese(123, chineseOptions)
console.log(chineseFormal) // '壹佰贰拾叁'

// Dutch with multiple language-specific options
const dutchOptions: DutchOptions = {
  includeOptionalAnd: true,
  accentOne: false
}
const dutchCustom = convertToDutch(21, dutchOptions)
console.log(dutchCustom) // 'eenentwintig'

// === Type Inference vs Explicit Typing ===

// Type inference (recommended) - cleaner code, same safety
const inferredFrench = convertToFrench(91, { withHyphenSeparator: true })
const inferredSpanish = convertToSpanish(21, { genderStem: 'a' })
const inferredChinese = convertToChinese(100, { formal: true })

console.log(inferredFrench)  // 'quatre-vingt-onze'
console.log(inferredSpanish) // 'veintiuna'
console.log(inferredChinese) // '壹佰'

// Multi-language conversion with type safety
const converters = {
  fr: convertToFrench,
  es: convertToSpanish,
  'zh-Hans': convertToChinese
} as const

function smartConvert(lang: keyof typeof converters, value: number): string {
  switch (lang) {
    case 'fr':
      return converters.fr(value, { withHyphenSeparator: true })
    case 'es':
      return converters.es(value, { genderStem: 'a' })
    case 'zh-Hans':
      return converters['zh-Hans'](value, { formal: true })
    default:
      // This should never happen due to TypeScript constraints, but satisfies compiler
      return converters.fr(value)
  }
}

const smartResults = [42, 21, 100].map(num => ({
  fr: smartConvert('fr', num),
  es: smartConvert('es', num),
  'zh-Hans': smartConvert('zh-Hans', num)
}))

console.log('Smart conversion results:', smartResults)

// === BigInt and String Support ===
const bigintResult = convertToEnglish(123456789012345n)
const decimalResult = convertToEnglish('3.14159')

console.log(bigintResult) // 'one hundred and twenty-three trillion...'
console.log(decimalResult) // 'three point one four one five nine'

// === Dynamic Language Loading ===
const languageModules = {
  en: () => import('../lib/languages/en.js'),
  fr: () => import('../lib/languages/fr.js'),
  es: () => import('../lib/languages/es.js')
} as const

type SupportedLanguage = keyof typeof languageModules

async function convertWithDynamicImport(
  value: number,
  lang: SupportedLanguage
): Promise<string> {
  const { default: convert } = await languageModules[lang]()
  return convert(value)
}

// Usage
convertWithDynamicImport(42, 'fr').then(result => {
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

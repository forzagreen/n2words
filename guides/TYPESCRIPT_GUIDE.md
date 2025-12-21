# TypeScript Guide

This guide covers using n2words with TypeScript, including individual language imports, type safety, and language-specific options.

## Quick Start

```bash
npm install n2words  # Includes built-in TypeScript definitions
```

**Requirements:** Node.js `^20 || ^22 || >=24`, TypeScript `^4.5` with `"target": "ES2020"`

```typescript
// Main library import (all languages)
import n2words from 'n2words'
const result = n2words(42, { lang: 'fr' })  // 'quarante-deux'

// Individual language import (recommended - tree-shakeable)
import convertToFrench from 'n2words/languages/fr'
const french = convertToFrench(42, { withHyphenSeparator: true })  // 'quarante-deux'
```

## Import Patterns

### Main Library (All Languages)

```typescript
import n2words, { type N2WordsOptions, type LanguageCode } from 'n2words'

// Generic usage - supports all 47+ languages with fallback
const result = n2words(1000, { lang: 'es' })  // 'mil'
```

### Individual Languages (Recommended)

```typescript
// Tree-shakeable imports with language-specific types
import convertToFrench, { type FrenchOptions } from 'n2words/languages/fr'
import convertToChinese, { type ChineseOptions } from 'n2words/languages/zh-Hans'
import convertToSpanish, { type SpanishOptions } from 'n2words/languages/es'

// Full type safety and IntelliSense
const frenchOptions: FrenchOptions = { withHyphenSeparator: true }
const french = convertToFrench(80, frenchOptions)  // 'quatre-vingts'

// Or use type inference (no explicit types needed)
const chinese = convertToChinese(123, { formal: true })  // '壹佰贰拾叁'
const spanish = convertToSpanish(21, { genderStem: 'a' })  // 'veintiuna'
```

## Type Reference

```typescript
// Main library types
type LanguageCode = 'ar' | 'az' | 'bn' | 'cs' | 'de' | 'da' | 'el' | 'en'
  | 'es' | 'fa' | 'fr' | 'fr-BE' | 'gu' | 'hbo' | 'he' | 'hi' | 'hr' | 'hu'
  | 'id' | 'it' | 'ja' | 'kn' | 'ko' | 'lt' | 'lv' | 'mr' | 'ms' | 'nl' | 'nb'
  | 'pa-Guru' | 'pl' | 'pt' | 'ro' | 'ru' | 'sr-Cyrl' | 'sr-Latn' | 'sv'
  | 'sw' | 'ta' | 'te' | 'th' | 'fil' | 'tr' | 'uk' | 'ur' | 'vi' | 'zh-Hans' | 'zh-Hant'

type N2WordsInput = number | string | bigint

// Language-specific option types (examples)
type FrenchOptions = { withHyphenSeparator?: boolean }
type SpanishOptions = { genderStem?: 'o' | 'a' }
type ChineseOptions = { formal?: boolean }
type ArabicOptions = { feminine?: boolean; negativeWord?: string }
// ... see individual language files for complete types
```

## Usage Patterns

### Direct Language Imports (Type-Safe)

```typescript
import convertToFrench, { type FrenchOptions } from 'n2words/languages/fr'
import convertToSpanish, { type SpanishOptions } from 'n2words/languages/es'
import convertToChinese, { type ChineseOptions } from 'n2words/languages/zh-Hans'

// Full IntelliSense for language-specific options with explicit typing
const frenchOptions: FrenchOptions = {
  withHyphenSeparator: true   // ✅ TypeScript knows this option exists
}
const frenchHyphens = convertToFrench(91, frenchOptions)

const spanishOptions: SpanishOptions = {
  genderStem: 'a'  // ✅ TypeScript validates the value
}
const spanishFeminine = convertToSpanish(21, spanishOptions)

const chineseOptions: ChineseOptions = {
  formal: true  // ✅ Only valid options for Chinese
}
const chineseFormal = convertToChinese(100, chineseOptions)
```

### Type Inference (Implicit Typing)

```typescript
import convertToFrench from 'n2words/languages/fr'
import convertToSpanish from 'n2words/languages/es'
import convertToChinese from 'n2words/languages/zh-Hans'
import convertToDutch from 'n2words/languages/nl'

// TypeScript automatically infers types from usage - no explicit annotations needed
const result = convertToFrench(42)  // Inferred as: string

// Object literals are automatically validated against function signatures
const frenchResult = convertToFrench(80, {
  withHyphenSeparator: true  // ✅ TypeScript knows this is valid for French
  // formal: true            // ❌ TypeScript error - not valid for French
})

const spanishResult = convertToSpanish(21, {
  genderStem: 'a'  // ✅ TypeScript validates 'a' | 'o'
  // genderStem: 'x'  // ❌ TypeScript error - invalid value
})

// Const assertions preserve literal types for better inference
const languages = ['en', 'fr', 'es'] as const  // type: readonly ["en", "fr", "es"]

// Function parameters infer from context
const converters = {
  fr: convertToFrench,
  es: convertToSpanish,
  'zh-Hans': convertToChinese
}

// Return type automatically inferred as string, options validated per language
function smartConvert(lang: keyof typeof converters, value: number) {
  switch (lang) {
    case 'fr':
      return converters.fr(value, { withHyphenSeparator: true })  // ✅ Valid for French
    case 'es':
      return converters.es(value, { genderStem: 'a' })           // ✅ Valid for Spanish
    case 'zh-Hans':
      return converters['zh-Hans'](value, { formal: true })      // ✅ Valid for Chinese
  }
}

// Array of functions with inferred signatures
const languageFunctions = [convertToFrench, convertToSpanish, convertToChinese]
// TypeScript knows each function signature and validates accordingly

// Destructuring with inference
const { fr: toFrench, es: toSpanish } = {
  fr: convertToFrench,
  es: convertToSpanish
}
// toFrench and toSpanish automatically have correct function signatures
```

## Language Examples

```typescript
// Chinese: Formal vs standard numerals
import convertToChinese, { type ChineseOptions } from 'n2words/languages/zh-Hans'
const standard = convertToChinese(123)                    // '一百二十三'
const formal: ChineseOptions = { formal: true }
const formalNum = convertToChinese(123, formal)           // '壹佰贰拾叁'

// Spanish: Gender agreement
import convertToSpanish, { type SpanishOptions } from 'n2words/languages/es'
const masculine = convertToSpanish(21, { genderStem: 'o' }) // 'veintiuno'
const feminine = convertToSpanish(21, { genderStem: 'a' })  // 'veintiuna'

// French: Hyphenation style
import convertToFrench, { type FrenchOptions } from 'n2words/languages/fr'
const withHyphens = convertToFrench(91, { withHyphenSeparator: true }) // 'quatre-vingt-onze'
```

## Advanced Usage

### Custom Language Development

```typescript
// Base classes for extending languages
import { GreedyScaleLanguage } from 'n2words/classes'

class MyLanguage extends GreedyScaleLanguage {
  negativeWord = 'negative'
  // ... implementation
}
```

### Testing with Types

```typescript
import test from 'ava'
import convertToFrench, { type FrenchOptions } from 'n2words/languages/fr'

test('validates options at compile time', t => {
  const options: FrenchOptions = { withHyphenSeparator: true }
  t.is(convertToFrench(80, options), 'quatre-vingts')
})

test('type safety prevents invalid options', t => {
  // ✅ Valid options compile successfully
  const validOptions: FrenchOptions = { withHyphenSeparator: false }
  t.is(convertToFrench(42, validOptions), 'quarante-deux')

  // ❌ This would cause TypeScript compilation error:
  // const invalid: FrenchOptions = { formal: true }  // Property doesn't exist
})
```

## Tips

**Bundle Optimization:** Individual imports are tree-shakeable and reduce bundle size.

```typescript
// ❌ Imports all 47+ languages
import n2words from 'n2words'

// ✅ Only imports what you need
import convertToFrench from 'n2words/languages/fr'
```

**Type Safety:** Individual imports provide better IntelliSense than generic options.

```typescript
// ❌ Limited autocomplete
import n2words from 'n2words'
n2words(42, { lang: 'fr', withHyphen... }) // Incomplete

// ✅ Full autocomplete and validation
import convertToFrench from 'n2words/languages/fr'
convertToFrench(42, { withHyphenSeparator: true }) // Complete
```

---

**Resources:** [Language Options](LANGUAGE_OPTIONS.md) · [Language Development](LANGUAGE_GUIDE.md) · [GitHub](https://github.com/forzagreen/n2words)

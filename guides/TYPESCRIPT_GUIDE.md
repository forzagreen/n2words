# TypeScript Guide

This guide covers using n2words with TypeScript, including type safety and language-specific options.

## Quick Start

```bash
npm install n2words  # Includes built-in TypeScript definitions
```

**Requirements:** Node.js `^20 || ^22 || >=24`, TypeScript `^4.5`

**Minimum tsconfig.json:** Requires `"target": "ES2020"` and `"lib": ["ES2020"]` for BigInt support.

```typescript
import n2words, { type N2WordsOptions } from 'n2words'

// Basic usage
const result: string = n2words(42)           // 'forty-two'
const french: string = n2words(100, { lang: 'fr' })  // 'cent'
```

## Type Definitions

```typescript
// Main options type with full autocomplete
type N2WordsOptions = {
  lang?: LanguageCode  // Language with fallback support

  // Language-specific options (type-safe)
  feminine?: boolean           // Arabic, Hebrew, Romanian, Slavic
  formal?: boolean             // Chinese (formal vs common numerals)
  genderStem?: 'o' | 'a'      // Spanish (masculine/feminine)
  withHyphenSeparator?: boolean // French (hyphens vs spaces)
  dropSpaces?: boolean         // Turkish/Azerbaijani
  negativeWord?: string        // Arabic (custom minus word)
  and?: string                 // Hebrew (conjunction)
  // ... more language-specific options
}

// All supported languages with autocomplete
type LanguageCode = 'ar' | 'az' | 'bn' | 'cs' | 'de' | 'da' | 'el' | 'en'
  | 'es' | 'fa' | 'fr' | 'fr-BE' | 'gu' | 'he' | 'hi' | 'hr' | 'hu' | 'id'
  | 'it' | 'ja' | 'kn' | 'ko' | 'lt' | 'lv' | 'mr' | 'ms' | 'nl' | 'nb'
  | 'pa-Guru' | 'pl' | 'pt' | 'ro' | 'ru' | 'sr-Latn' | 'sv' | 'sw' | 'ta'
  | 'te' | 'th' | 'fil' | 'tr' | 'uk' | 'ur' | 'vi' | 'zh-Hans'
```

### Input Types

```typescript
// Accepts three input types
n2words(42)              // number: most common
n2words('123.456789')    // string: preserves decimal precision
n2words(9007199254740992n) // bigint: very large integers
```

## Usage Patterns

### Basic Conversions

```typescript
// Simple with type inference
const result = n2words(123)  // string inferred

// Explicit options
const options: N2WordsOptions = { lang: 'fr' }
const french = n2words(42, options)  // 'quarante-deux'

// Helper function
function convertNumber(value: number | string | bigint, lang = 'en'): string {
  return n2words(value, { lang })
}
```

### Language-Specific Options

```typescript
// Arabic: gender and custom minus word
n2words(42, { lang: 'ar', feminine: true })      // feminine form
n2words(-10, { lang: 'ar', negativeWord: 'سالب' }) // custom minus

// Chinese: formal vs common numerals
n2words(123, { lang: 'zh-Hans', formal: true })  // '壹佰贰拾叁' (formal)
n2words(123, { lang: 'zh-Hans', formal: false }) // '一百二十三' (common)

// Spanish: gender agreement
n2words(21, { lang: 'es', genderStem: 'o' })     // 'veintiuno' (masculine)
n2words(21, { lang: 'es', genderStem: 'a' })     // 'veintiuna' (feminine)

// French: hyphenation
n2words(91, { lang: 'fr', withHyphenSeparator: true }) // 'quatre-vingt-onze'
```

### Advanced Patterns

```typescript
// Multi-language converter with type safety
type SupportedLang = 'en' | 'fr' | 'es' | 'de' | 'zh-Hans'

function convertInLanguage(value: number, lang: SupportedLang): string {
  return n2words(value, { lang })
}

// Array conversion
function numbersToWords(numbers: number[], lang = 'en'): string[] {
  return numbers.map(num => n2words(num, { lang }))
}

// Error handling
function safeConvert(value: unknown, lang = 'en'): string | null {
  try {
    if (typeof value === 'number' || typeof value === 'string' || typeof value === 'bigint') {
      return n2words(value, { lang })
    }
    return null
  } catch (error) {
    console.error('Conversion error:', error)
    return null
  }
}
```

## Advanced Features

### Importing Base Classes

```typescript
// Main exports
import n2words, {
  type N2WordsOptions,
  type LanguageCode,
  // Language-specific types
  type ArabicOptions,
  type ChineseOptions,
  type SpanishOptions
} from 'n2words'

// Base classes (for language developers)
import {
  AbstractLanguage,
  GreedyScaleLanguage,
  SlavicLanguage
} from 'n2words'
```

### Browser Usage

```typescript
// ESM with bundler (webpack, Vite, etc.)
import n2words from 'n2words'
const text = n2words(42, { lang: 'en' })

// Or via CDN
// <script src="https://unpkg.com/n2words/dist/n2words.js"></script>
```

### Testing

```typescript
import { describe, it, expect } from 'vitest'
import n2words from 'n2words'

describe('n2words', () => {
  it('converts numbers', () => {
    expect(n2words(42, { lang: 'en' })).toBe('forty-two')
    expect(n2words('3.14', { lang: 'en' })).toBe('three point one four')
    expect(n2words(123456789n, { lang: 'en' })).toContain('million')
  })
})
```

## Common Issues

**Language Not Found:**

```typescript
// ❌ Unsupported language throws error
n2words(42, { lang: 'xyz' })  // Error: no converter for language 'xyz'

// ✅ Use fallback or validation
const lang = isValidLanguage(userLang) ? userLang : 'en'
```

**Decimal Precision:**

```typescript
// ❌ Number precision loss
n2words(0.1 + 0.2)  // Unexpected output due to floating-point

// ✅ Use string for precision
n2words('0.3')      // 'zero point three'
```

---

**Resources:**

- [LANGUAGE_OPTIONS.md](LANGUAGE_OPTIONS.md) - Language-specific options
- [LANGUAGE_GUIDE.md](LANGUAGE_GUIDE.md) - Extending languages
- [GitHub Repository](https://github.com/forzagreen/n2words) - Source code

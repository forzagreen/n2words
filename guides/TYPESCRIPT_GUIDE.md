# TypeScript Guide for n2words

This guide covers everything you need to know about using n2words with TypeScript, including type safety, language-specific options, and best practices.

## Quick Start

### Installation

```bash
npm install n2words
```

The package includes built-in TypeScript definitions, so no separate `@types/` package is needed.

### Minimal Requirements

To use n2words with TypeScript, you need:

| Requirement | Version | Notes |
| --- | --- | --- |
| **Node.js** | `^20 \|\| ^22 \|\| >=24` | LTS versions recommended |
| **TypeScript** | `^4.5` | Any modern version works |
| **n2words** | `^1.23.2` | Current version or later |

**TypeScript Configuration** (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2020"],
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

**No additional setup required** — n2words works out-of-the-box with standard TypeScript configurations.

### Basic Usage

```typescript
import n2words, { type N2WordsOptions } from 'n2words'

// Simple conversion
const result: string = n2words(42)
console.log(result) // 'forty-two'

// With explicit language
const french: string = n2words(100, { lang: 'fr' })
console.log(french) // 'cent'
```

## Type Definitions

### `N2WordsOptions`

The main configuration type for all conversions with full type safety:

```typescript
type N2WordsOptions = {
  /**
   * Target language code with full autocomplete support.
   * Supports many languages with regional variants (e.g., 'fr-BE').
   * Falls back progressively from most-specific to least-specific.
   * @default 'en'
   */
  lang?: LanguageCode

  // Language-specific options (type-safe based on selected language)
  negativeWord?: string        // Arabic only
  feminine?: boolean           // Arabic, Hebrew, Romanian, Slavic languages
  formal?: boolean             // Chinese only
  and?: string                 // Hebrew only
  biblical?: boolean           // Hebrew only
  genderStem?: 'o' | 'a' | string  // Spanish only
  includeOptionalAnd?: boolean // Dutch only
  noHundredPairs?: boolean     // Dutch only
  accentOne?: boolean          // Dutch only
  withHyphenSeparator?: boolean // French, Belgian French
  dropSpaces?: boolean         // Turkish, Azerbaijani
  ordFlag?: boolean            // Danish only
}

// Language code literals with autocomplete
type LanguageCode =
  | 'ar' | 'az' | 'bn' | 'cs' | 'de' | 'da' | 'el' | 'en' | 'es' | 'fa'
  | 'fr' | 'fr-BE' | 'gu' | 'he' | 'hi' | 'hr' | 'hu' | 'id' | 'it' | 'ja'
  | 'kn' | 'ko' | 'lt' | 'lv' | 'mr' | 'ms' | 'nl' | 'nb' | 'pa' | 'pl'
  | 'pt' | 'ro' | 'ru' | 'sr' | 'sv' | 'sw' | 'ta' | 'te' | 'th' | 'fil'
  | 'tr' | 'uk' | 'ur' | 'vi' | 'zh'
```

### Language-Specific Option Types

For enhanced type safety, specific option interfaces are available:

```typescript
type ArabicOptions = {
  negativeWord?: string  // Word for negative numbers
  feminine?: boolean     // Use feminine forms
}

type ChineseOptions = {
  formal?: boolean       // Use formal/financial numerals
}

type HebrewOptions = {
  and?: string          // Conjunction character
  biblical?: boolean    // Use biblical scale words
  feminine?: boolean    // Use feminine forms
}

type SpanishOptions = {
  genderStem?: 'o' | 'a' | string  // Gender ending
}

// ... and 7 more language-specific option types
```

## Input Types

The library accepts three input types:

```typescript
// Number (integer or floating-point)
n2words(42) // 'forty-two'
n2words(3.14) // 'three point one four'

// String (for precision with decimals)
n2words('123456789.987654321', { lang: 'en' })

// BigInt (for very large integers)
n2words(123456789n, { lang: 'en' })
```

### When to Use Each Type

| Type | Use Case | Example |
| --- | --- | --- |
| `number` | Most common use; integers and decimals | `n2words(42)` or `n2words(3.14)` |
| `string` | Preserve decimal precision; avoid floating-point rounding | `n2words('0.1')` |
| `bigint` | Very large integers beyond `Number.MAX_SAFE_INTEGER` | `n2words(9007199254740992n)` |

## Supported Languages

n2words supports **many languages**. Here are the most common:

| Code | Language | Example |
| --- | --- | --- |
| `'en'` | English | `42` → 'forty-two' |
| `'es'` | Spanish | `42` → 'cuarenta y dos' |
| `'fr'` | French | `42` → 'quarante-deux' |
| `'de'` | German | `42` → 'zweiundvierzig' |
| `'it'` | Italian | `42` → 'quarantadue' |
| `'pt'` | Portuguese | `42` → 'quarenta e dois' |
| `'ru'` | Russian | `42` → 'сорок два' |
| `'zh'` | Chinese | `42` → '四十二' |
| `'ja'` | Japanese | `42` → '四十二' |
| `'ko'` | Korean | `42` → '사십이' |
| `'ar'` | Arabic | `42` → 'اثنان وأربعون' |
| `'he'` | Hebrew | `42` → 'ארבעים ושתיים' |

**Regional Variants** (e.g., `'fr-BE'` for Belgian French):

```typescript
// Specific regional variant
n2words(70, { lang: 'fr-BE' }) // Belgian French uses different word for 70

// Automatic fallback
n2words(42, { lang: 'en-GB' }) // Falls back to 'en' if 'en-GB' not available
```

See [README.md](README.md) for the complete list of supported languages.

## Common Usage Patterns

### 1. Simple Conversion with Type Inference

```typescript
const result = n2words(123)
// result is inferred as string
```

### 2. Explicit Options Object

```typescript
import { type N2WordsOptions } from 'n2words'

const options: N2WordsOptions = {
  lang: 'en'
}

const result = n2words(42, options)
```

### 3. Helper Function with Language Context

```typescript
/**
 * Convert a number to words in a specific language context.
 */
function convertNumber(
  value: number | string | bigint,
  language: string = 'en'
): string {
  return n2words(value, { lang: language })
}

const english = convertNumber(42, 'en') // 'forty-two'
const french = convertNumber(42, 'fr') // 'quarante-deux'
```

### 4. Formatting with Numbers

```typescript
/**
 * Format a price with both numeric and written representations.
 */
function formatPrice(
  amount: number,
  currency: string = 'USD',
  lang: string = 'en'
): string {
  const words = n2words(amount, { lang })
  return `${amount} ${currency} (${words})`
}

console.log(formatPrice(99.99))
// '99.99 USD (ninety-nine point nine nine)'
```

### 5. List Conversion

```typescript
/**
 * Convert an array of numbers to words.
 */
function numbersToWords(
  numbers: (number | string | bigint)[],
  lang: string = 'en'
): string[] {
  return numbers.map(num => n2words(num, { lang }))
}

const result = numbersToWords([1, 2, 3], 'en')
// ['one', 'two', 'three']
```

## Language-Specific Options

**Enhanced Type Safety**: The library now provides dedicated option types for each language, giving you full IntelliSense and compile-time validation.

### Arabic (`ArabicOptions`)

```typescript
import n2words, { type ArabicOptions } from 'n2words'

const options: ArabicOptions = {
  feminine: true,
  negativeWord: 'سالب'  // Custom word for "minus"
}

n2words(42, { lang: 'ar', ...options }) // 'اثنتان وأربعون' (feminine)
n2words(-10, { lang: 'ar', negativeWord: 'سالب' }) // 'سالب عشرة'
```

### Chinese (`ChineseOptions`)

```typescript
import n2words, { type ChineseOptions } from 'n2words'

// Financial/formal numerals (default)
n2words(123, { lang: 'zh', formal: true }) // '壹佰贰拾叁'

// Common numerals
n2words(123, { lang: 'zh', formal: false }) // '一百二十三'
```

### Hebrew (`HebrewOptions`)

```typescript
import n2words, { type HebrewOptions } from 'n2words'

const options: HebrewOptions = {
  feminine: true,
  biblical: true,
  and: 'ו'  // Hebrew vav for "and"
}

n2words(21, { lang: 'he', ...options }) // Feminine biblical form
```

### Spanish (`SpanishOptions`)

```typescript
import n2words, { type SpanishOptions } from 'n2words'

// Masculine (default)
n2words(21, { lang: 'es', genderStem: 'o' }) // 'veintiuno'

// Feminine
n2words(21, { lang: 'es', genderStem: 'a' }) // 'veintiuna'
```

### Dutch (`DutchOptions`)

```typescript
import n2words, { type DutchOptions } from 'n2words'

const dutchOptions: DutchOptions = {
  includeOptionalAnd: true,
  accentOne: true,
  noHundredPairs: false
}

n2words(101, { lang: 'nl', ...dutchOptions })
```

### French (`FrenchOptions`)

```typescript
import n2words, { type FrenchOptions } from 'n2words'

// Use hyphens instead of spaces
n2words(91, { lang: 'fr', withHyphenSeparator: true }) // 'quatre-vingt-onze'
n2words(91, { lang: 'fr', withHyphenSeparator: false }) // 'quatre vingt onze'
```

### All Language Options at a Glance

| Language | Options Available | Key Features |
| --- | --- | --- |
| Arabic | `feminine`, `negativeWord` | Gender agreement, custom minus word |
| Chinese | `formal` | Financial vs. common numerals |
| Hebrew | `feminine`, `biblical`, `and` | Gender, biblical forms, conjunctions |
| Spanish | `genderStem` | Masculine/feminine endings |
| Dutch | `includeOptionalAnd`, `accentOne`, `noHundredPairs` | Optional conjunctions, accents |
| French/Belgian | `withHyphenSeparator` | Hyphen vs. space separators |
| Turkish/Azerbaijani | `dropSpaces` | Space handling |
| Romanian | `feminine` | Gender agreement |
| Danish | `ordFlag` | Ordinal number support |
| Slavic Languages | `feminine` | Gender agreement |

**Type Safety Benefits:**

- Full autocomplete for language codes (`LanguageCode` union)
- IntelliSense for language-specific options
- Compile-time validation of option combinations
- Rich JSDoc tooltips with usage examples

## Advanced Usage

### Creating a Strongly-Typed Wrapper

With the enhanced TypeScript support, you can create type-safe wrappers:

```typescript
import n2words, { type N2WordsOptions, type LanguageCode, type ChineseOptions } from 'n2words'

/**
 * Convert a number to English words (strongly typed).
 */
function toEnglish(
  value: number | string | bigint,
): string {
  return n2words(value, { lang: 'en' })
}

/**
 * Convert with language-specific options (type-safe).
 */
function toChineseWords(
  value: number | string | bigint,
  options: ChineseOptions = {}
): string {
  return n2words(value, { lang: 'zh', ...options })
}

// Usage with full type safety
const result1 = toEnglish(42) // 'forty-two'
const result2 = toChineseWords(123, { formal: true }) // '壹佰贰拾叁'
// toChineseWords(123, { invalidOption: true }) // ← TypeScript error!
```

### Multi-Language Application

```typescript
import n2words, { type LanguageCode } from 'n2words'

// Use the built-in LanguageCode type for full type safety
type SupportedLanguage = Extract<LanguageCode, 'en' | 'fr' | 'es' | 'de' | 'zh'>

/**
 * Convert numbers with language selection and type safety.
 */
function convertInLanguage(
  value: number | string | bigint,
  lang: SupportedLanguage
): string {
  return n2words(value, { lang })
}

// Usage with compile-time validation
const result1 = convertInLanguage(42, 'fr') // 'quarante-deux'
const result2 = convertInLanguage(123, 'zh') // '一百二十三'
// convertInLanguage(42, 'invalid') // ← TypeScript error

/**
 * Multi-language converter with options.
 */
function convertWithOptions(
  value: number | string | bigint,
  lang: LanguageCode,
  options: Partial<N2WordsOptions> = {}
): string {
  return n2words(value, { lang, ...options })
}

// Language-specific options are validated
convertWithOptions(42, 'zh', { formal: true })  // ✓ Valid
convertWithOptions(42, 'ar', { feminine: true }) // ✓ Valid
// convertWithOptions(42, 'en', { formal: true })  // ← Works but formal ignored for English
```

### Error Handling

```typescript
import n2words from 'n2words'

function safeConvert(
  value: unknown,
  lang: string = 'en'
): string | null {
  try {
    if (typeof value !== 'number' &&
        typeof value !== 'string' &&
        typeof value !== 'bigint') {
      console.error('Invalid input type')
      return null
    }

    return n2words(value, { lang })
  } catch (error) {
    console.error('Conversion error:', error)
    return null
  }
}
```

## Importing Base Classes (Advanced)

For custom implementations or extensions, you can import the base language classes and types:

```typescript
// Main exports
import n2words, {
  type N2WordsOptions,
  type LanguageCode,

  // Language-specific option types
  type ArabicOptions,
  type ChineseOptions,
  type HebrewOptions,
  type SpanishOptions,
  type DutchOptions,
  type FrenchOptions,
  type TurkishOptions,
  type RomanianOptions,
  type DanishOptions,
  type SlavicOptions
} from 'n2words'

// Base classes (for language developers)
import {
  AbstractLanguage,
  GreedyScaleLanguage,
  SlavicLanguage,
  SouthAsianLanguage,
  TurkicLanguage
} from 'n2words'

// Advanced type definitions (for extending base classes)
import type {
  WordSet,
  ScaleWordPairs,
  SlavicPluralForms,
  SlavicThousandsMap,
  SouthAsianScaleWords,
  SouthAsianBelowHundred,
  TurkicWordPair
} from 'n2words'
```

**Note**: Most users should only need the main `n2words` export and language-specific option types. Base classes and advanced types are primarily for language developers.

See `LANGUAGE_GUIDE.md` for detailed information about extending or implementing custom language converters.

## Browser Usage

The library works in browsers with ESM support. Use a bundler like webpack, Rollup, or Vite:

```typescript
// In a browser-compatible TypeScript project
import n2words from 'n2words'

const text = n2words(42, { lang: 'en' })
document.getElementById('output').textContent = text
```

Pre-built browser bundles are available via CDN:

```html
<script src="https://unpkg.com/n2words/dist/n2words.js"></script>
<script>
  const result = n2words(42, { lang: 'en' })
</script>
```

## Common Issues

### Issue: Language Not Found

```typescript
// ❌ This throws an error if the language is not supported
n2words(42, { lang: 'xyz' })
// Error: no converter for language 'xyz'

// ✅ Validate language or use fallback
const language = isValidLanguage(lang) ? lang : 'en'
n2words(42, { lang: language })
```

### Issue: Decimal Precision

```typescript
// ❌ Number may lose precision
const value = 0.1 + 0.2 // 0.30000000000000004
n2words(value) // Unexpected output

// ✅ Use string for decimal precision
n2words('0.3', { lang: 'en' }) // 'zero point three'
```

### Issue: Option Shape vs Language Support

```typescript
// ❌ Passing undocumented options may be ignored at runtime
const options = { lang: 'en', unknownOption: true }

// ✅ Use documented language options
const options = { lang: 'es', genderStem: 'one_feminine' }
```

## Testing with TypeScript

### Using Jest or Vitest

```typescript
import { describe, it, expect } from 'vitest'
import n2words from 'n2words'

describe('n2words', () => {
  it('converts English numbers', () => {
    expect(n2words(42, { lang: 'en' })).toBe('forty-two')
  })

  it('converts French numbers', () => {
    expect(n2words(42, { lang: 'fr' })).toBe('quarante-deux')
  })

  it('handles decimals', () => {
    const result = n2words('3.14', { lang: 'en' })
    expect(result).toBe('three point one four')
  })

  it('supports BigInt', () => {
    const result = n2words(123456789n, { lang: 'en' })
    expect(result).toContain('million')
  })
})
```

## Performance Considerations

1. **Zero Dependencies**: n2words has zero external dependencies, making it lightweight and fast.

2. **Bundle Size**: Language converters are tree-shakeable; only imported languages are included in the bundle.

## Resources

- **[README.md](README.md)** - Overview and quick start
- **[LANGUAGE_OPTIONS.md](LANGUAGE_OPTIONS.md)** - Language-specific options
- **[LANGUAGE_GUIDE.md](LANGUAGE_GUIDE.md)** - Extending and implementing languages
- **[GitHub Repository](https://github.com/forzagreen/n2words)** - Source code and issues
- **[npm Package](https://npmjs.com/package/n2words)** - Package registry

## Contributing

If you find TypeScript-related issues or have suggestions for improvements, please open an issue on [GitHub](https://github.com/forzagreen/n2words/issues).

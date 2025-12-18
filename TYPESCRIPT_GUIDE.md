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

The main configuration type for all conversions:

```typescript
type N2WordsOptions = {
  /**
   * Target language code (e.g., 'en', 'fr', 'fr-BE').
   * Regional variants are supported; the implementation progressively falls back
   * from most-specific to least-specific (e.g., 'fr-BE' -> 'fr').
   * @default 'en'
   */
  lang?: string

  /**
   * Additional language-specific options (free-form object).
   * Consult language-specific documentation for available options.
   */
  extra?: Record<string, any>
}
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

n2words supports **38 languages**. Here are the most common:

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

See [README.md](README.md) for the complete list of 38 supported languages.

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
  lang: 'en',
  extra: { someOption: true }
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

Some languages support additional options through the `extra` field. Consult `LANGUAGE_OPTIONS.md` for detailed documentation.

### Example: Spanish Gender

```typescript
// Masculine (default)
n2words(1, { lang: 'es', extra: { genderStem: 'one' } }) // 'uno'

// Feminine
n2words(1, { lang: 'es', extra: { genderStem: 'one_feminine' } }) // 'una'
```

### Example: Chinese Formal

```typescript
// Simplified/default
n2words(1, { lang: 'zh' }) // '一'

// Formal/traditional
n2words(1, { lang: 'zh', extra: { formal: true } }) // '壹'
```

### Example: Romanian Feminine

```typescript
// Masculine (default)
n2words(1, { lang: 'ro', extra: { feminine: false } }) // 'unu'

// Feminine
n2words(1, { lang: 'ro', extra: { feminine: true } }) // 'una'
```

Refer to `LANGUAGE_OPTIONS.md` for a complete list of language-specific options.

## Advanced Usage

### Creating a Strongly-Typed Wrapper

If you use n2words frequently with a specific language, create a typed wrapper:

```typescript
import n2words, { type N2WordsOptions } from 'n2words'

/**
 * Convert a number to English words (strongly typed).
 */
function toEnglish(
  value: number | string | bigint,
  extra?: Record<string, any>
): string {
  return n2words(value, { lang: 'en', extra })
}

// Usage
const result = toEnglish(42) // 'forty-two'
```

### Multi-Language Application

```typescript
import n2words from 'n2words'

type SupportedLanguage = 'en' | 'fr' | 'es' | 'de'

/**
 * Convert numbers with language selection.
 */
function convertInLanguage(
  value: number | string | bigint,
  lang: SupportedLanguage
): string {
  const supportedLanguages: Record<SupportedLanguage, string> = {
    en: 'en',
    fr: 'fr',
    es: 'es',
    de: 'de'
  }
  return n2words(value, { lang: supportedLanguages[lang] })
}

// Usage with type safety
const result = convertInLanguage(42, 'fr') // 'quarante-deux'
// convertInLanguage(42, 'invalid') // ← TypeScript error
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

For custom implementations or extensions, you can import the base language classes:

```typescript
import {
  AbstractLanguage,
  CardMatchLanguage,
  SlavicLanguage,
  TurkicLanguage
} from 'n2words'
```

**Note**: Most users should not need to directly import these classes. Use the main `n2words` export instead.

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

### Issue: Type Errors with Extra Options

```typescript
// ❌ TypeScript allows any type for extra
const options = { lang: 'en', extra: { unknownOption: true } }
// No error, but runtime may behave unexpectedly

// ✅ Check language documentation for valid options
const options = { lang: 'es', extra: { genderStem: 'one_feminine' } }
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

# Migration Guide

Guide for migrating to n2words v2.0.0 from previous versions.

## Overview

Version 2.0.0 represents a major refactoring of the n2words library, focusing on:

- **Modern ES6+ architecture** with class-based language implementations
- **Improved type safety** with comprehensive JSDoc annotations
- **Better developer experience** with enhanced tooling and validation
- **Streamlined API** with consistent converter functions
- **Zero dependencies** maintained

## Breaking Changes

### 1. Module System

**v1.x:**

```javascript
const n2words = require('n2words')
n2words(42, { lang: 'en' })
```

**v2.0:**

```javascript
// ESM (recommended)
import { EnglishConverter } from 'n2words'
EnglishConverter(42)

// CommonJS
const { EnglishConverter } = require('n2words')
EnglishConverter(42)
```

**Migration:**

Replace the single `n2words()` function with language-specific converter functions.

**Before:**

```javascript
const n2words = require('n2words')

n2words(42, { lang: 'en' })  // English
n2words(42, { lang: 'es' })  // Spanish
n2words(42, { lang: 'fr' })  // French
```

**After:**

```javascript
const { EnglishConverter, SpanishConverter, FrenchConverter } = require('n2words')

EnglishConverter(42)   // English
SpanishConverter(42)   // Spanish
FrenchConverter(42)    // French
```

### 2. Language Selection

Language selection is now done at import time rather than via options.

**v1.x:**

```javascript
n2words(42, { lang: 'de' })
```

**v2.0:**

```javascript
import { GermanConverter } from 'n2words'
GermanConverter(42)
```

### 3. TypeScript Declarations

**v1.x:** Used `.d.ts` files for type definitions

**v2.0:** Uses JSDoc annotations for type safety

**Migration:**

TypeScript users now benefit from JSDoc-based types that work seamlessly:

```typescript
import { EnglishConverter, NumericValue, ConverterOptions } from 'n2words'

// All types are inferred from JSDoc
const result: string = EnglishConverter(42)

// Type checking works automatically
EnglishConverter(42)        // ✓ number
EnglishConverter('42')      // ✓ string
EnglishConverter(42n)       // ✓ BigInt
EnglishConverter(42, {})    // ✓ with options
```

### 4. Language-Specific Options

Options are now passed as the second parameter to converter functions.

**v1.x:**

```javascript
n2words(1, { lang: 'ar', feminine: true })
```

**v2.0:**

```javascript
import { ArabicConverter } from 'n2words'
ArabicConverter(1, { feminine: true })
```

### 5. Browser Usage

**v1.x:**

```html
<script src="n2words.min.js"></script>
<script>
  n2words(42, { lang: 'en' })
</script>
```

**v2.0:**

```html
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
<script>
  n2words.EnglishConverter(42)
  n2words.SpanishConverter(42)
</script>
```

## Migration Steps

### Step 1: Update Package Version

```bash
npm install n2words@2.0.0
```

### Step 2: Update Imports

Replace the generic import with specific converter functions:

**Before:**

```javascript
const n2words = require('n2words')
```

**After:**

```javascript
// Import only the converters you need
const { EnglishConverter, SpanishConverter } = require('n2words')

// Or use ESM
import { EnglishConverter, SpanishConverter } from 'n2words'
```

### Step 3: Update Function Calls

Replace `n2words(value, { lang: 'xx' })` with `XxConverter(value)`:

**Before:**

```javascript
const result = n2words(42, { lang: 'en' })
```

**After:**

```javascript
const result = EnglishConverter(42)
```

### Step 4: Update Language Options

Move language-specific options from the lang parameter to the options parameter:

**Before:**

```javascript
n2words(1, { lang: 'ar', feminine: true })
n2words(123, { lang: 'zh-Hans', formal: false })
```

**After:**

```javascript
ArabicConverter(1, { feminine: true })
SimplifiedChineseConverter(123, { formal: false })
```

### Step 5: Update Browser Code

Update script tags and function calls:

**Before:**

```html
<script src="path/to/n2words.min.js"></script>
<script>
  console.log(n2words(42, { lang: 'en' }))
</script>
```

**After:**

```html
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
<script>
  console.log(n2words.EnglishConverter(42))
</script>
```

## Language Code Mapping

Map your v1.x language codes to v2.0 converter functions:

| v1.x Code | v2.0 Converter Function |
| --------- | ---------------------- |
| `'ar'` | `ArabicConverter` |
| `'az'` | `AzerbaijaniConverter` |
| `'bn'` | `BanglaConverter` |
| `'cs'` | `CzechConverter` |
| `'da'` | `DanishConverter` |
| `'de'` | `GermanConverter` |
| `'el'` | `GreekConverter` |
| `'en'` | `EnglishConverter` |
| `'es'` | `SpanishConverter` |
| `'fa'` | `PersianConverter` |
| `'fil'` | `FilipinoConverter` |
| `'fr'` | `FrenchConverter` |
| `'fr-BE'` | `FrenchBelgiumConverter` |
| `'gu'` | `GujaratiConverter` |
| `'hbo'` | `BiblicalHebrewConverter` |
| `'he'` | `HebrewConverter` |
| `'hi'` | `HindiConverter` |
| `'hr'` | `CroatianConverter` |
| `'hu'` | `HungarianConverter` |
| `'id'` | `IndonesianConverter` |
| `'it'` | `ItalianConverter` |
| `'ja'` | `JapaneseConverter` |
| `'kn'` | `KannadaConverter` |
| `'ko'` | `KoreanConverter` |
| `'lt'` | `LithuanianConverter` |
| `'lv'` | `LatvianConverter` |
| `'mr'` | `MarathiConverter` |
| `'ms'` | `MalayConverter` |
| `'nb'` | `NorwegianBokmalConverter` |
| `'nl'` | `DutchConverter` |
| `'pa'` | `PunjabiConverter` |
| `'pl'` | `PolishConverter` |
| `'pt'` | `PortugueseConverter` |
| `'ro'` | `RomanianConverter` |
| `'ru'` | `RussianConverter` |
| `'sr-Cyrl'` | `SerbianCyrillicConverter` |
| `'sr-Latn'` | `SerbianLatinConverter` |
| `'sv'` | `SwedishConverter` |
| `'sw'` | `SwahiliConverter` |
| `'ta'` | `TamilConverter` |
| `'te'` | `TeluguConverter` |
| `'th'` | `ThaiConverter` |
| `'tr'` | `TurkishConverter` |
| `'uk'` | `UkrainianConverter` |
| `'ur'` | `UrduConverter` |
| `'vi'` | `VietnameseConverter` |
| `'zh-Hans'` | `SimplifiedChineseConverter` |
| `'zh-Hant'` | `TraditionalChineseConverter` |

## Migration Helper Function

If you need to maintain backward compatibility temporarily, you can create a wrapper:

```javascript
import * as n2words from 'n2words'

// Language code to converter mapping
const langMap = {
  ar: n2words.ArabicConverter,
  en: n2words.EnglishConverter,
  es: n2words.SpanishConverter,
  fr: n2words.FrenchConverter,
  de: n2words.GermanConverter,
  // ... add other languages as needed
}

// Backward compatibility wrapper
function n2wordsLegacy(value, options = {}) {
  const { lang = 'en', ...converterOptions } = options
  const converter = langMap[lang]

  if (!converter) {
    throw new Error(`Language '${lang}' not supported`)
  }

  return converter(value, converterOptions)
}

// Usage (v1.x style)
n2wordsLegacy(42, { lang: 'en' })  // Works like v1.x
```

## Common Migration Patterns

### Pattern 1: Single Language Application

**Before:**

```javascript
const n2words = require('n2words')

function formatInvoiceAmount(amount) {
  return n2words(amount, { lang: 'en' })
}
```

**After:**

```javascript
const { EnglishConverter } = require('n2words')

function formatInvoiceAmount(amount) {
  return EnglishConverter(amount)
}
```

### Pattern 2: Multi-Language Application

**Before:**

```javascript
const n2words = require('n2words')

function formatAmount(amount, language) {
  return n2words(amount, { lang: language })
}

formatAmount(42, 'en')
formatAmount(42, 'es')
formatAmount(42, 'fr')
```

**After:**

```javascript
import {
  EnglishConverter,
  SpanishConverter,
  FrenchConverter
} from 'n2words'

const converters = {
  en: EnglishConverter,
  es: SpanishConverter,
  fr: FrenchConverter
}

function formatAmount(amount, language) {
  const converter = converters[language]
  if (!converter) {
    throw new Error(`Unsupported language: ${language}`)
  }
  return converter(amount)
}

formatAmount(42, 'en')
formatAmount(42, 'es')
formatAmount(42, 'fr')
```

### Pattern 3: Dynamic Language Selection

**Before:**

```javascript
const n2words = require('n2words')

function getUserLanguage() {
  return 'es' // from user settings
}

const userLang = getUserLanguage()
const result = n2words(100, { lang: userLang })
```

**After:**

```javascript
import * as n2words from 'n2words'

const langToConverter = {
  en: n2words.EnglishConverter,
  es: n2words.SpanishConverter,
  fr: n2words.FrenchConverter,
  // ... map other languages
}

function getUserLanguage() {
  return 'es' // from user settings
}

const userLang = getUserLanguage()
const converter = langToConverter[userLang]
const result = converter(100)
```

## New Features in v2.0

### Enhanced Type Safety

All converters now have comprehensive JSDoc annotations:

```javascript
import { EnglishConverter } from 'n2words'

// TypeScript/IDE autocomplete works perfectly
EnglishConverter(42)        // ✓
EnglishConverter('42')      // ✓
EnglishConverter(42n)       // ✓
EnglishConverter(42, {})    // ✓
```

### Better Tree-Shaking

Import only what you need for smaller bundle sizes:

```javascript
// Only includes English converter in bundle
import { EnglishConverter } from 'n2words'
```

### Improved Developer Tools

New scripts for language development:

```bash
npm run lang:add <code>      # Scaffold new language
npm run lang:validate        # Validate all languages
npm run lang:validate -- en  # Validate specific language
```

### Consistent API

All languages follow the same pattern:

```javascript
// Same signature for all languages
LanguageConverter(value, options)
```

## Troubleshooting

### Error: Cannot find module 'n2words'

Make sure you've installed v2.0.0:

```bash
npm install n2words@2.0.0
```

### Error: n2words is not a function

You're trying to use v1.x syntax with v2.0. Update to language-specific converters:

```javascript
// ✗ Wrong (v1.x style)
const n2words = require('n2words')
n2words(42)

// ✓ Correct (v2.0 style)
const { EnglishConverter } = require('n2words')
EnglishConverter(42)
```

### TypeScript errors after upgrade

Make sure your TypeScript configuration recognizes JSDoc types:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "maxNodeModuleJsDepth": 1
  }
}
```

### Bundle size increased

Make sure you're using tree-shaking compatible bundlers and only importing what you need:

```javascript
// ✓ Good: tree-shakeable
import { EnglishConverter } from 'n2words'

// ✗ Bad: imports everything
import * as n2words from 'n2words'
const { EnglishConverter } = n2words
```

## Getting Help

If you encounter issues during migration:

1. Check the [API documentation](API.md)
2. Review [examples](EXAMPLES.md)
3. Search [existing issues](https://github.com/forzagreen/n2words/issues)
4. Open a [new issue](https://github.com/forzagreen/n2words/issues/new)

## Rollback

If you need to rollback to v1.x:

```bash
npm install n2words@1.x
```

Note: v1.x will continue to receive critical bug fixes but new features will only be added to v2.0+.

# n2words API Reference

Complete API documentation for the n2words library.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [API Overview](#api-overview)
- [Language Converters](#language-converters)
- [Language-Specific Options](#language-specific-options)
- [Type Definitions](#type-definitions)
- [Error Handling](#error-handling)

## Installation

```bash
npm install n2words
```

## Basic Usage

### ESM (ES Modules)

```javascript
import { EnglishConverter, SpanishConverter } from 'n2words'

EnglishConverter(42)  // 'forty-two'
SpanishConverter(42)  // 'cuarenta y dos'
```

### CommonJS

```javascript
const { EnglishConverter, FrenchConverter } = require('n2words')

EnglishConverter(100)   // 'one hundred'
FrenchConverter(100)    // 'cent'
```

### Browser (CDN)

```html
<script src="https://cdn.jsdelivr.net/npm/n2words/dist/n2words.js"></script>
<script>
  console.log(n2words.EnglishConverter(42))  // 'forty-two'
  console.log(n2words.GermanConverter(42))   // 'zweiundvierzig'
</script>
```

## API Overview

### Converter Function Signature

All language converters follow the same signature:

```typescript
function Converter(value: NumericValue, options?: ConverterOptions): string
```

- **value**: The number to convert (`number`, `bigint`, or `string`)
- **options**: Optional configuration object (varies by language)
- **returns**: The number as words in the target language

### Input Types

#### Numbers

Standard JavaScript numbers (safe up to `Number.MAX_SAFE_INTEGER`):

```javascript
EnglishConverter(0)          // 'zero'
EnglishConverter(42)         // 'forty-two'
EnglishConverter(1000000)    // 'one million'
EnglishConverter(-5)         // 'minus five'
EnglishConverter(3.14)       // 'three point one four'
```

#### BigInt

For arbitrarily large integers:

```javascript
EnglishConverter(123456789012345n)
// 'one hundred and twenty-three trillion four hundred and fifty-six billion...'

SimplifiedChineseConverter(10000n)  // '壹万'
```

#### Strings

Numbers as strings are automatically parsed:

```javascript
EnglishConverter('42')      // 'forty-two'
EnglishConverter('-3.14')   // 'minus three point one four'
```

## Language Converters

### Complete List (47 Languages)

| Converter Function | Language | Code | Example Output |
| ----------------- | -------- | ---- | -------------- |
| `ArabicConverter` | Arabic | `ar` | 'واحد وعشرون' |
| `AzerbaijaniConverter` | Azerbaijani | `az` | 'iyirmi bir' |
| `BanglaConverter` | Bengali | `bn` | 'একুশ' |
| `BiblicalHebrewConverter` | Biblical Hebrew | `hbo` | 'עשרים ואחד' |
| `CroatianConverter` | Croatian | `hr` | 'dvadeset jedan' |
| `CzechConverter` | Czech | `cs` | 'dvacet jedna' |
| `DanishConverter` | Danish | `da` | 'enogtyve' |
| `DutchConverter` | Dutch | `nl` | 'eenentwintig' |
| `EnglishConverter` | English | `en` | 'twenty-one' |
| `FilipinoConverter` | Filipino | `fil` | 'dalawampu't isa' |
| `FrenchConverter` | French | `fr` | 'vingt-et-un' |
| `FrenchBelgiumConverter` | French (Belgium) | `fr-BE` | 'vingt-et-un' |
| `GermanConverter` | German | `de` | 'einundzwanzig' |
| `GreekConverter` | Greek | `el` | 'είκοσι ένα' |
| `GujaratiConverter` | Gujarati | `gu` | 'એકવીસ' |
| `HebrewConverter` | Hebrew (Modern) | `he` | 'עשרים ואחת' |
| `HindiConverter` | Hindi | `hi` | 'इक्कीस' |
| `HungarianConverter` | Hungarian | `hu` | 'huszonegy' |
| `IndonesianConverter` | Indonesian | `id` | 'dua puluh satu' |
| `ItalianConverter` | Italian | `it` | 'ventuno' |
| `JapaneseConverter` | Japanese | `ja` | '二十一' |
| `KannadaConverter` | Kannada | `kn` | 'ಇಪ್ಪತ್ತೊಂದು' |
| `KoreanConverter` | Korean | `ko` | '이십일' |
| `LatvianConverter` | Latvian | `lv` | 'divdesmit viens' |
| `LithuanianConverter` | Lithuanian | `lt` | 'dvidešimt vienas' |
| `MalayConverter` | Malay | `ms` | 'dua puluh satu' |
| `MarathiConverter` | Marathi | `mr` | 'एकवीस' |
| `NorwegianBokmalConverter` | Norwegian Bokmål | `nb` | 'tjueen' |
| `PersianConverter` | Persian | `fa` | 'بیست و یک' |
| `PolishConverter` | Polish | `pl` | 'dwadzieścia jeden' |
| `PortugueseConverter` | Portuguese | `pt` | 'vinte e um' |
| `PunjabiConverter` | Punjabi | `pa` | 'ਇੱਕੀ' |
| `RomanianConverter` | Romanian | `ro` | 'douăzeci și unu' |
| `RussianConverter` | Russian | `ru` | 'двадцать один' |
| `SerbianCyrillicConverter` | Serbian (Cyrillic) | `sr-Cyrl` | 'двадесет један' |
| `SerbianLatinConverter` | Serbian (Latin) | `sr-Latn` | 'dvadeset jedan' |
| `SimplifiedChineseConverter` | Chinese (Simplified) | `zh-Hans` | '贰拾壹' |
| `SpanishConverter` | Spanish | `es` | 'veintiuno' |
| `SwahiliConverter` | Swahili | `sw` | 'ishirini na moja' |
| `SwedishConverter` | Swedish | `sv` | 'tjugoett' |
| `TamilConverter` | Tamil | `ta` | 'இருபத்தி ஒன்று' |
| `TeluguConverter` | Telugu | `te` | 'ఇరవై ఒకటి' |
| `ThaiConverter` | Thai | `th` | 'ยี่สิบเอ็ด' |
| `TraditionalChineseConverter` | Chinese (Traditional) | `zh-Hant` | '貳拾壹' |
| `TurkishConverter` | Turkish | `tr` | 'yirmi bir' |
| `UkrainianConverter` | Ukrainian | `uk` | 'двадцять один' |
| `UrduConverter` | Urdu | `ur` | 'اکیس' |
| `VietnameseConverter` | Vietnamese | `vi` | 'hai mươi mốt' |

### Usage Examples

```javascript
// European languages
EnglishConverter(123)     // 'one hundred and twenty-three'
FrenchConverter(123)      // 'cent vingt-trois'
GermanConverter(123)      // 'einhundertdreiundzwanzig'
SpanishConverter(123)     // 'ciento veintitrés'
ItalianConverter(123)     // 'centoventitré'

// Slavic languages
RussianConverter(123)     // 'сто двадцать три'
PolishConverter(123)      // 'sto dwadzieścia trzy'
CzechConverter(123)       // 'sto dvacet tři'

// Asian languages
JapaneseConverter(123)    // '百二十三'
KoreanConverter(123)      // '백이십삼'
SimplifiedChineseConverter(123)  // '壹佰贰拾叁'
ThaiConverter(123)        // 'หนึ่งร้อยยี่สิบสาม'

// Indian languages
HindiConverter(123)       // 'एक सौ तेईस'
TamilConverter(123)       // 'நூற்று இருபத்தி மூன்று'
BanglaConverter(123)      // 'একশত তেইশ'

// Middle Eastern languages
ArabicConverter(123)      // 'مائة وثلاثة وعشرون'
PersianConverter(123)     // 'صد و بیست و سه'
HebrewConverter(123)      // 'מאה עשרים ושלוש'
```

## Language-Specific Options

Some languages support additional options to customize output.

### Arabic (`ArabicConverter`)

**Options:**

```typescript
interface ArabicOptions {
  feminine?: boolean  // Use feminine forms (default: false)
  negativeWord?: string  // Custom word for negative numbers
}
```

**Examples:**

```javascript
// Masculine (default)
ArabicConverter(1)  // 'واحد'

// Feminine
ArabicConverter(1, { feminine: true })  // 'واحدة'

// Custom negative word
ArabicConverter(-5, { negativeWord: 'سالب' })  // 'سالب خمسة'
```

### Chinese (`SimplifiedChineseConverter`, `TraditionalChineseConverter`)

**Options:**

```typescript
interface ChineseOptions {
  formal?: boolean  // Use formal/financial numerals (default: true)
}
```

**Examples:**

```javascript
// Formal/financial style (default)
SimplifiedChineseConverter(123)  // '壹佰贰拾叁'

// Common/everyday style
SimplifiedChineseConverter(123, { formal: false })  // '一百二十三'

// Traditional Chinese
TraditionalChineseConverter(123)  // '貳佰貳拾參'
TraditionalChineseConverter(123, { formal: false })  // '一百二十三'
```

### Languages with Custom Options

Most languages accept these base options:

```typescript
interface ConverterOptions {
  // Language-specific options vary
  // Check individual language documentation
}
```

## Type Definitions

### NumericValue

```typescript
type NumericValue = number | bigint | string
```

Represents any valid numeric input:

- `number`: Standard JavaScript numbers
- `bigint`: For large integers beyond `Number.MAX_SAFE_INTEGER`
- `string`: Numeric strings (parsed automatically)

### ConverterFunction

```typescript
type ConverterFunction = (
  value: NumericValue,
  options?: ConverterOptions
) => string
```

The signature for all converter functions.

### ConverterOptions

```typescript
interface ConverterOptions {
  // Base options (if any)
  // Plus language-specific options
}
```

Configuration object passed to converters. Options vary by language.

## Error Handling

### Invalid Input

The library handles various input types gracefully:

```javascript
// Valid inputs
EnglishConverter(42)       // ✓ 'forty-two'
EnglishConverter('42')     // ✓ 'forty-two'
EnglishConverter(42n)      // ✓ 'forty-two'
EnglishConverter(-42)      // ✓ 'minus forty-two'
EnglishConverter(3.14)     // ✓ 'three point one four'
```

### Large Numbers

For numbers exceeding `Number.MAX_SAFE_INTEGER`, use `BigInt`:

```javascript
// Unsafe: may lose precision
EnglishConverter(9007199254740992)  // Precision issues

// Safe: use BigInt
EnglishConverter(9007199254740992n)  // ✓ Correct result
```

### Decimal Handling

Decimal handling varies by language:

```javascript
// English: digit-by-digit
EnglishConverter(3.14159)  // 'three point one four one five nine'

// Japanese: digit-by-digit
JapaneseConverter(3.14)  // '三点一四'

// Most languages follow digit-by-digit pattern for decimals
```

## Advanced Usage

### Direct Class Usage

While converter functions are recommended, you can use classes directly:

```javascript
import { English, Spanish } from 'n2words'

const en = new English()
const es = new Spanish()

en.convertToWords(42)  // 'forty-two'
es.convertToWords(42)  // 'cuarenta y dos'
```

### Reusing Instances

For performance-critical applications with the same options:

```javascript
import { SimplifiedChinese } from 'n2words'

// Create instance once
const formalChinese = new SimplifiedChinese({ formal: true })
const casualChinese = new SimplifiedChinese({ formal: false })

// Reuse instances
formalChinese.convertToWords(123)  // '壹佰贰拾叁'
casualChinese.convertToWords(123)  // '一百二十三'
```

## Browser Compatibility

The library works in all modern browsers and Node.js environments:

- **Node.js**: ^20 || ^22 || >=24
- **Browsers**: All modern browsers with ES6+ support
- **Module Systems**: ESM, CommonJS, UMD (browser)

## Performance Notes

- **Zero dependencies**: No external dependencies to load
- **Lightweight**: Small bundle size
- **Fast**: Optimized algorithms for each language
- **BigInt support**: Handle arbitrarily large numbers efficiently

For detailed performance benchmarks, see [guides/PERFORMANCE.md](guides/PERFORMANCE.md).

## See Also

- [Main README](../README.md) - Overview and quick start
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Language Development Guide](guides/LANGUAGE_DEVELOPMENT.md) - Add new languages
- [Browser Usage Guide](guides/BROWSER_USAGE.md) - Browser integration details
- [Performance Guide](guides/PERFORMANCE.md) - Performance optimization

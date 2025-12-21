# Language-Specific Options Guide

This guide documents all language-specific options available to **end-users** of the n2words library. These options allow you to customize number conversion behavior for specific languages (e.g., gender agreement, regional variants, formatting preferences).

**For Language Developers**: See [LANGUAGE_GUIDE.md](LANGUAGE_GUIDE.md) for information about implementing custom language converters and internal language class properties.

## Common Options (Language Developer Only)

**⚠️ NOTE**: These options are **not exposed to end-users**. They are internal language implementation options used by language developers only. (Exception: Arabic exposes `negativeWord` to end-users; see the Arabic section.)

| Option                    | Type    | Description                                     | Default Value                                           |
| ------------------------- | ------- | ----------------------------------------------- | ------------------------------------------------------- |
| `negativeWord`            | string  | Word used for negative numbers                  | Language-specific (e.g., "minus", "menos", "ناقص")      |
| `decimalSeparatorWord`    | string  | Word separating whole and decimal parts         | Language-specific (e.g., "point", "virgule", "virgulă") |
| `zeroWord`                | string  | Word for the digit 0                            | Language-specific (e.g., "zero", "zéro", "zero")        |
| `convertDecimalsPerDigit` | boolean | Read decimals digit-by-digit instead of grouped | `false`                                                 |

These are **class properties** of language implementations in `lib/languages/` and are set by language developers when implementing a new language converter. End-users typically do not interact with these options directly.

Note: Some languages read decimals per digit and effectively set `convertDecimalsPerDigit = true`: ja, th, ta, te, tl, mr, gu, kn, el.

## Language-Specific Options

### Arabic (ar) - Gender Agreement

Arabic provides masculine and feminine forms for numbers with complex grammatical rules.

**Options:**

| Option         | Type    | Description                            | Default  |
| -------------- | ------- | -------------------------------------- | -------- |
| `feminine`     | boolean | Use feminine number forms              | `false`  |
| `negativeWord` | string  | Word used for negative numbers (minus) | `'ناقص'` |

**Examples:**

```javascript
n2words(1, { lang: 'ar' }); // 'واحد' (masculine)
n2words(1, { lang: 'ar', feminine: true }); // 'واحدة' (feminine)
n2words(2, { lang: 'ar' }); // 'اثنان' (masculine)
n2words(2, { lang: 'ar', feminine: true }); // 'اثنتان' (feminine)
n2words(-20, { lang: 'ar', negativeWord: 'سالب' }); // 'سالب عشرون' (custom minus word)
```

**Use Cases:**

- Use masculine (default) for counting abstract items or standalone numbers
- Use feminine when referring to feminine nouns in Arabic grammar

---

### Spanish (es) - Gender Stem

Spanish number endings change based on grammatical gender (masculine/feminine).

**Options:**

| Option       | Type   | Description                                          | Default |
| ------------ | ------ | ---------------------------------------------------- | ------- |
| `genderStem` | string | Gender ending: `'o'` (masculine) or `'a'` (feminine) | `'o'`   |

**Examples:**

```javascript
n2words(1, { lang: 'es' }); // 'uno' (masculine)
n2words(1, { lang: 'es', genderStem: 'a' }); // 'una' (feminine)
n2words(200, { lang: 'es' }); // 'doscientos' (masculine)
n2words(200, { lang: 'es', genderStem: 'a' }); // 'doscientas' (feminine)
```

**Use Cases:**

- Masculine (default): "doscientos libros" (two hundred books - masculine noun)
- Feminine: "doscientas páginas" (two hundred pages - feminine noun)

---

### French (fr) - Hyphenation

French supports optional hyphenation in compound numbers.

**Options:**

| Option                | Type    | Description                                             | Default |
| --------------------- | ------- | ------------------------------------------------------- | ------- |
| `withHyphenSeparator` | boolean | Use hyphens instead of spaces between number components | `false` |

**Examples:**

```javascript
// Standard French
n2words(70, { lang: 'fr' }); // 'soixante-dix' (standard French: 60 + 10)
n2words(90, { lang: 'fr' }); // 'quatre-vingt-dix' (standard: 4 × 20 + 10)

// Hyphenation (affects component joining)
n2words(21, { lang: 'fr' }); // 'vingt et un' (default: space before et)
n2words(21, { lang: 'fr', withHyphenSeparator: true }); // 'vingt-et-un' (hyphenated)
```

**Use Cases:**

- Default: Contemporary French with space separators
- `withHyphenSeparator: true`: Formal writing, checks, legal documents

**Note:** Use language code `'fr-BE'` for the Belgian system; standard French (`'fr'`) no longer accepts `_region`.

---

### Belgian French (fr-BE) - Inherits French Options

Belgian French is a regional variant selected with `lang: 'fr-BE'`.

**Options:**

| Option                | Type    | Description                   | Default |
| --------------------- | ------- | ----------------------------- | ------- |
| `withHyphenSeparator` | boolean | Use hyphens instead of spaces | `false` |

**Examples:**

```javascript
n2words(70, { lang: 'fr-BE' }); // 'septante' (automatic Belgian variant)
n2words(90, { lang: 'fr-BE' }); // 'nonante' (automatic Belgian variant)
```

---

### Hebrew (he) - Modern Hebrew Forms

Modern Hebrew provides feminine number forms as used in contemporary Israeli Hebrew.

**Options:**

| Option | Type   | Description                                    | Default |
| ------ | ------ | ---------------------------------------------- | ------- |
| `and`  | string | Conjunction word for joining number components | `'ו'`   |

**Examples:**

```javascript
// Modern Hebrew (feminine forms, default)
n2words(1, { lang: 'he' }); // 'אחת'
n2words(21, { lang: 'he' }); // 'עשרים ואחת'
n2words(5000, { lang: 'he' }); // 'חמשת אלפים'

// Decimal numbers (per-digit reading)
n2words(3.14, { lang: 'he' }); // 'שלש נקודה אחת ארבע'
n2words(0.5, { lang: 'he' }); // 'אפס נקודה חמש'
```

**Use Cases:**

- Contemporary Israeli Hebrew: Everyday use, modern contexts
- Educational materials: Mathematics, general education
- Modern literature and media

**Decimal Handling:**

Modern Hebrew uses per-digit decimal reading with "נקודה" (nekuda) as the decimal separator. Each decimal digit is read individually, which is the standard practice in Hebrew mathematical contexts.

**Note:** For Biblical Hebrew forms, use the separate `hbo` language code instead of the `he` language.

---

### Biblical Hebrew (hbo) - Ancient Hebrew Forms

Biblical Hebrew provides authentic ancient Hebrew number words with proper grammatical gender handling, separate from the modern Hebrew implementation.

**Options:**

| Option     | Type    | Description                                                        | Default |
| ---------- | ------- | ------------------------------------------------------------------ | ------- |
| `feminine` | boolean | Use feminine forms for numbers (masculine is Biblical Hebrew default) | `false` |
| `and`      | string  | Conjunction word for joining number components                     | `'ו'`   |

**Examples:**

```javascript
// Masculine forms (default, historically accurate)
n2words(1, { lang: 'hbo' }); // 'אחד'
n2words(5, { lang: 'hbo' }); // 'חמשה'
n2words(21, { lang: 'hbo' }); // 'עשרים ואחד'

// Feminine forms (when specified)
n2words(1, { lang: 'hbo', feminine: true }); // 'אחת'
n2words(5, { lang: 'hbo', feminine: true }); // 'חמש'
n2words(21, { lang: 'hbo', feminine: true }); // 'עשרים ואחת'
n2words(5000, { lang: 'hbo', feminine: true }); // 'חמשת אלפים'

// Decimal number in Biblical Hebrew
n2words(3.14, { lang: 'hbo' }); // 'שלשה נקודה אחד ארבעה'
n2words(0.5, { lang: 'hbo' }); // 'אפס נקודה חמשה'
```

**Use Cases:**

- Biblical Hebrew: Religious texts, Torah study, ancient Hebrew contexts
- Academic research: Historical linguistics, biblical studies
- Traditional contexts: Ceremonial use, Hebrew learning

**Decimal Handling:**

Biblical Hebrew uses per-digit decimal reading with "נקודה" (nekuda) as the decimal separator, following traditional Hebrew mathematical conventions.

---

### Russian (ru) - Gender Agreement

Russian supports masculine and feminine forms for digits 1-9 (ones place) via the shared Slavic `feminine` option.

**Options:**

| Option     | Type    | Description                        | Default |
| ---------- | ------- | ---------------------------------- | ------- |
| `feminine` | boolean | Use feminine forms for 1-9         | `false` |

**Examples:**

```javascript
// Masculine (default)
n2words(1, { lang: 'ru' }); // 'один'
n2words(2, { lang: 'ru' }); // 'два'

// Feminine
n2words(1, { lang: 'ru', feminine: true }); // 'одна'
n2words(2, { lang: 'ru', feminine: true }); // 'две'
n2words(4, { lang: 'ru', feminine: true }); // 'четыре' (ones digit uses feminine set)
```

---

### Czech (cz) - Gender Agreement

Czech uses the shared Slavic `feminine` option for feminine forms of digits 1-9 (ones place).

**Options:**

| Option     | Type    | Description                        | Default |
| ---------- | ------- | ---------------------------------- | ------- |
| `feminine` | boolean | Use feminine forms for 1-9         | `false` |

**Examples:**

```javascript
// Masculine (default)
n2words(1, { lang: 'cs' }); // 'jeden'
n2words(2, { lang: 'cs' }); // 'dva'

// Feminine
n2words(1, { lang: 'cs', feminine: true }); // 'jedna'
n2words(2, { lang: 'cs', feminine: true }); // 'dvě'
n2words(4, { lang: 'cs', feminine: true }); // 'čtyři' (feminine ones set)
```

---

### Polish (pl) - Gender Agreement

Polish uses the shared Slavic `feminine` option for feminine forms of digits 1-9 (ones place).

**Options:**

| Option     | Type    | Description                        | Default |
| ---------- | ------- | ---------------------------------- | ------- |
| `feminine` | boolean | Use feminine forms for 1-9         | `false` |

**Examples:**

```javascript
// Masculine (default)
n2words(1, { lang: 'pl' }); // 'jeden'
n2words(2, { lang: 'pl' }); // 'dwa'

// Feminine
n2words(1, { lang: 'pl', feminine: true }); // 'jedna'
n2words(2, { lang: 'pl', feminine: true }); // 'dwie'
n2words(4, { lang: 'pl', feminine: true }); // 'cztery' (feminine ones set)
```

---

### Ukrainian (uk) - Gender Agreement

Ukrainian uses the shared Slavic `feminine` option for feminine forms of digits 1-9 (ones place).

**Options:**

| Option     | Type    | Description                        | Default |
| ---------- | ------- | ---------------------------------- | ------- |
| `feminine` | boolean | Use feminine forms for 1-9         | `false` |

**Examples:**

```javascript
// Masculine (default)
n2words(1, { lang: 'uk' }); // 'один'
n2words(2, { lang: 'uk' }); // 'два'

// Feminine
n2words(1, { lang: 'uk', feminine: true }); // 'одна'
n2words(2, { lang: 'uk', feminine: true }); // 'дві'
n2words(4, { lang: 'uk', feminine: true }); // 'чотири' (feminine ones set)
```

---

### Serbian (sr-Latn) - Gender Agreement

Serbian uses the shared Slavic `feminine` option for feminine forms of digits 1-9 (ones place).

**Options:**

| Option     | Type    | Description                        | Default |
| ---------- | ------- | ---------------------------------- | ------- |
| `feminine` | boolean | Use feminine forms for 1-9         | `false` |

**Examples:**

```javascript
// Masculine (default)
n2words(1, { lang: 'sr-Latn' }); // 'jedan'
n2words(2, { lang: 'sr-Latn' }); // 'dva'

// Feminine
n2words(1, { lang: 'sr-Latn', feminine: true }); // 'jedna'
n2words(2, { lang: 'sr-Latn', feminine: true }); // 'dve'
n2words(4, { lang: 'sr-Latn', feminine: true }); // 'četiri' (feminine ones set)
```

---

### Croatian (hr) - Gender Agreement

Croatian uses the shared Slavic `feminine` option for feminine forms of digits 1-9 (ones place).

**Options:**

| Option     | Type    | Description                        | Default |
| ---------- | ------- | ---------------------------------- | ------- |
| `feminine` | boolean | Use feminine forms for 1-9         | `false` |

**Examples:**

```javascript
// Masculine (default)
n2words(1, { lang: 'hr' }); // 'jedan'
n2words(2, { lang: 'hr' }); // 'dva'

// Feminine
n2words(1, { lang: 'hr', feminine: true }); // 'jedna'
n2words(2, { lang: 'hr', feminine: true }); // 'dvije'
n2words(4, { lang: 'hr', feminine: true }); // 'četiri' (feminine ones set)
```

---

### Lithuanian (lt) - Gender Agreement

Lithuanian uses the shared Slavic `feminine` option for feminine forms of digits 1-9 (ones place).

**Options:**

| Option     | Type    | Description                        | Default |
| ---------- | ------- | ---------------------------------- | ------- |
| `feminine` | boolean | Use feminine forms for 1-9         | `false` |

**Examples:**

```javascript
// Masculine (default)
n2words(1, { lang: 'lt' }); // 'vienas'
n2words(2, { lang: 'lt' }); // 'du'

// Feminine
n2words(1, { lang: 'lt', feminine: true }); // 'viena'
n2words(2, { lang: 'lt', feminine: true }); // 'dvi'
n2words(4, { lang: 'lt', feminine: true }); // 'keturios' (distinct feminine form)
```

---

### Latvian (lv) - Gender Agreement

Latvian uses the shared Slavic `feminine` option for feminine forms of digits 1-9 (ones place).

**Options:**

| Option     | Type    | Description                        | Default |
| ---------- | ------- | ---------------------------------- | ------- |
| `feminine` | boolean | Use feminine forms for 1-9         | `false` |

**Examples:**

```javascript
// Masculine (default)
n2words(1, { lang: 'lv' }); // 'viens'
n2words(2, { lang: 'lv' }); // 'divi'

// Feminine
n2words(1, { lang: 'lv', feminine: true }); // 'viena'
n2words(2, { lang: 'lv', feminine: true }); // 'divas'
n2words(4, { lang: 'lv', feminine: true }); // 'četri' (Latvian shares ones set)
```

---

### Chinese Simplified (zh-Hans) - Formal vs. Common Numerals

Chinese Simplified supports both formal/financial numerals (大写数字) and common/everyday numerals (小写数字).

**Options:**

| Option   | Type    | Description                                       | Default |
| -------- | ------- | ------------------------------------------------- | ------- |
| `formal` | boolean | Use formal/financial numerals vs. common numerals | `true`  |

**Examples:**

```javascript
// Formal/financial style (default) - used in banking, legal documents
n2words(123, { lang: 'zh-Hans' }); // '壹佰贰拾叁'
n2words(123, { lang: 'zh-Hans', formal: true }); // '壹佰贰拾叁'

// Common/everyday style - used in daily life
n2words(123, { lang: 'zh-Hans', formal: false }); // '一百二十三'

// Large numbers
n2words(999999999999n, { lang: 'zh-Hans', formal: false });
// '九千九百九十九亿九千九百九十九万九千九百九十九'
```

**Formal Numerals (大写数字 - dàxiě shùzì):**

| Value | Formal | Common |
| ----- | ------ | ------ |
| 0     | 零     | 零     |
| 1     | 壹     | 一     |
| 2     | 贰     | 二     |
| 3     | 叁     | 三     |
| 4     | 肆     | 四     |
| 5     | 伍     | 五     |
| 6     | 陆     | 六     |
| 7     | 柒     | 七     |
| 8     | 捌     | 八     |
| 9     | 玖     | 九     |
| 10    | 拾     | 十     |
| 100   | 佰     | 百     |
| 1000  | 仟     | 千     |

**Use Cases:**

- Formal (default): Financial documents, checks, contracts, legal documents (prevents alteration/fraud)
- Common: Everyday writing, casual communication, general-purpose number conversion

---

### Romanian (ro) - Gender Agreement

Romanian provides masculine and feminine number forms with complex agreement rules.

**Options:**

| Option     | Type    | Description               | Default |
| ---------- | ------- | ------------------------- | ------- |
| `feminine` | boolean | Use feminine number forms | `false` |

**Examples:**

```javascript
// Masculine (default)
n2words(1, { lang: 'ro' }); // 'unu'
n2words(2, { lang: 'ro' }); // 'doi'
n2words(21, { lang: 'ro' }); // 'douăzeci și unu'

// Feminine
n2words(1, { lang: 'ro', feminine: true }); // 'una'
n2words(2, { lang: 'ro', feminine: true }); // 'două'
n2words(21, { lang: 'ro', feminine: true }); // 'douăzeci și una'
```

**Use Cases:**

- Masculine (default): "doi bărbați" (two men), "douăzeci și doi de ani" (twenty-two years)
- Feminine: "două femei" (two women), "douăzeci și una de ore" (twenty-one hours)

---

### Turkish (tr) / Azerbaijani (az) - Space Control

Turkish and Azerbaijani use agglutination where number components can be joined without spaces.

**Options:**

| Option       | Type    | Description                                             | Default |
| ------------ | ------- | ------------------------------------------------------- | ------- |
| `dropSpaces` | boolean | Remove spaces between number components (agglutination) | `false` |

**Examples:**

```javascript
// Turkish
n2words(21, { lang: 'tr' }); // 'yirmi bir' (with space)
n2words(21, { lang: 'tr', dropSpaces: true }); // 'yirmibir' (agglutinated)

// Azerbaijani
n2words(21, { lang: 'az' }); // 'iyirmi bir' (with space)
n2words(21, { lang: 'az', dropSpaces: true }); // 'iyirmibir' (agglutinated)
```

**Use Cases:**

- `dropSpaces: false` (default): More readable, informal writing
- `dropSpaces: true`: Traditional agglutinated form, formal documents

---

## Summary Table

| Language               | Option                | Type    | Default  | Description                                             |
| ---------------------- | --------------------- | ------- | -------- | ------------------------------------------------------- |
| Arabic (ar)            | `feminine`            | boolean | `false`  | Use feminine number forms                               |
| Arabic (ar)            | `negativeWord`        | string  | `'ناقص'` | Word used for negative numbers                          |
| Spanish (es)           | `genderStem`          | string  | `'o'`    | Gender ending: `'o'` (masc) or `'a'` (fem)              |
| French (fr)            | `withHyphenSeparator` | boolean | `false`  | Use hyphens instead of spaces                           |
| Belgian French (fr-BE) | `withHyphenSeparator` | boolean | `false`  | Use hyphens instead of spaces                           |
| Russian (ru)           | `feminine`            | boolean | `false`  | Use feminine forms for ones (1-9) and related cases     |
| Czech (cz)             | `feminine`            | boolean | `false`  | Use feminine forms for ones (1-9) and related cases     |
| Polish (pl)            | `feminine`            | boolean | `false`  | Use feminine forms for ones (1-9) and related cases     |
| Ukrainian (uk)         | `feminine`            | boolean | `false`  | Use feminine forms for ones (1-9) and related cases     |
| Serbian (sr-Latn)      | `feminine`            | boolean | `false`  | Use feminine forms for ones (1-9) and related cases     |
| Croatian (hr)          | `feminine`            | boolean | `false`  | Use feminine forms for ones (1-9) and related cases     |
| Lithuanian (lt)        | `feminine`            | boolean | `false`  | Use feminine forms for ones (1-9) and related cases     |
| Latvian (lv)           | `feminine`            | boolean | `false`  | Use feminine forms for ones (1-9) and related cases     |
| Hebrew (he)            | `biblical`            | boolean | `false`  | Use Biblical (masculine) forms                          |
| Hebrew (he)            | `and`                 | string  | `'ו'`    | Conjunction word                                        |
| Romanian (ro)          | `feminine`            | boolean | `false`  | Use feminine number forms                               |
| Turkish (tr)           | `dropSpaces`          | boolean | `false`  | Remove spaces (agglutination)                           |
| Azerbaijani (az)       | `dropSpaces`          | boolean | `false`  | Remove spaces (agglutination)                           |

---

## Usage Examples

### Complete Examples with Options

```javascript
import n2words from 'n2words';

// Arabic - Feminine counting
console.log(n2words(3, { lang: 'ar', feminine: true }));
// Output: 'ثلاث'

// Spanish - Feminine agreement for "páginas" (pages)
console.log(n2words(500, { lang: 'es', genderStem: 'a' }) + ' páginas');
// Output: 'quinientas páginas'

// French - Belgian variant with hyphens
console.log(
  n2words(99, { lang: 'fr-BE', withHyphenSeparator: true }),
);
// Output: 'nonante-neuf'

// Hebrew - Biblical form
console.log(n2words(100, { lang: 'he', biblical: true }));
// Output: 'מאה'

// Romanian - Feminine counting
console.log(n2words(1001, { lang: 'ro', feminine: true }));
// Output: 'o mie una'

// Turkish - Agglutinated form
console.log(n2words(35, { lang: 'tr', dropSpaces: true }));
// Output: 'otuzbeş'
```

### Combining Options

You can combine language-specific options with common options:

```javascript
// Negative number in feminine Arabic
n2words(-5, { lang: 'ar', feminine: true });
// Output: 'ناقص خمس'

// Decimal number in Biblical Hebrew
n2words(3.14, { lang: 'he', biblical: true });
// Output: 'שלושה עשר ארבע'

// Negative number in feminine Romanian
n2words(-2, { lang: 'ro', feminine: true });
// Output: 'minus două'

// Custom negative word in Arabic (user-exposed option)
n2words(-21, {
  lang: 'ar',
  negativeWord: 'سالب',
});
// Output: 'سالب واحد وعشرون'
```

---

## Language Families

Languages in n2words are grouped by shared characteristics:

### Gender-Aware Languages

- **Arabic** (ar): masculine/feminine with complex pluralization
- **Spanish** (es): gender stem for adjective agreement
- **Romanian** (ro): masculine/feminine with case agreement
- **Hebrew** (he): modern feminine vs. Biblical masculine

### Regional Variants

- **French** (fr): standard vs. Belgian number systems
- **Belgian French** (fr-BE): automatic Belgian variant

### Agglutinative Languages

- **Turkish** (tr): optional space removal
- **Azerbaijani** (az): optional space removal

### Other Languages (No Special Options)

All other languages use only the common options:

- English (en), German (de), Italian (it), Portuguese (pt), Dutch (nl)
- Norwegian (no), Danish (dk), Swedish (sv)
- Russian (ru), Polish (pl), Czech (cz), Ukrainian (uk), Serbian (sr-Latn), Croatian (hr), Lithuanian (lt), Latvian (lv)
- Hungarian (hu), Japanese (ja), Korean (ko), Vietnamese (vi)
- Persian/Farsi (fa), Indonesian (id)
- Hindi (hi), Bengali (bn), Tamil (ta), Telugu (te), Thai (th), Swahili (sw)

---

## Best Practices

1. **Gender Agreement**: When using gender options (Arabic, Spanish, Romanian), ensure the gender matches the noun being counted.

2. **Regional Variants**: Choose the French language code based on your target audience:

- Standard French → `lang: 'fr'`
- Belgian French → `lang: 'fr-BE'`

1. **Hebrew Forms**: Select Biblical vs. Modern based on context:
   - Modern applications, contemporary writing → `biblical: false` (default)
   - Religious texts, traditional contexts → `biblical: true`

2. **Turkish/Azerbaijani Spacing**: Use `dropSpaces: true` for traditional writing styles, `false` for modern readability.

3. **Testing**: When implementing number conversion in your application, test with various number ranges (1-10, 11-19, 20-99, 100-999, 1000+) to ensure proper grammatical agreement.

---

## Contributing

If you identify additional language-specific options that would be useful, or find errors in the existing option implementations, please:

1. Review the relevant language file in `lib/languages/`
2. Check the test file in `test/fixtures/languages/` for usage examples
3. Open an issue or pull request on GitHub

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed contribution guidelines.

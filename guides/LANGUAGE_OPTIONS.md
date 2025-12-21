# Language-Specific Options Guide

This guide documents all language-specific options available to **end-users** of the n2words library. These options allow you to customize number conversion behavior for specific languages (e.g., gender agreement, regional variants, formatting preferences).

**For Language Developers**: See [LANGUAGE_GUIDE.md](LANGUAGE_GUIDE.md) for information about implementing custom language converters.

## Language-Specific Options

### Arabic (ar) - Gender Agreement

**Options:**

| Option         | Type    | Description                   | Default  |
| -------------- | ------- | ----------------------------- | -------- |
| `feminine`     | boolean | Use feminine number forms     | `false`  |
| `negativeWord` | string  | Custom word for negative numbers | `'ناقص'` |

**Examples:**

```javascript
n2words(1, { lang: 'ar' }); // 'واحد' (masculine)
n2words(1, { lang: 'ar', feminine: true }); // 'واحدة' (feminine)
n2words(2, { lang: 'ar', feminine: true }); // 'اثنتان' (feminine)
n2words(-20, { lang: 'ar', negativeWord: 'سالب' }); // 'سالب عشرون'
```

---

### Spanish (es) - Gender Agreement

**Options:**

| Option       | Type   | Description                              | Default |
| ------------ | ------ | ---------------------------------------- | ------- |
| `genderStem` | string | Gender ending: `'o'` (masc) or `'a'` (fem) | `'o'`   |

**Examples:**

```javascript
n2words(1, { lang: 'es' }); // 'uno' (masculine)
n2words(1, { lang: 'es', genderStem: 'a' }); // 'una' (feminine)
n2words(200, { lang: 'es', genderStem: 'a' }); // 'doscientas' (feminine)
```

---

### French (fr) - Hyphenation

**Options:**

| Option                | Type    | Description                    | Default |
| --------------------- | ------- | ------------------------------ | ------- |
| `withHyphenSeparator` | boolean | Use hyphens instead of spaces  | `false` |

**Examples:**

```javascript
n2words(21, { lang: 'fr' }); // 'vingt et un'
n2words(21, { lang: 'fr', withHyphenSeparator: true }); // 'vingt-et-un'
n2words(70, { lang: 'fr' }); // 'soixante-dix'
```

**Note:** Use `'fr-BE'` for Belgian French (septante/nonante system).

---

### Belgian French (fr-BE) - Regional Variant

Belgian French uses septante/nonante system and inherits French hyphenation options.

**Examples:**

```javascript
n2words(70, { lang: 'fr-BE' }); // 'septante'
n2words(90, { lang: 'fr-BE' }); // 'nonante'
```

---

### Dutch (nl) - Formatting Options

**Options:**

| Option               | Type    | Description                     | Default |
| -------------------- | ------- | ------------------------------- | ------- |
| `includeOptionalAnd` | boolean | Include "en" (and) separator    | `false` |
| `noHundredPairs`     | boolean | Disable comma before hundreds   | `false` |
| `accentOne`          | boolean | Use accented "één" for one      | `true`  |

**Examples:**

```javascript
n2words(21, { lang: 'nl' }); // 'eenentwintig'
n2words(21, { lang: 'nl', includeOptionalAnd: true }); // 'een en twintig'
n2words(1, { lang: 'nl', accentOne: false }); // 'een'
```

---

### Danish (da) - Ordinal Numbers

**Options:**

| Option    | Type    | Description              | Default |
| --------- | ------- | ------------------------ | ------- |
| `ordFlag` | boolean | Enable ordinal numbers   | `false` |

**Examples:**

```javascript
n2words(1, { lang: 'da' }); // 'en' (cardinal)
n2words(1, { lang: 'da', ordFlag: true }); // 'første' (ordinal)
n2words(21, { lang: 'da', ordFlag: true }); // 'enogtyvende'
```

---

### Hebrew - Modern and Biblical Variants

#### Modern Hebrew (he)

Modern Israeli Hebrew with contemporary feminine forms.

**Options:**

| Option | Type   | Description                   | Default |
| ------ | ------ | ----------------------------- | ------- |
| `and`  | string | Conjunction word              | `'ו'`   |

**Examples:**

```javascript
n2words(1, { lang: 'he' }); // 'אחת' (modern feminine default)
n2words(21, { lang: 'he' }); // 'עשרים ואחת'
n2words(3.14, { lang: 'he' }); // 'שלש נקודה אחת ארבע' (per-digit decimals)
```

#### Biblical Hebrew (hbo)

Authentic ancient Hebrew with masculine defaults and optional feminine forms.

**Options:**

| Option     | Type    | Description                                | Default |
| ---------- | ------- | ------------------------------------------ | ------- |
| `feminine` | boolean | Use feminine forms (masculine is default) | `false` |
| `and`      | string  | Conjunction word                           | `'ו'`   |

**Examples:**

```javascript
n2words(1, { lang: 'hbo' }); // 'אחד' (masculine default)
n2words(1, { lang: 'hbo', feminine: true }); // 'אחת' (feminine)
n2words(21, { lang: 'hbo' }); // 'עשרים ואחד'
n2words(3.14, { lang: 'hbo' }); // 'שלושה נקודה אחד ארבעה'
```

---

### Slavic Languages - Gender Agreement

Slavic and Baltic languages support feminine forms for digits 1-9 (ones place):

**Languages:** Russian (ru), Czech (cs), Polish (pl), Ukrainian (uk), Serbian Latin (sr-Latn), Serbian Cyrillic (sr-Cyrl), Croatian (hr), Lithuanian (lt), Latvian (lv)

**Options:**

| Option     | Type    | Description                | Default |
| ---------- | ------- | -------------------------- | ------- |
| `feminine` | boolean | Use feminine forms for 1-9 | `false` |

**Examples:**

```javascript
// Russian
n2words(1, { lang: 'ru' }); // 'один' (masculine)
n2words(1, { lang: 'ru', feminine: true }); // 'одна' (feminine)
n2words(2, { lang: 'ru', feminine: true }); // 'две' (feminine)

// Czech
n2words(1, { lang: 'cs', feminine: true }); // 'jedna'
n2words(2, { lang: 'cs', feminine: true }); // 'dvě'

// Serbian Cyrillic
n2words(1, { lang: 'sr-Cyrl', feminine: true }); // 'једна'
n2words(2, { lang: 'sr-Cyrl', feminine: true }); // 'две'
```

---

### Chinese - Formal vs. Common Numerals

Both Chinese Simplified (zh-Hans) and Traditional (zh-Hant) support formal/financial vs. common numerals.

**Options:**

| Option   | Type    | Description                              | Default |
| -------- | ------- | ---------------------------------------- | ------- |
| `formal` | boolean | Use formal/financial vs. common numerals | `true`  |

**Examples:**

```javascript
// Simplified Chinese
n2words(123, { lang: 'zh-Hans' }); // '壹佰贰拾叁' (formal, default)
n2words(123, { lang: 'zh-Hans', formal: false }); // '一百二十三' (common)

// Traditional Chinese
n2words(123, { lang: 'zh-Hant' }); // '壹佰貳拾參' (formal, default)
n2words(123, { lang: 'zh-Hant', formal: false }); // '一百二十三' (common)
```

**Use Cases:**

- Formal (default): Financial documents, legal contexts, prevents alteration
- Common: Everyday writing, casual communication

---

### Romanian (ro) - Gender Agreement

**Options:**

| Option     | Type    | Description               | Default |
| ---------- | ------- | ------------------------- | ------- |
| `feminine` | boolean | Use feminine number forms | `false` |

**Examples:**

```javascript
n2words(1, { lang: 'ro' }); // 'unu' (masculine)
n2words(1, { lang: 'ro', feminine: true }); // 'una' (feminine)
n2words(21, { lang: 'ro', feminine: true }); // 'douăzeci și una'
```

---

### Turkish (tr) / Azerbaijani (az) - Agglutination

**Options:**

| Option       | Type    | Description                        | Default |
| ------------ | ------- | ---------------------------------- | ------- |
| `dropSpaces` | boolean | Remove spaces between components   | `false` |

**Examples:**

```javascript
n2words(21, { lang: 'tr' }); // 'yirmi bir' (with spaces)
n2words(21, { lang: 'tr', dropSpaces: true }); // 'yirmibir' (agglutinated)
n2words(21, { lang: 'az', dropSpaces: true }); // 'iyirmibir' (Azerbaijani)
```

---

## Summary

| Language/Group        | Option(s)             | Description                           |
| --------------------- | --------------------- | ------------------------------------- |
| Arabic (ar)           | `feminine`, `negativeWord` | Gender forms, custom negative word |
| Spanish (es)          | `genderStem`          | Masculine/feminine endings            |
| French (fr/fr-BE)     | `withHyphenSeparator` | Hyphenation style                     |
| Dutch (nl)            | `includeOptionalAnd`, `accentOne` | Formatting options          |
| Danish (da)           | `ordFlag`             | Cardinal/ordinal numbers              |
| Hebrew (he/hbo)       | `and`, `feminine` (hbo only) | Conjunction, gender (Biblical)  |
| Slavic Languages      | `feminine`            | Feminine forms for digits 1-9        |
| Chinese (zh-Hans/Hant) | `formal`             | Formal vs. common numerals            |
| Romanian (ro)         | `feminine`            | Gender agreement                      |
| Turkish/Azerbaijani   | `dropSpaces`          | Agglutinated forms                    |

---

## Usage Examples

```javascript
import n2words from 'n2words';

// Gender agreement examples
n2words(3, { lang: 'ar', feminine: true }); // 'ثلاث'
n2words(500, { lang: 'es', genderStem: 'a' }); // 'quinientas'
n2words(1001, { lang: 'ro', feminine: true }); // 'o mie una'

// Regional variants
n2words(99, { lang: 'fr-BE', withHyphenSeparator: true }); // 'nonante-neuf'
n2words(100, { lang: 'hbo' }); // 'מאה' (Biblical Hebrew)

// Formatting options
n2words(35, { lang: 'tr', dropSpaces: true }); // 'otuzbeş'
n2words(123, { lang: 'zh-Hans', formal: false }); // '一百二十三'

// Slavic feminine forms
n2words(2, { lang: 'ru', feminine: true }); // 'две'
n2words(1, { lang: 'sr-Cyrl', feminine: true }); // 'једна'
```

---

## Language Categories

**Gender-Aware Languages:** Arabic, Spanish, Romanian, Hebrew (Biblical), Slavic languages

**Regional Variants:** French (standard vs. Belgian), Hebrew (modern vs. Biblical), Chinese (Simplified vs. Traditional)

**Formatting Options:** Dutch (conjunctions, accents), Danish (ordinals), Turkish/Azerbaijani (agglutination), French (hyphenation), Chinese (formal vs. common)

**Other Languages** (no special options): English, German, Italian, Portuguese, Norwegian, Swedish, Hungarian, Japanese, Korean, Vietnamese, Persian, Indonesian, Malay, Hindi, Bengali, Tamil, Telugu, Thai, Swahili, Marathi, Gujarati, Kannada, Urdu, Punjabi, Greek, Filipino

---

## Best Practices

1. **Gender Agreement**: Match the gender option with the noun being counted
2. **Regional Selection**: Choose appropriate language codes (`fr` vs `fr-BE`, `he` vs `hbo`)
3. **Chinese Style**: Use `formal: true` for financial documents, `formal: false` for everyday use
4. **Testing**: Test various number ranges (1-10, teens, 20-99, 100+) for proper grammar

---

## Contributing

If you identify additional language-specific options that would be useful, or find errors in the existing option implementations, please:

1. Review the relevant language file in `lib/languages/`
2. Check the test file in `test/fixtures/languages/` for usage examples
3. Open an issue or pull request on GitHub

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed contribution guidelines.

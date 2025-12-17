# Language-Specific Options Guide

This guide documents all unique language-specific options available in the n2words library. All languages support the common options (`negativeWord`, `separatorWord`, `zero`), but some languages provide additional options for grammatical features.

## Common Options (All Languages)

These options are available for all 30 supported languages:

| Option          | Type   | Description                             | Default Value                                           |
| --------------- | ------ | --------------------------------------- | ------------------------------------------------------- |
| `negativeWord`  | string | Word used for negative numbers          | Language-specific (e.g., "minus", "menos", "ناقص")      |
| `separatorWord` | string | Word separating whole and decimal parts | Language-specific (e.g., "point", "virgule", "virgulă") |
| `zero`          | string | Word for the digit 0                    | Language-specific (e.g., "zero", "cero", "صفر")         |

## Language-Specific Options

### Arabic (ar) - Gender Agreement

Arabic provides masculine and feminine forms for numbers with complex grammatical rules.

**Options:**

| Option     | Type    | Description               | Default |
| ---------- | ------- | ------------------------- | ------- |
| `feminine` | boolean | Use feminine number forms | `false` |

**Examples:**

```javascript
n2words(1, { lang: 'ar' }); // 'واحد' (masculine)
n2words(1, { lang: 'ar', feminine: true }); // 'واحدة' (feminine)
n2words(2, { lang: 'ar' }); // 'اثنان' (masculine)
n2words(2, { lang: 'ar', feminine: true }); // 'اثنتان' (feminine)
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

### French (fr) - Regional Variants and Hyphenation

French supports both standard French and Belgian French number systems, plus optional hyphenation.

**Options:**

| Option                | Type    | Description                                             | Default |
| --------------------- | ------- | ------------------------------------------------------- | ------- |
| `_region`             | string  | Region variant: `'FR'` (standard) or `'BE'` (Belgian)   | `'FR'`  |
| `withHyphenSeparator` | boolean | Use hyphens instead of spaces between number components | `false` |

**Examples:**

```javascript
// Regional differences (70, 90)
n2words(70, { lang: 'fr' }); // 'soixante-dix' (standard French)
n2words(70, { lang: 'fr', _region: 'BE' }); // 'septante' (Belgian French)
n2words(90, { lang: 'fr' }); // 'quatre-vingt-dix' (standard)
n2words(90, { lang: 'fr', _region: 'BE' }); // 'nonante' (Belgian)

// Hyphenation
n2words(21, { lang: 'fr' }); // 'vingt et un'
n2words(21, { lang: 'fr', withHyphenSeparator: true }); // 'vingt-et-un'
```

**Use Cases:**

- `_region: 'FR'`: Standard French (France, most francophone regions)
- `_region: 'BE'`: Belgian French, Swiss French (more logical 70/90 system)
- `withHyphenSeparator: true`: Formal writing, checks, legal documents

**Note:** Belgian French (fr-BE) automatically sets `_region: 'BE'`.

---

### Belgian French (fr-BE) - Inherits French Options

Belgian French is a regional variant that automatically uses `_region: 'BE'`.

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

### Hebrew (he) - Biblical vs. Modern Forms

Hebrew provides both modern (feminine default) and Biblical (masculine) number forms.

**Options:**

| Option     | Type    | Description                                                        | Default |
| ---------- | ------- | ------------------------------------------------------------------ | ------- |
| `biblical` | boolean | Use Biblical Hebrew (masculine) forms instead of modern (feminine) | `false` |
| `and`      | string  | Conjunction word for joining number components                     | `'ו'`   |

**Examples:**

```javascript
// Modern Hebrew (feminine, default)
n2words(1, { lang: 'he' }); // 'אחת'
n2words(21, { lang: 'he' }); // 'עשרים ואחת'

// Biblical Hebrew (masculine)
n2words(1, { lang: 'he', biblical: true }); // 'אחד'
n2words(21, { lang: 'he', biblical: true }); // 'עשרים ואחד'
```

**Use Cases:**

- Modern Hebrew (default): Contemporary Israeli Hebrew, everyday use
- Biblical Hebrew: Religious texts, Torah readings, traditional contexts

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

| Language               | Option                | Type    | Default | Description                                   |
| ---------------------- | --------------------- | ------- | ------- | --------------------------------------------- |
| Arabic (ar)            | `feminine`            | boolean | `false` | Use feminine number forms                     |
| Spanish (es)           | `genderStem`          | string  | `'o'`   | Gender ending: `'o'` (masc) or `'a'` (fem)    |
| French (fr)            | `_region`             | string  | `'FR'`  | Region: `'FR'` (standard) or `'BE'` (Belgian) |
| French (fr)            | `withHyphenSeparator` | boolean | `false` | Use hyphens instead of spaces                 |
| Belgian French (fr-BE) | `withHyphenSeparator` | boolean | `false` | Use hyphens instead of spaces                 |
| Hebrew (he)            | `biblical`            | boolean | `false` | Use Biblical (masculine) forms                |
| Hebrew (he)            | `and`                 | string  | `'ו'`   | Conjunction word                              |
| Romanian (ro)          | `feminine`            | boolean | `false` | Use feminine number forms                     |
| Turkish (tr)           | `dropSpaces`          | boolean | `false` | Remove spaces (agglutination)                 |
| Azerbaijani (az)       | `dropSpaces`          | boolean | `false` | Remove spaces (agglutination)                 |

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
  n2words(99, { lang: 'fr', _region: 'BE', withHyphenSeparator: true }),
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

// Custom negative word with French hyphens
n2words(-21, {
  lang: 'fr',
  withHyphenSeparator: true,
  negativeWord: 'négatif',
});
// Output: 'négatif vingt-et-un'
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

All other 21 languages use only the common options:

- English (en), German (de), Italian (it), Portuguese (pt), Dutch (nl)
- Norwegian (no), Danish (dk), Swedish (sv)
- Russian (ru), Polish (pl), Czech (cz), Ukrainian (uk), Serbian (sr), Croatian (hr), Lithuanian (lt), Latvian (lv)
- Hungarian (hu), Japanese (ja), Korean (ko), Chinese (zh), Vietnamese (vi)
- Persian/Farsi (fa), Indonesian (id)

---

## Best Practices

1. **Gender Agreement**: When using gender options (Arabic, Spanish, Romanian), ensure the gender matches the noun being counted.

2. **Regional Variants**: Choose the French variant (`_region`) based on your target audience:
   - France, Canada (Quebec), most French-speaking countries → `'FR'`
   - Belgium, Switzerland (some regions) → `'BE'`

3. **Hebrew Forms**: Select Biblical vs. Modern based on context:
   - Modern applications, contemporary writing → `biblical: false` (default)
   - Religious texts, traditional contexts → `biblical: true`

4. **Turkish/Azerbaijani Spacing**: Use `dropSpaces: true` for traditional writing styles, `false` for modern readability.

5. **Testing**: When implementing number conversion in your application, test with various number ranges (1-10, 11-19, 20-99, 100-999, 1000+) to ensure proper grammatical agreement.

---

## Contributing

If you identify additional language-specific options that would be useful, or find errors in the existing option implementations, please:

1. Review the relevant language file in `lib/i18n/`
2. Check the test file in `test/i18n/` for usage examples
3. Open an issue or pull request on GitHub

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

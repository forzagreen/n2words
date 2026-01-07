## 3.0.0 - Functional Architecture

Complete rewrite from class-based to functional architecture with major performance improvements.

### ⚠ BREAKING CHANGES

**Migration required** - API has changed:

#### From v1.x (default export)

> **Note:** v1 bundled all languages into a single wrapper function with runtime language selection via `{ lang: 'es' }`. v3 requires explicit language imports for tree-shaking—only the languages you import are included in your bundle.

| Context | v1 | v3 |
|---------|----|----|
| **Import (all)** | `import n2words from 'n2words'` | `import { en, es } from 'n2words'` |
| **Import (single)** | `import es from 'n2words/languages/es'` | `import { toWords } from 'n2words/es'` |
| **Usage** | `n2words(42, { lang: 'es' })` | `es(42)` or `toWords(42)` |
| **Browser** | `n2words(42, { lang: 'es' })` | `n2words.es(42)` |
| **CDN (single)** | `.../dist/languages/es.js` | `.../dist/languages/es.js` (unchanged) |

#### From v2.x (class-based)

| Context | v2 | v3 |
|---------|----|----|
| **Import (all)** | `import { EnglishConverter } from 'n2words'` | `import { en } from 'n2words'` |
| **Import (single)** | `import { EnglishConverter } from 'n2words/en'` | `import { toWords } from 'n2words/en'` |
| **Usage** | `EnglishConverter(42)` | `en(42)` or `toWords(42)` |
| **Browser** | `n2words.EnglishConverter(42)` | `n2words.en(42)` |
| **CDN (single)** | `.../dist/EnglishConverter.js` | `.../dist/languages/en.js` |

### Highlights

- **3x-85x faster** conversion across languages
- **70-96% less memory** per conversion
- **75-92% smaller** per-language bundles
- **52 languages** - all self-contained, tree-shakeable modules

### New Languages

`am` (Amharic), `am-Latn` (Amharic Latin), `fi` (Finnish), `ha` (Hausa), `hbo` (Biblical Hebrew), `sr-Cyrl` (Serbian Cyrillic), `zh-Hant` (Traditional Chinese)

### Performance Improvements

- Precomputed lookup tables (en, pt, he, hbo)
- BigInt modulo instead of string slicing (ja, sw)
- Eliminated class instantiation overhead

---
See [#206](https://github.com/forzagreen/n2words/pull/206) for full details.

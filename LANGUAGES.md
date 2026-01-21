# Supported Languages

> **Auto-generated** — Do not edit manually. Run `npm run docs:languages` to update.

n2words supports **55 languages** with cardinal number conversion, 1 with ordinal support.

Language codes follow [IETF BCP 47](https://tools.ietf.org/html/bcp47) standards.

## All Languages

|Code|Export|Language|Cardinal|Ordinal|
|----|------|--------|:------:|:-----:|
|`am`||Amharic|✓||
|`am-Latn`|`amLatn`|Amharic (Latin)|✓||
|`ar`||Arabic|✓¹||
|`az`||Azerbaijani|✓||
|`bn`||Bangla|✓||
|`cs`||Czech|✓||
|`da`||Danish|✓||
|`de`||German|✓||
|`el`||Greek|✓||
|`en-GB`|`enGB`|British English|✓||
|`en-US`|`enUS`|American English|✓¹|✓|
|`es`||Spanish|✓¹||
|`fa`||Persian|✓||
|`fi`||Finnish|✓||
|`fil`||Filipino|✓||
|`fr`||French|✓¹||
|`fr-BE`|`frBE`|French (Belgium)|✓¹||
|`gu`||Gujarati|✓||
|`ha`||Hausa|✓||
|`hbo`||Biblical Hebrew|✓¹||
|`he`||Hebrew|✓¹||
|`hi`||Hindi|✓||
|`hr`||Croatian|✓¹||
|`hu`||Hungarian|✓||
|`id`||Indonesian|✓||
|`it`||Italian|✓||
|`ja`||Japanese|✓||
|`ka`||Georgian|✓||
|`kn`||Kannada|✓||
|`ko`||Korean|✓||
|`lt`||Lithuanian|✓¹||
|`lv`||Latvian|✓¹||
|`mr`||Marathi|✓||
|`ms`||Malay|✓||
|`nb`||Norwegian Bokmål|✓||
|`nl`||Dutch|✓¹||
|`pa`||Punjabi|✓||
|`pl`||Polish|✓¹||
|`pt`||Portuguese|✓||
|`ro`||Romanian|✓¹||
|`ru`||Russian|✓¹||
|`sr-Cyrl`|`srCyrl`|Serbian (Cyrillic)|✓¹||
|`sr-Latn`|`srLatn`|Serbian (Latin)|✓¹||
|`sv`||Swedish|✓||
|`sw`||Swahili|✓||
|`ta`||Tamil|✓||
|`te`||Telugu|✓||
|`th`||Thai|✓||
|`tr`||Turkish|✓¹||
|`uk`||Ukrainian|✓¹||
|`ur`||Urdu|✓||
|`vi`||Vietnamese|✓||
|`yo`||Yoruba|✓||
|`zh-Hans`|`zhHans`|Simplified Chinese|✓¹||
|`zh-Hant`|`zhHant`|Traditional Chinese|✓¹||

¹ Has options — see [Language Options](#language-options) section.

## Usage

```js
// Import language modules directly
import { toCardinal } from 'n2words/en-US'
import { toCardinal, toOrdinal } from 'n2words/de'

toCardinal(42)  // 'forty-two'
toOrdinal(42)   // 'forty-second' (if supported)
```

### Import Paths

Import paths use BCP 47 language codes: `n2words/en-US`, `n2words/zh-Hans`, `n2words/fr-BE`

## Language Options

20 languages support options via a second parameter. Options are passed as an object:

```js
toCardinal(value, { optionName: value })
```

### American English (`en-US`)

**Cardinal options:**

- `hundredPairing` (`boolean`, default: `false`) — Use hundred-pairing for 1100-9999 (e.g., "fifteen hundred" instead of "one thousand five hundred")
- `and` (`boolean`, default: `false`) — Use "and" after hundreds and before final small numbers (e.g., "one hundred and one" instead of "one hundred one")

### Arabic (`ar`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender
- `negativeWord` (`string`) — Custom word for negative numbers

### Biblical Hebrew (`hbo`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender
- `andWord` (`string`, default: `'ו'`) — Custom conjunction word

### Croatian (`hr`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

### Dutch (`nl`)

**Cardinal options:**

- `accentOne` (`boolean`, default: `true`) — Use "één" instead of "een"
- `includeOptionalAnd` (`boolean`, default: `false`) — Include "en" before small numbers
- `noHundredPairing` (`boolean`, default: `false`) — Disable hundred pairing (1104→duizend honderdvier)

### French (`fr`)

**Cardinal options:**

- `withHyphenSeparator` (`boolean`, default: `false`) — Use hyphens between all words

### French (Belgium) (`fr-BE`)

**Cardinal options:**

- `withHyphenSeparator` (`boolean`, default: `false`) — Use hyphens between words

### Hebrew (`he`)

**Cardinal options:**

- `andWord` (`string`, default: `'ו'`) — Custom conjunction word

### Latvian (`lv`)

**Cardinal options:**

- `gender` (`string`, default: `'masculine'`) — Gender for numbers < 1000

### Lithuanian (`lt`)

**Cardinal options:**

- `gender` (`string`, default: `'masculine'`) — Gender for numbers < 1000

### Polish (`pl`)

**Cardinal options:**

- `gender` (`string`, default: `'masculine'`) — Gender for numbers < 1000

### Romanian (`ro`)

**Cardinal options:**

- `gender` (`string`, default: `'masculine'`) — Gender for numbers

### Russian (`ru`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

### Serbian (Cyrillic) (`sr-Cyrl`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

### Serbian (Latin) (`sr-Latn`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

### Simplified Chinese (`zh-Hans`)

**Cardinal options:**

- `formal` (`boolean`, default: `true`) — Use formal/financial numerals

### Spanish (`es`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

### Traditional Chinese (`zh-Hant`)

**Cardinal options:**

- `formal` (`boolean`, default: `true`) — Use formal/financial numerals

### Turkish (`tr`)

**Cardinal options:**

- `dropSpaces` (`boolean`, default: `false`) — Remove spaces for compound form

### Ukrainian (`uk`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

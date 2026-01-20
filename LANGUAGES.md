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
|`en-US`|`enUS`|American English|✓¹|✓¹|
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
// Named imports (tree-shakable)
import { enUS, zhHans, frBE } from 'n2words'

enUS.toCardinal(42)  // 'forty-two'
enUS.toOrdinal(42)   // 'forty-second' (if supported)

// Subpath imports (smallest bundle)
import { toCardinal, toOrdinal } from 'n2words/en-US'
```

### Import Names

- Simple codes import directly: `en`, `fr`, `de`
- Hyphenated codes use camelCase: `zh-Hans` → `zhHans`, `fr-BE` → `frBE`

## Language Options

20 languages support additional options via a second parameter:

```js
toCardinal(value, options)
toOrdinal(value, options)
```

|Language|Form|Option|Type|Default|Description|
|--------|----|----|-------|-------|-----------|
|American English|Cardinal|`and`|`boolean`|`false`|Use "and" after hundreds and before final small numbers (e.g., "one hundred and one" instead of "one hundred one")|
|American English|Ordinal|`and`|`boolean`|`false`|Use "and" after hundreds and before final small numbers (e.g., "one hundred and one" instead of "one hundred one")|
|American English|Cardinal|`hundredPairing`|`boolean`|`false`|Use hundred-pairing for 1100-9999 (e.g., "fifteen hundred" instead of "one thousand five hundred")|
|American English|Ordinal|`hundredPairing`|`boolean`|`false`|Use hundred-pairing for 1100-9999 (e.g., "fifteen hundred" instead of "one thousand five hundred")|
|Arabic|Cardinal|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|
|Arabic|Cardinal|`negativeWord`|`string`||Custom word for negative numbers|
|Biblical Hebrew|Cardinal|`andWord`|`string`|`'ו'`|Custom conjunction word|
|Biblical Hebrew|Cardinal|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|
|Croatian|Cardinal|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|
|Dutch|Cardinal|`accentOne`|`boolean`|`true`|Use "één" instead of "een"|
|Dutch|Cardinal|`includeOptionalAnd`|`boolean`|`false`|Include "en" before small numbers|
|Dutch|Cardinal|`noHundredPairing`|`boolean`|`false`|Disable hundred pairing (1104→duizend honderdvier)|
|French|Cardinal|`withHyphenSeparator`|`boolean`|`false`|Use hyphens between all words|
|French (Belgium)|Cardinal|`withHyphenSeparator`|`boolean`|`false`|Use hyphens between words|
|Hebrew|Cardinal|`andWord`|`string`|`'ו'`|Custom conjunction word|
|Latvian|Cardinal|`gender`|`string`|`'masculine'`|Gender for numbers < 1000|
|Lithuanian|Cardinal|`gender`|`string`|`'masculine'`|Gender for numbers < 1000|
|Polish|Cardinal|`gender`|`string`|`'masculine'`|Gender for numbers < 1000|
|Romanian|Cardinal|`gender`|`string`|`'masculine'`|Gender for numbers|
|Russian|Cardinal|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|
|Serbian (Cyrillic)|Cardinal|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|
|Serbian (Latin)|Cardinal|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|
|Simplified Chinese|Cardinal|`formal`|`boolean`|`true`|Use formal/financial numerals|
|Spanish|Cardinal|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|
|Traditional Chinese|Cardinal|`formal`|`boolean`|`true`|Use formal/financial numerals|
|Turkish|Cardinal|`dropSpaces`|`boolean`|`false`|Remove spaces for compound form|
|Ukrainian|Cardinal|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|

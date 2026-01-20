# Supported Languages

> **Auto-generated** — Do not edit manually. Run `npm run docs:languages` to update.

n2words supports **54 languages**, 19 of which have additional options.

Language codes follow [IETF BCP 47](https://tools.ietf.org/html/bcp47) standards.

## All Languages

|Code|Export|Language|Options|
|----|------|--------|:-----:|
|`am`||Amharic||
|`am-Latn`|`amLatn`|Amharic (Latin)||
|`ar`||Arabic|✓|
|`az`||Azerbaijani||
|`bn`||Bangla||
|`cs`||Czech||
|`da`||Danish||
|`de`||German||
|`el`||Greek||
|`en`||English||
|`es`||Spanish|✓|
|`fa`||Persian||
|`fi`||Finnish||
|`fil`||Filipino||
|`fr`||French|✓|
|`fr-BE`|`frBE`|French (Belgium)|✓|
|`gu`||Gujarati||
|`ha`||Hausa||
|`hbo`||Biblical Hebrew|✓|
|`he`||Hebrew|✓|
|`hi`||Hindi||
|`hr`||Croatian|✓|
|`hu`||Hungarian||
|`id`||Indonesian||
|`it`||Italian||
|`ja`||Japanese||
|`ka`||Georgian||
|`kn`||Kannada||
|`ko`||Korean||
|`lt`||Lithuanian|✓|
|`lv`||Latvian|✓|
|`mr`||Marathi||
|`ms`||Malay||
|`nb`||Norwegian Bokmål||
|`nl`||Dutch|✓|
|`pa`||Punjabi||
|`pl`||Polish|✓|
|`pt`||Portuguese||
|`ro`||Romanian|✓|
|`ru`||Russian|✓|
|`sr-Cyrl`|`srCyrl`|Serbian (Cyrillic)|✓|
|`sr-Latn`|`srLatn`|Serbian (Latin)|✓|
|`sv`||Swedish||
|`sw`||Swahili||
|`ta`||Tamil||
|`te`||Telugu||
|`th`||Thai||
|`tr`||Turkish|✓|
|`uk`||Ukrainian|✓|
|`ur`||Urdu||
|`vi`||Vietnamese||
|`yo`||Yoruba||
|`zh-Hans`|`zhHans`|Simplified Chinese|✓|
|`zh-Hant`|`zhHant`|Traditional Chinese|✓|

## Usage

```js
// Named imports (tree-shakable)
import { en, zhHans, frBE } from 'n2words'

// Subpath imports (smallest bundle)
import { toWords } from 'n2words/en'
import { toWords as zhHans } from 'n2words/zh-Hans'
```

### Import Names

- Simple codes import directly: `en`, `fr`, `de`
- Hyphenated codes use camelCase: `zh-Hans` → `zhHans`, `fr-BE` → `frBE`

## Language Options

19 languages support additional options via a second parameter:

```js
toWords(value, options)
```

|Language|Option|Type|Default|Description|
|--------|------|----|-------|-----------|
|Arabic|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|
|Arabic|`negativeWord`|`string`||Custom word for negative numbers|
|Biblical Hebrew|`andWord`|`string`|`'ו'`|Custom conjunction word|
|Biblical Hebrew|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|
|Croatian|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|
|Dutch|`accentOne`|`boolean`|`true`|Use "één" instead of "een"|
|Dutch|`includeOptionalAnd`|`boolean`|`false`|Include "en" before small numbers|
|Dutch|`noHundredPairing`|`boolean`|`false`|Disable hundred pairing (1104→duizend honderdvier)|
|French|`withHyphenSeparator`|`boolean`|`false`|Use hyphens between all words|
|French (Belgium)|`withHyphenSeparator`|`boolean`|`false`|Use hyphens between words|
|Hebrew|`andWord`|`string`|`'ו'`|Custom conjunction word|
|Latvian|`gender`|`string`|`'masculine'`|Gender for numbers < 1000|
|Lithuanian|`gender`|`string`|`'masculine'`|Gender for numbers < 1000|
|Polish|`gender`|`string`|`'masculine'`|Gender for numbers < 1000|
|Romanian|`gender`|`string`|`'masculine'`|Gender for numbers|
|Russian|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|
|Serbian (Cyrillic)|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|
|Serbian (Latin)|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|
|Simplified Chinese|`formal`|`boolean`|`true`|Use formal/financial numerals|
|Spanish|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|
|Traditional Chinese|`formal`|`boolean`|`true`|Use formal/financial numerals|
|Turkish|`dropSpaces`|`boolean`|`false`|Remove spaces for compound form|
|Ukrainian|`gender`|'masculine' \| 'feminine'|`'masculine'`|Grammatical gender|

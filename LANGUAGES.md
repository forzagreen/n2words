# Supported Languages

> **Auto-generated** — Do not edit manually. Run `npm run docs:languages` to update.

n2words supports **57 languages** with cardinal number conversion, 8 with ordinal support, 8 with currency support.

Language codes follow [IETF BCP 47](https://tools.ietf.org/html/bcp47) standards.

## All Languages

|Code|Export|Language|Cardinal|Ordinal|Currency|
|----|------|--------|:------:|:-----:|:------:|
|`am-ET`|`amET`|Amharic (Ethiopia)|✓|||
|`am-Latn-ET`|`amLatnET`|Amharic (Latin, Ethiopia)|✓|||
|`ar-SA`|`arSA`|Arabic (Saudi Arabia)|✓¹|||
|`az-AZ`|`azAZ`|Azerbaijani (Azerbaijan)|✓|||
|`bn-BD`|`bnBD`|Bangla (Bangladesh)|✓|||
|`cs-CZ`|`csCZ`|Czech (Czechia)|✓|||
|`da-DK`|`daDK`|Danish (Denmark)|✓|||
|`de-DE`|`deDE`|German (Germany)|✓|✓|✓¹|
|`el-GR`|`elGR`|Greek (Greece)|✓|||
|`en-GB`|`enGB`|British English|✓|✓|✓¹|
|`en-US`|`enUS`|American English|✓¹|✓|✓¹|
|`es-ES`|`esES`|European Spanish|✓¹|✓¹|✓¹|
|`es-MX`|`esMX`|Mexican Spanish|✓¹|✓¹|✓¹|
|`es-US`|`esUS`|Spanish (United States)|✓¹|✓¹|✓¹|
|`fa-IR`|`faIR`|Persian (Iran)|✓|||
|`fi-FI`|`fiFI`|Finnish (Finland)|✓|||
|`fil-PH`|`filPH`|Filipino (Philippines)|✓|||
|`fr-BE`|`frBE`|French (Belgium)|✓¹|||
|`fr-FR`|`frFR`|French (France)|✓¹|||
|`gu-IN`|`guIN`|Gujarati (India)|✓|||
|`ha-NG`|`haNG`|Hausa (Nigeria)|✓|||
|`hbo-IL`|`hboIL`|hbo (Israel)|✓¹|||
|`he-IL`|`heIL`|Hebrew (Israel)|✓¹|||
|`hi-IN`|`hiIN`|Hindi (India)|✓|||
|`hr-HR`|`hrHR`|Croatian (Croatia)|✓¹|||
|`hu-HU`|`huHU`|Hungarian (Hungary)|✓|||
|`id-ID`|`idID`|Indonesian (Indonesia)|✓|||
|`it-IT`|`itIT`|Italian (Italy)|✓|✓|✓¹|
|`ja-JP`|`jaJP`|Japanese (Japan)|✓|||
|`ka-GE`|`kaGE`|Georgian (Georgia)|✓|||
|`kn-IN`|`knIN`|Kannada (India)|✓|||
|`ko-KR`|`koKR`|Korean (South Korea)|✓|||
|`lt-LT`|`ltLT`|Lithuanian (Lithuania)|✓¹|||
|`lv-LV`|`lvLV`|Latvian (Latvia)|✓¹|||
|`mr-IN`|`mrIN`|Marathi (India)|✓|||
|`ms-MY`|`msMY`|Malay (Malaysia)|✓|||
|`nb-NO`|`nbNO`|Norwegian Bokmål (Norway)|✓|||
|`nl-NL`|`nlNL`|Dutch (Netherlands)|✓¹|||
|`pa-IN`|`paIN`|Punjabi (India)|✓|||
|`pl-PL`|`plPL`|Polish (Poland)|✓¹|||
|`pt-PT`|`ptPT`|European Portuguese|✓|||
|`ro-RO`|`roRO`|Romanian (Romania)|✓¹|||
|`ru-RU`|`ruRU`|Russian (Russia)|✓¹|✓|✓¹|
|`sr-Cyrl-RS`|`srCyrlRS`|Serbian (Cyrillic, Serbia)|✓¹|||
|`sr-Latn-RS`|`srLatnRS`|Serbian (Latin, Serbia)|✓¹|||
|`sv-SE`|`svSE`|Swedish (Sweden)|✓|||
|`sw-KE`|`swKE`|Swahili (Kenya)|✓|||
|`ta-IN`|`taIN`|Tamil (India)|✓|||
|`te-IN`|`teIN`|Telugu (India)|✓|||
|`th-TH`|`thTH`|Thai (Thailand)|✓|||
|`tr-TR`|`trTR`|Turkish (Türkiye)|✓¹|||
|`uk-UA`|`ukUA`|Ukrainian (Ukraine)|✓¹|||
|`ur-PK`|`urPK`|Urdu (Pakistan)|✓|||
|`vi-VN`|`viVN`|Vietnamese (Vietnam)|✓|||
|`yo-NG`|`yoNG`|Yoruba (Nigeria)|✓|||
|`zh-Hans-CN`|`zhHansCN`|Chinese (Simplified, China)|✓¹|||
|`zh-Hant-TW`|`zhHantTW`|Chinese (Traditional, Taiwan)|✓¹|||

¹ Has options — see [Language Options](#language-options) section.

## Usage

```js
// Import language modules directly
import { toCardinal } from 'n2words/en-US'
import { toCardinal, toOrdinal, toCurrency } from 'n2words/en-US'

toCardinal(42)     // 'forty-two'
toOrdinal(42)      // 'forty-second' (if supported)
toCurrency(42.50)  // 'forty-two dollars and fifty cents' (if supported)
```

### Import Paths

Import paths use BCP 47 language codes: `n2words/en-US`, `n2words/zh-Hans-CN`, `n2words/fr-BE`

## Language Options

25 languages support options via a second parameter. Options are passed as an object:

```js
toCardinal(value, { optionName: value })
toCurrency(value, { optionName: value })
```

### American English (`en-US`)

**Cardinal options:**

- `hundredPairing` (`boolean`, default: `false`) — Use hundred-pairing for 1100-9999 (e.g., "fifteen hundred" instead of "one thousand five hundred")
- `and` (`boolean`, default: `false`) — Use "and" after hundreds and before final small numbers (e.g., "one hundred and one" instead of "one hundred one")

**Currency options:**

- `and` (`boolean`, default: `true`) — Use "and" between dollars and cents (e.g., "one dollar and fifty cents")

### Arabic (Saudi Arabia) (`ar-SA`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender
- `negativeWord` (`string`) — Custom word for negative numbers

### British English (`en-GB`)

**Currency options:**

- `and` (`boolean`, default: `true`) — Use "and" between pounds and pence (e.g., "one pound and fifty pence")

### Chinese (Simplified, China) (`zh-Hans-CN`)

**Cardinal options:**

- `formal` (`boolean`, default: `true`) — Use formal/financial numerals

### Chinese (Traditional, Taiwan) (`zh-Hant-TW`)

**Cardinal options:**

- `formal` (`boolean`, default: `true`) — Use formal/financial numerals

### Croatian (Croatia) (`hr-HR`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

### Dutch (Netherlands) (`nl-NL`)

**Cardinal options:**

- `accentOne` (`boolean`, default: `true`) — Use "één" instead of "een"
- `includeOptionalAnd` (`boolean`, default: `false`) — Include "en" before small numbers
- `noHundredPairing` (`boolean`, default: `false`) — Disable hundred pairing (1104→duizend honderdvier)

### European Spanish (`es-ES`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

**Ordinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

**Currency options:**

- `and` (`boolean`, default: `true`) — Use "con" between euros and cents

### French (Belgium) (`fr-BE`)

**Cardinal options:**

- `withHyphenSeparator` (`boolean`, default: `false`) — Use hyphens between words

### French (France) (`fr-FR`)

**Cardinal options:**

- `withHyphenSeparator` (`boolean`, default: `false`) — Use hyphens between all words

### German (Germany) (`de-DE`)

**Currency options:**

- `and` (`boolean`, default: `true`) — Use "und" between euros and cents

### hbo (Israel) (`hbo-IL`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender
- `andWord` (`string`, default: `'ו'`) — Custom conjunction word

### Hebrew (Israel) (`he-IL`)

**Cardinal options:**

- `andWord` (`string`, default: `'ו'`) — Custom conjunction word

### Italian (Italy) (`it-IT`)

**Currency options:**

- `and` (`boolean`, default: `true`) — Use "e" between euros and centesimi

### Latvian (Latvia) (`lv-LV`)

**Cardinal options:**

- `gender` (`string`, default: `'masculine'`) — Gender for numbers < 1000

### Lithuanian (Lithuania) (`lt-LT`)

**Cardinal options:**

- `gender` (`string`, default: `'masculine'`) — Gender for numbers < 1000

### Mexican Spanish (`es-MX`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

**Ordinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

**Currency options:**

- `and` (`boolean`, default: `true`) — Use "con" between pesos and centavos

### Polish (Poland) (`pl-PL`)

**Cardinal options:**

- `gender` (`string`, default: `'masculine'`) — Gender for numbers < 1000

### Romanian (Romania) (`ro-RO`)

**Cardinal options:**

- `gender` (`string`, default: `'masculine'`) — Gender for numbers

### Russian (Russia) (`ru-RU`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

**Currency options:**

- `and` (`boolean`, default: `true`) — Use "и" between rubles and kopecks

### Serbian (Cyrillic, Serbia) (`sr-Cyrl-RS`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

### Serbian (Latin, Serbia) (`sr-Latn-RS`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

### Spanish (United States) (`es-US`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

**Ordinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

**Currency options:**

- `and` (`boolean`, default: `true`) — Use "con" between dollars and cents

### Turkish (Türkiye) (`tr-TR`)

**Cardinal options:**

- `dropSpaces` (`boolean`, default: `false`) — Remove spaces for compound form

### Ukrainian (Ukraine) (`uk-UA`)

**Cardinal options:**

- `gender` ('masculine' \| 'feminine', default: `'masculine'`) — Grammatical gender

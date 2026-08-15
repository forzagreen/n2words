# Supported Languages

> **Auto-generated** — Do not edit manually. Run `npm run docs:languages` to update.

n2words supports **50 languages** (72 regional/script variants total) with
cardinal number conversion, 72 variants with ordinal support, 72 variants
with currency support.

46 languages have a **bare-tag entry point** that resolves without a region
subtag (e.g. `n2words/de`) — this is the primary, recommended way to import
them. The other 4 require picking a specific variant explicitly, because
their variants genuinely diverge in script or core numbering grammar, not
just vocabulary — see [docs/bare-tag-aliases.md](docs/bare-tag-aliases.md).

Language codes follow [IETF BCP 47](https://tools.ietf.org/html/bcp47) standards.

## Languages

|Entry point|Language|Variants|
|-----------|--------|--------|
|—|Amharic|[`am-ET`](#amharic-ethiopia-am-et), [`am-Latn-ET`](#amharic-latin-ethiopia-am-latn-et)|
|[`ar`](#arabic-saudi-arabia-ar-sa)|Arabic|[`ar-SA`](#arabic-saudi-arabia-ar-sa)|
|[`az`](#azerbaijani-azerbaijan-az-az)|Azerbaijani|[`az-AZ`](#azerbaijani-azerbaijan-az-az)|
|[`bn`](#bangla-bangladesh-bn-bd)|Bangla|[`bn-BD`](#bangla-bangladesh-bn-bd)|
|[`hbo`](#biblical-hebrew-israel-hbo-il)|Biblical Hebrew|[`hbo-IL`](#biblical-hebrew-israel-hbo-il)|
|—|Chinese|[`zh-Hans-CN`](#chinese-simplified-china-zh-hans-cn), [`zh-Hant-TW`](#chinese-traditional-taiwan-zh-hant-tw)|
|[`hr`](#croatian-croatia-hr-hr)|Croatian|[`hr-HR`](#croatian-croatia-hr-hr)|
|[`cs`](#czech-czechia-cs-cz)|Czech|[`cs-CZ`](#czech-czechia-cs-cz)|
|[`da`](#danish-denmark-da-dk)|Danish|[`da-DK`](#danish-denmark-da-dk)|
|[`nl`](#dutch-netherlands-nl-nl)|Dutch|[`nl-NL`](#dutch-netherlands-nl-nl)|
|[`en`](#american-english-en-us)|English|[`en-AU`](#australian-english-en-au), [`en-BD`](#english-bangladesh-en-bd), [`en-CA`](#canadian-english-en-ca), [`en-GB`](#british-english-en-gb), [`en-GH`](#english-ghana-en-gh), [`en-IE`](#english-ireland-en-ie), [`en-IN`](#english-india-en-in), [`en-KE`](#english-kenya-en-ke), [`en-MY`](#english-malaysia-en-my), [`en-NG`](#english-nigeria-en-ng), [`en-NZ`](#english-new-zealand-en-nz), [`en-PH`](#english-philippines-en-ph), [`en-PK`](#english-pakistan-en-pk), [`en-SG`](#english-singapore-en-sg), [`en-US`](#american-english-en-us) (default), [`en-ZA`](#english-south-africa-en-za)|
|[`fil`](#filipino-philippines-fil-ph)|Filipino|[`fil-PH`](#filipino-philippines-fil-ph)|
|[`fi`](#finnish-finland-fi-fi)|Finnish|[`fi-FI`](#finnish-finland-fi-fi)|
|[`fr`](#french-france-fr-fr)|French|[`fr-BE`](#french-belgium-fr-be), [`fr-FR`](#french-france-fr-fr) (default)|
|[`ka`](#georgian-georgia-ka-ge)|Georgian|[`ka-GE`](#georgian-georgia-ka-ge)|
|[`de`](#german-germany-de-de)|German|[`de-DE`](#german-germany-de-de)|
|[`el`](#greek-greece-el-gr)|Greek|[`el-GR`](#greek-greece-el-gr)|
|[`gu`](#gujarati-india-gu-in)|Gujarati|[`gu-IN`](#gujarati-india-gu-in)|
|[`ha`](#hausa-nigeria-ha-ng)|Hausa|[`ha-NG`](#hausa-nigeria-ha-ng)|
|[`he`](#hebrew-israel-he-il)|Hebrew|[`he-IL`](#hebrew-israel-he-il)|
|[`hi`](#hindi-india-hi-in)|Hindi|[`hi-IN`](#hindi-india-hi-in)|
|[`hu`](#hungarian-hungary-hu-hu)|Hungarian|[`hu-HU`](#hungarian-hungary-hu-hu)|
|[`id`](#indonesian-indonesia-id-id)|Indonesian|[`id-ID`](#indonesian-indonesia-id-id)|
|[`it`](#italian-italy-it-it)|Italian|[`it-IT`](#italian-italy-it-it)|
|[`ja`](#japanese-japan-ja-jp)|Japanese|[`ja-JP`](#japanese-japan-ja-jp)|
|[`kn`](#kannada-india-kn-in)|Kannada|[`kn-IN`](#kannada-india-kn-in)|
|[`ko`](#korean-south-korea-ko-kr)|Korean|[`ko-KR`](#korean-south-korea-ko-kr)|
|[`lv`](#latvian-latvia-lv-lv)|Latvian|[`lv-LV`](#latvian-latvia-lv-lv)|
|[`lt`](#lithuanian-lithuania-lt-lt)|Lithuanian|[`lt-LT`](#lithuanian-lithuania-lt-lt)|
|[`ms`](#malay-malaysia-ms-my)|Malay|[`ms-MY`](#malay-malaysia-ms-my)|
|[`mr`](#marathi-india-mr-in)|Marathi|[`mr-IN`](#marathi-india-mr-in)|
|[`nb`](#norwegian-bokmål-norway-nb-no)|Norwegian Bokmål|[`nb-NO`](#norwegian-bokmål-norway-nb-no)|
|[`fa`](#persian-iran-fa-ir)|Persian|[`fa-IR`](#persian-iran-fa-ir)|
|[`pl`](#polish-poland-pl-pl)|Polish|[`pl-PL`](#polish-poland-pl-pl)|
|—|Portuguese|[`pt-BR`](#brazilian-portuguese-pt-br), [`pt-PT`](#european-portuguese-pt-pt)|
|[`pa`](#punjabi-india-pa-in)|Punjabi|[`pa-IN`](#punjabi-india-pa-in)|
|[`ro`](#romanian-romania-ro-ro)|Romanian|[`ro-RO`](#romanian-romania-ro-ro)|
|[`ru`](#russian-russia-ru-ru)|Russian|[`ru-RU`](#russian-russia-ru-ru)|
|—|Serbian|[`sr-Cyrl-RS`](#serbian-cyrillic-serbia-sr-cyrl-rs), [`sr-Latn-RS`](#serbian-latin-serbia-sr-latn-rs)|
|[`es`](#european-spanish-es-es)|Spanish|[`es-ES`](#european-spanish-es-es) (default), [`es-MX`](#mexican-spanish-es-mx), [`es-US`](#spanish-united-states-es-us)|
|[`sw`](#swahili-kenya-sw-ke)|Swahili|[`sw-KE`](#swahili-kenya-sw-ke)|
|[`sv`](#swedish-sweden-sv-se)|Swedish|[`sv-SE`](#swedish-sweden-sv-se)|
|[`ta`](#tamil-india-ta-in)|Tamil|[`ta-IN`](#tamil-india-ta-in)|
|[`te`](#telugu-india-te-in)|Telugu|[`te-IN`](#telugu-india-te-in)|
|[`th`](#thai-thailand-th-th)|Thai|[`th-TH`](#thai-thailand-th-th)|
|[`tr`](#turkish-türkiye-tr-tr)|Turkish|[`tr-TR`](#turkish-türkiye-tr-tr)|
|[`uk`](#ukrainian-ukraine-uk-ua)|Ukrainian|[`uk-UA`](#ukrainian-ukraine-uk-ua)|
|[`ur`](#urdu-pakistan-ur-pk)|Urdu|[`ur-PK`](#urdu-pakistan-ur-pk)|
|[`vi`](#vietnamese-vietnam-vi-vn)|Vietnamese|[`vi-VN`](#vietnamese-vietnam-vi-vn)|
|[`yo`](#yoruba-nigeria-yo-ng)|Yoruba|[`yo-NG`](#yoruba-nigeria-yo-ng)|

`Entry point` is `—` for the 4 languages with no safe default variant.
Where a family has more than one variant, `(default)` marks the one its
entry point resolves to.

## Usage

```js
// Most languages: import via their bare-tag entry point
import { toCardinal } from 'n2words/de'
import { toCardinal, toOrdinal, toCurrency } from 'n2words/de'

toCardinal(42)     // 'zweiundvierzig'
toOrdinal(42)      // 'zweiundvierzigste' (if supported)
toCurrency(42.50)  // 'zweiundvierzig Euro und fünfzig Cent' (if supported)

// Need a specific regional/script variant, or one of the 4 languages with
// no single default? Import the full BCP 47 code instead
import { toCardinal } from 'n2words/en-GB'
```

### Import Paths

Bare-tag entry points (`n2words/de`, `n2words/en`, ...) resolve without a region
subtag for every language with a linked `Entry point` above. Full BCP 47 codes
always work too (`n2words/en-GB`, `n2words/fr-BE`, ...), and are required for
the 4 languages with no entry point (`—` above) — e.g. `n2words/pt-BR`,
`n2words/zh-Hans-CN`.

## All Regional Variants

Per-variant detail — the largest value each form converts, and per-variant
options where declared. Grouped by language above; this is the flat
reference.

|Code|Language|Cardinal|Ordinal|Currency|
|----|--------|:------:|:-----:|:------:|
|`am-ET`|Amharic (Ethiopia)|10^12 - 1|10^12 - 1|10^12 - 1 [*](#amharic-ethiopia-am-et)|
|`am-Latn-ET`|Amharic (Latin, Ethiopia)|10^12 - 1|10^12 - 1|10^12 - 1 [*](#amharic-latin-ethiopia-am-latn-et)|
|`ar-SA`|Arabic (Saudi Arabia)|10^24 - 1 [*](#arabic-saudi-arabia-ar-sa)|10^24 - 1 [*](#arabic-saudi-arabia-ar-sa)|10^24 - 1 [*](#arabic-saudi-arabia-ar-sa)|
|`az-AZ`|Azerbaijani (Azerbaijan)|10^21 - 1|10^21 - 1|10^21 - 1 [*](#azerbaijani-azerbaijan-az-az)|
|`bn-BD`|Bangla (Bangladesh)|10^19 - 1|10^19 - 1|10^19 - 1 [*](#bangla-bangladesh-bn-bd)|
|`cs-CZ`|Czech (Czechia)|10^30 - 1|10^30 - 1|10^30 - 1 [*](#czech-czechia-cs-cz)|
|`da-DK`|Danish (Denmark)|10^30 - 1|10^30 - 1|10^30 - 1 [*](#danish-denmark-da-dk)|
|`de-DE`|German (Germany)|10^30 - 1|10^30 - 1|10^30 - 1 [*](#german-germany-de-de)|
|`el-GR`|Greek (Greece)|10^15 - 1|10^9 - 1|10^15 - 1 [*](#greek-greece-el-gr)|
|`en-AU`|Australian English|10^66 - 1|10^66 - 1|10^66 - 1 [*](#australian-english-en-au)|
|`en-BD`|English (Bangladesh)|10^19 - 1|10^19 - 1|10^19 - 1 [*](#english-bangladesh-en-bd)|
|`en-CA`|Canadian English|10^66 - 1 [*](#canadian-english-en-ca)|10^66 - 1|10^66 - 1 [*](#canadian-english-en-ca)|
|`en-GB`|British English|10^66 - 1|10^66 - 1|10^66 - 1 [*](#british-english-en-gb)|
|`en-GH`|English (Ghana)|10^66 - 1|10^66 - 1|10^66 - 1 [*](#english-ghana-en-gh)|
|`en-IE`|English (Ireland)|10^66 - 1|10^66 - 1|10^66 - 1 [*](#english-ireland-en-ie)|
|`en-IN`|English (India)|10^19 - 1|10^19 - 1|10^19 - 1 [*](#english-india-en-in)|
|`en-KE`|English (Kenya)|10^66 - 1|10^66 - 1|10^66 - 1 [*](#english-kenya-en-ke)|
|`en-MY`|English (Malaysia)|10^66 - 1|10^66 - 1|10^66 - 1 [*](#english-malaysia-en-my)|
|`en-NG`|English (Nigeria)|10^66 - 1|10^66 - 1|10^66 - 1 [*](#english-nigeria-en-ng)|
|`en-NZ`|English (New Zealand)|10^66 - 1|10^66 - 1|10^66 - 1 [*](#english-new-zealand-en-nz)|
|`en-PH`|English (Philippines)|10^66 - 1|10^66 - 1|10^66 - 1 [*](#english-philippines-en-ph)|
|`en-PK`|English (Pakistan)|10^19 - 1|10^19 - 1|10^19 - 1 [*](#english-pakistan-en-pk)|
|`en-SG`|English (Singapore)|10^66 - 1|10^66 - 1|10^66 - 1 [*](#english-singapore-en-sg)|
|`en-US`|American English|10^66 - 1 [*](#american-english-en-us)|10^66 - 1|10^66 - 1 [*](#american-english-en-us)|
|`en-ZA`|English (South Africa)|10^66 - 1|10^66 - 1|10^66 - 1 [*](#english-south-africa-en-za)|
|`es-ES`|European Spanish|10^30 - 1 [*](#european-spanish-es-es)|10^9 - 1 [*](#european-spanish-es-es)|10^30 - 1 [*](#european-spanish-es-es)|
|`es-MX`|Mexican Spanish|10^30 - 1 [*](#mexican-spanish-es-mx)|10^9 - 1 [*](#mexican-spanish-es-mx)|10^30 - 1 [*](#mexican-spanish-es-mx)|
|`es-US`|Spanish (United States)|10^21 - 1 [*](#spanish-united-states-es-us)|10^9 - 1 [*](#spanish-united-states-es-us)|10^21 - 1 [*](#spanish-united-states-es-us)|
|`fa-IR`|Persian (Iran)|∞|∞|∞ [*](#persian-iran-fa-ir)|
|`fi-FI`|Finnish (Finland)|10^18 - 1|10^18 - 1|10^18 - 1 [*](#finnish-finland-fi-fi)|
|`fil-PH`|Filipino (Philippines)|10^15 - 1|10^15 - 1|10^15 - 1 [*](#filipino-philippines-fil-ph)|
|`fr-BE`|French (Belgium)|10^30 - 1 [*](#french-belgium-fr-be)|10^30 - 1|10^30 - 1 [*](#french-belgium-fr-be)|
|`fr-FR`|French (France)|10^30 - 1 [*](#french-france-fr-fr)|10^30 - 1|10^30 - 1 [*](#french-france-fr-fr)|
|`gu-IN`|Gujarati (India)|10^19 - 1|10^19 - 1|10^19 - 1 [*](#gujarati-india-gu-in)|
|`ha-NG`|Hausa (Nigeria)|10^12 - 1|10^12 - 1|10^12 - 1 [*](#hausa-nigeria-ha-ng)|
|`hbo-IL`|Biblical Hebrew (Israel)|10^21 - 1 [*](#biblical-hebrew-israel-hbo-il)|10^9 - 1|10^21 - 1 [*](#biblical-hebrew-israel-hbo-il)|
|`he-IL`|Hebrew (Israel)|10^21 - 1 [*](#hebrew-israel-he-il)|10^9 - 1|10^21 - 1 [*](#hebrew-israel-he-il)|
|`hi-IN`|Hindi (India)|10^19 - 1|10^19 - 1|10^19 - 1 [*](#hindi-india-hi-in)|
|`hr-HR`|Croatian (Croatia)|10^30 - 1 [*](#croatian-croatia-hr-hr)|10^15 - 1|10^30 - 1 [*](#croatian-croatia-hr-hr)|
|`hu-HU`|Hungarian (Hungary)|∞|∞|∞ [*](#hungarian-hungary-hu-hu)|
|`id-ID`|Indonesian (Indonesia)|10^36 - 1|10^36 - 1|10^36 - 1 [*](#indonesian-indonesia-id-id)|
|`it-IT`|Italian (Italy)|10^66 - 1|10^66 - 1|10^66 - 1 [*](#italian-italy-it-it)|
|`ja-JP`|Japanese (Japan)|10^72 - 1|10^72 - 1|10^72 - 1 [*](#japanese-japan-ja-jp)|
|`ka-GE`|Georgian (Georgia)|10^24 - 1|10^24 - 1|10^24 - 1 [*](#georgian-georgia-ka-ge)|
|`kn-IN`|Kannada (India)|10^19 - 1|10^19 - 1|10^19 - 1 [*](#kannada-india-kn-in)|
|`ko-KR`|Korean (South Korea)|10^32 - 1|10^32 - 1|10^32 - 1 [*](#korean-south-korea-ko-kr)|
|`lt-LT`|Lithuanian (Lithuania)|10^30 - 1 [*](#lithuanian-lithuania-lt-lt)|10^15 - 1|10^30 - 1 [*](#lithuanian-lithuania-lt-lt)|
|`lv-LV`|Latvian (Latvia)|10^30 - 1 [*](#latvian-latvia-lv-lv)|10^15 - 1|10^30 - 1 [*](#latvian-latvia-lv-lv)|
|`mr-IN`|Marathi (India)|10^19 - 1|10^19 - 1|10^19 - 1 [*](#marathi-india-mr-in)|
|`ms-MY`|Malay (Malaysia)|10^15 - 1|10^15 - 1|10^15 - 1 [*](#malay-malaysia-ms-my)|
|`nb-NO`|Norwegian Bokmål (Norway)|10^30 - 1|10^30 - 1|10^30 - 1 [*](#norwegian-bokmål-norway-nb-no)|
|`nl-NL`|Dutch (Netherlands)|10^30 - 1 [*](#dutch-netherlands-nl-nl)|10^21 - 1|10^30 - 1 [*](#dutch-netherlands-nl-nl)|
|`pa-IN`|Punjabi (India)|10^19 - 1|10^19 - 1|10^19 - 1 [*](#punjabi-india-pa-in)|
|`pl-PL`|Polish (Poland)|10^33 - 1 [*](#polish-poland-pl-pl)|10^24 - 1|10^33 - 1 [*](#polish-poland-pl-pl)|
|`pt-BR`|Brazilian Portuguese|10^27 - 1|10^24 - 1|10^27 - 1 [*](#brazilian-portuguese-pt-br)|
|`pt-PT`|European Portuguese|10^27 - 1|10^21 - 1|10^27 - 1 [*](#european-portuguese-pt-pt)|
|`ro-RO`|Romanian (Romania)|10^30 - 1 [*](#romanian-romania-ro-ro)|10^9 - 1|10^30 - 1 [*](#romanian-romania-ro-ro)|
|`ru-RU`|Russian (Russia)|10^33 - 1 [*](#russian-russia-ru-ru)|10^33 - 1|10^33 - 1 [*](#russian-russia-ru-ru)|
|`sr-Cyrl-RS`|Serbian (Cyrillic, Serbia)|10^30 - 1 [*](#serbian-cyrillic-serbia-sr-cyrl-rs)|10^30 - 1|10^30 - 1 [*](#serbian-cyrillic-serbia-sr-cyrl-rs)|
|`sr-Latn-RS`|Serbian (Latin, Serbia)|10^30 - 1 [*](#serbian-latin-serbia-sr-latn-rs)|10^30 - 1|10^30 - 1 [*](#serbian-latin-serbia-sr-latn-rs)|
|`sv-SE`|Swedish (Sweden)|10^27 - 1|10^27 - 1|10^27 - 1 [*](#swedish-sweden-sv-se)|
|`sw-KE`|Swahili (Kenya)|10^21 - 1|10^21 - 1|10^21 - 1 [*](#swahili-kenya-sw-ke)|
|`ta-IN`|Tamil (India)|10^19 - 1|10^19 - 1|10^19 - 1 [*](#tamil-india-ta-in)|
|`te-IN`|Telugu (India)|10^19 - 1|10^19 - 1|10^19 - 1 [*](#telugu-india-te-in)|
|`th-TH`|Thai (Thailand)|∞|∞|∞ [*](#thai-thailand-th-th)|
|`tr-TR`|Turkish (Türkiye)|10^21 - 1 [*](#turkish-türkiye-tr-tr)|10^21 - 1|10^21 - 1 [*](#turkish-türkiye-tr-tr)|
|`uk-UA`|Ukrainian (Ukraine)|10^30 - 1 [*](#ukrainian-ukraine-uk-ua)|10^15 - 1|10^30 - 1 [*](#ukrainian-ukraine-uk-ua)|
|`ur-PK`|Urdu (Pakistan)|10^19 - 1|10^19 - 1|10^19 - 1 [*](#urdu-pakistan-ur-pk)|
|`vi-VN`|Vietnamese (Vietnam)|10^21 - 1|10^21 - 1|10^21 - 1 [*](#vietnamese-vietnam-vi-vn)|
|`yo-NG`|Yoruba (Nigeria)|∞|∞|∞ [*](#yoruba-nigeria-yo-ng)|
|`zh-Hans-CN`|Chinese (Simplified, China)|10^16 - 1 [*](#chinese-simplified-china-zh-hans-cn)|10^16 - 1 [*](#chinese-simplified-china-zh-hans-cn)|10^16 - 1 [*](#chinese-simplified-china-zh-hans-cn)|
|`zh-Hant-TW`|Chinese (Traditional, Taiwan)|10^16 - 1 [*](#chinese-traditional-taiwan-zh-hant-tw)|10^16 - 1 [*](#chinese-traditional-taiwan-zh-hant-tw)|10^16 - 1 [*](#chinese-traditional-taiwan-zh-hant-tw)|

Each form column shows the largest value it converts (`10^N - 1`), `∞` when unbounded, or blank when the form isn't supported.

\* Has options — click to jump to that language's options.

## Currency Coverage

Which languages can name which currency. 72 variants name 42 distinct
ISO 4217 currencies, across 76 language/currency pairs.

A language always names its own default currency; anything in the third column
is opt-in via the `currency` option:

```js
import { toCurrency } from 'n2words/pt-BR'

toCurrency(42.50)                       // 'quarenta e dois reais e cinquenta centavos' (BRL, the default)
toCurrency(42, { currency: 'JPY' })     // 'quarenta e dois ienes'
toCurrency(42.50, { currency: 'JPY' })  // RangeError — the yen has no minor unit
```

Passing a currency a language has no words for throws `RangeError` rather than
guessing — each language's accepted set is its `currencyValues.currency` export,
also listed per language under [Language Options](#language-options).

|Currency|Default for|Also names it|
|--------|-----------|-------------|
|`EUR`|`de-DE`, `el-GR`, `en-IE`, `es-ES`, `fi-FI`, `fr-BE`, `fr-FR`, `hr-HR`, `it-IT`, `lt-LT`, `lv-LV`, `nl-NL`, `pt-PT`|`pt-BR`|
|`INR`|`en-IN`, `gu-IN`, `hi-IN`, `kn-IN`, `mr-IN`, `pa-IN`, `ta-IN`, `te-IN`|—|
|`NGN`|`en-NG`, `ha-NG`, `yo-NG`|—|
|`USD`|`en-US`, `es-US`|`pt-BR`|
|`BDT`|`bn-BD`, `en-BD`|—|
|`ETB`|`am-ET`, `am-Latn-ET`|—|
|`GBP`|`en-GB`|`pt-BR`|
|`ILS`|`hbo-IL`, `he-IL`|—|
|`JPY`|`ja-JP`|`pt-BR`|
|`KES`|`en-KE`, `sw-KE`|—|
|`MYR`|`en-MY`, `ms-MY`|—|
|`PHP`|`en-PH`, `fil-PH`|—|
|`PKR`|`en-PK`, `ur-PK`|—|
|`RSD`|`sr-Cyrl-RS`, `sr-Latn-RS`|—|
|`AUD`|`en-AU`|—|
|`AZN`|`az-AZ`|—|
|`BRL`|`pt-BR`|—|
|`CAD`|`en-CA`|—|
|`CNY`|`zh-Hans-CN`|—|
|`CZK`|`cs-CZ`|—|
|`DKK`|`da-DK`|—|
|`GEL`|`ka-GE`|—|
|`GHS`|`en-GH`|—|
|`HUF`|`hu-HU`|—|
|`IDR`|`id-ID`|—|
|`IRR`|`fa-IR`|—|
|`KRW`|`ko-KR`|—|
|`MXN`|`es-MX`|—|
|`NOK`|`nb-NO`|—|
|`NZD`|`en-NZ`|—|
|`PLN`|`pl-PL`|—|
|`RON`|`ro-RO`|—|
|`RUB`|`ru-RU`|—|
|`SAR`|`ar-SA`|—|
|`SEK`|`sv-SE`|—|
|`SGD`|`en-SG`|—|
|`THB`|`th-TH`|—|
|`TRY`|`tr-TR`|—|
|`TWD`|`zh-Hant-TW`|—|
|`UAH`|`uk-UA`|—|
|`VND`|`vi-VN`|—|
|`ZAR`|`en-ZA`|—|

To teach a language a new currency, add its word forms to that language's export
in [`src/utils/currency-vocab.js`](src/utils/currency-vocab.js) — see
[docs/currency-vocab.md](docs/currency-vocab.md) for the word-form conventions
(the arrays are per-language plural forms, not a fixed singular/plural pair).

## Language Options

72 variants support options via a second parameter. Options are passed as an object:

```js
toCardinal(value, { optionName: value })
toCurrency(value, { optionName: value })
```

### American English (`en-US`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`hundredPairing`|cardinal|`boolean`|`false`|Use hundred-pairing for 1100-9999 (e.g., "fifteen hundred" instead of "one thousand five hundred")|
|`and`|cardinal|`boolean`|`false`|Use "and" after hundreds and before final small numbers (e.g., "one hundred and one" instead of "one hundred one")|
|`and`|currency|`boolean`|`true`|Use "and" between dollars and cents (e.g., "one dollar and fifty cents")|
|`currency`|currency|`'USD'`|`USD`|ISO 4217 currency code to name the amount in|

### Amharic (Ethiopia) (`am-ET`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'ETB'`|`ETB`|ISO 4217 currency code to name the amount in|

### Amharic (Latin, Ethiopia) (`am-Latn-ET`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'ETB'`|`ETB`|ISO 4217 currency code to name the amount in|

### Arabic (Saudi Arabia) (`ar-SA`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`gender`|cardinal|'feminine' \| 'masculine'|`masculine`|Grammatical gender|
|`negativeWord`|cardinal|`string`|`ناقص`|Custom word for negative numbers|
|`gender`|ordinal|'feminine' \| 'masculine'|`masculine`|Grammatical gender|
|`currency`|currency|`'SAR'`|`SAR`|ISO 4217 currency code to name the amount in|

### Australian English (`en-AU`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "and" between dollars and cents|
|`currency`|currency|`'AUD'`|`AUD`|ISO 4217 currency code to name the amount in|

### Azerbaijani (Azerbaijan) (`az-AZ`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'AZN'`|`AZN`|ISO 4217 currency code to name the amount in|

### Bangla (Bangladesh) (`bn-BD`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'BDT'`|`BDT`|ISO 4217 currency code to name the amount in|

### Biblical Hebrew (Israel) (`hbo-IL`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`gender`|cardinal|'feminine' \| 'masculine'|`masculine`|Grammatical gender|
|`andWord`|cardinal|`string`|`ו`|Custom conjunction word|
|`currency`|currency|`'ILS'`|`ILS`|ISO 4217 currency code to name the amount in|

### Brazilian Portuguese (`pt-BR`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Include "e" between major and minor units|
|`currency`|currency|'BRL' \| 'EUR' \| 'GBP' \| 'JPY' \| 'USD'|`BRL`|ISO 4217 currency code to name the amount in|

### British English (`en-GB`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "and" between pounds and pence (e.g., "one pound and fifty pence")|
|`currency`|currency|`'GBP'`|`GBP`|ISO 4217 currency code to name the amount in|

### Canadian English (`en-CA`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`hundredPairing`|cardinal|`boolean`|`false`|Use hundred-pairing for 1100-9999 (e.g., "fifteen hundred" instead of "one thousand five hundred")|
|`and`|cardinal|`boolean`|`true`|Use "and" after hundreds and before final small numbers (default: true, Canadian/British style)|
|`and`|currency|`boolean`|`true`|Use "and" between dollars and cents (e.g., "one dollar and fifty cents")|
|`currency`|currency|`'CAD'`|`CAD`|ISO 4217 currency code to name the amount in|

### Chinese (Simplified, China) (`zh-Hans-CN`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`formal`|cardinal|`boolean`|`true`|Use formal/financial numerals|
|`formal`|ordinal|`boolean`|`true`|Use formal/financial numerals|
|`formal`|currency|`boolean`|`true`|Use formal/financial numerals|
|`currency`|currency|`'CNY'`|`CNY`|ISO 4217 currency code to name the amount in|

### Chinese (Traditional, Taiwan) (`zh-Hant-TW`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`formal`|cardinal|`boolean`|`true`|Use formal/financial numerals|
|`formal`|ordinal|`boolean`|`true`|Use formal/financial numerals|
|`formal`|currency|`boolean`|`true`|Use formal/financial numerals|
|`currency`|currency|`'TWD'`|`TWD`|ISO 4217 currency code to name the amount in|

### Croatian (Croatia) (`hr-HR`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`gender`|cardinal|'feminine' \| 'masculine'|`masculine`|Grammatical gender|
|`currency`|currency|`'EUR'`|`EUR`|ISO 4217 currency code to name the amount in|

### Czech (Czechia) (`cs-CZ`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'CZK'`|`CZK`|ISO 4217 currency code to name the amount in|

### Danish (Denmark) (`da-DK`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'DKK'`|`DKK`|ISO 4217 currency code to name the amount in|

### Dutch (Netherlands) (`nl-NL`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`accentOne`|cardinal|`boolean`|`true`|Use "één" instead of "een"|
|`includeOptionalAnd`|cardinal|`boolean`|`false`|Include "en" before small numbers|
|`noHundredPairing`|cardinal|`boolean`|`false`|Disable hundred pairing (1104→duizend honderdvier)|
|`and`|currency|`boolean`|`true`|Include "en" between euros and cents|
|`currency`|currency|`'EUR'`|`EUR`|ISO 4217 currency code to name the amount in|

### English (Bangladesh) (`en-BD`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "and" between taka and paise|
|`currency`|currency|`'BDT'`|`BDT`|ISO 4217 currency code to name the amount in|

### English (Ghana) (`en-GH`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "and" between cedis and pesewas|
|`currency`|currency|`'GHS'`|`GHS`|ISO 4217 currency code to name the amount in|

### English (India) (`en-IN`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "and" between rupees and paise|
|`currency`|currency|`'INR'`|`INR`|ISO 4217 currency code to name the amount in|

### English (Ireland) (`en-IE`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "and" between euro and cent (e.g., "one euro and fifty cents")|
|`currency`|currency|`'EUR'`|`EUR`|ISO 4217 currency code to name the amount in|

### English (Kenya) (`en-KE`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "and" between shillings and cents|
|`currency`|currency|`'KES'`|`KES`|ISO 4217 currency code to name the amount in|

### English (Malaysia) (`en-MY`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "and" between ringgit and sen|
|`currency`|currency|`'MYR'`|`MYR`|ISO 4217 currency code to name the amount in|

### English (New Zealand) (`en-NZ`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "and" between dollars and cents|
|`currency`|currency|`'NZD'`|`NZD`|ISO 4217 currency code to name the amount in|

### English (Nigeria) (`en-NG`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "and" between naira and kobo (e.g., "one naira and fifty kobo")|
|`currency`|currency|`'NGN'`|`NGN`|ISO 4217 currency code to name the amount in|

### English (Pakistan) (`en-PK`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "and" between rupees and paise|
|`currency`|currency|`'PKR'`|`PKR`|ISO 4217 currency code to name the amount in|

### English (Philippines) (`en-PH`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "and" between pesos and centavos|
|`currency`|currency|`'PHP'`|`PHP`|ISO 4217 currency code to name the amount in|

### English (Singapore) (`en-SG`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "and" between dollars and cents|
|`currency`|currency|`'SGD'`|`SGD`|ISO 4217 currency code to name the amount in|

### English (South Africa) (`en-ZA`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "and" between rand and cents (e.g., "one rand and fifty cents")|
|`currency`|currency|`'ZAR'`|`ZAR`|ISO 4217 currency code to name the amount in|

### European Portuguese (`pt-PT`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Include "e" between euros and cents|
|`currency`|currency|`'EUR'`|`EUR`|ISO 4217 currency code to name the amount in|

### European Spanish (`es-ES`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`gender`|cardinal|'feminine' \| 'masculine'|`masculine`|Grammatical gender|
|`gender`|ordinal|'feminine' \| 'masculine'|`masculine`|Grammatical gender|
|`and`|currency|`boolean`|`true`|Use "con" between euros and cents|
|`currency`|currency|`'EUR'`|`EUR`|ISO 4217 currency code to name the amount in|

### Filipino (Philippines) (`fil-PH`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'PHP'`|`PHP`|ISO 4217 currency code to name the amount in|

### Finnish (Finland) (`fi-FI`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'EUR'`|`EUR`|ISO 4217 currency code to name the amount in|

### French (Belgium) (`fr-BE`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`withHyphenSeparator`|cardinal|`boolean`|`false`|Use hyphens between words|
|`and`|currency|`boolean`|`true`|Use "et" between euros and centimes|
|`currency`|currency|`'EUR'`|`EUR`|ISO 4217 currency code to name the amount in|

### French (France) (`fr-FR`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`withHyphenSeparator`|cardinal|`boolean`|`false`|Use hyphens between all words|
|`and`|currency|`boolean`|`true`|Use "et" between euros and centimes|
|`currency`|currency|`'EUR'`|`EUR`|ISO 4217 currency code to name the amount in|

### Georgian (Georgia) (`ka-GE`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'GEL'`|`GEL`|ISO 4217 currency code to name the amount in|

### German (Germany) (`de-DE`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "und" between euros and cents|
|`currency`|currency|`'EUR'`|`EUR`|ISO 4217 currency code to name the amount in|

### Greek (Greece) (`el-GR`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'EUR'`|`EUR`|ISO 4217 currency code to name the amount in|

### Gujarati (India) (`gu-IN`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'INR'`|`INR`|ISO 4217 currency code to name the amount in|

### Hausa (Nigeria) (`ha-NG`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'NGN'`|`NGN`|ISO 4217 currency code to name the amount in|

### Hebrew (Israel) (`he-IL`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`andWord`|cardinal|`string`|`ו`|Custom conjunction word|
|`currency`|currency|`'ILS'`|`ILS`|ISO 4217 currency code to name the amount in|

### Hindi (India) (`hi-IN`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'INR'`|`INR`|ISO 4217 currency code to name the amount in|

### Hungarian (Hungary) (`hu-HU`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'HUF'`|`HUF`|ISO 4217 currency code to name the amount in|

### Indonesian (Indonesia) (`id-ID`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'IDR'`|`IDR`|ISO 4217 currency code to name the amount in|

### Italian (Italy) (`it-IT`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`and`|currency|`boolean`|`true`|Use "e" between euros and centesimi|
|`currency`|currency|`'EUR'`|`EUR`|ISO 4217 currency code to name the amount in|

### Japanese (Japan) (`ja-JP`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'JPY'`|`JPY`|ISO 4217 currency code to name the amount in|

### Kannada (India) (`kn-IN`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'INR'`|`INR`|ISO 4217 currency code to name the amount in|

### Korean (South Korea) (`ko-KR`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'KRW'`|`KRW`|ISO 4217 currency code to name the amount in|

### Latvian (Latvia) (`lv-LV`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`gender`|cardinal|'feminine' \| 'masculine'|`masculine`|Gender for numbers < 1000|
|`currency`|currency|`'EUR'`|`EUR`|ISO 4217 currency code to name the amount in|

### Lithuanian (Lithuania) (`lt-LT`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`gender`|cardinal|'feminine' \| 'masculine'|`masculine`|Gender for numbers < 1000|
|`currency`|currency|`'EUR'`|`EUR`|ISO 4217 currency code to name the amount in|

### Malay (Malaysia) (`ms-MY`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'MYR'`|`MYR`|ISO 4217 currency code to name the amount in|

### Marathi (India) (`mr-IN`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'INR'`|`INR`|ISO 4217 currency code to name the amount in|

### Mexican Spanish (`es-MX`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`gender`|cardinal|'feminine' \| 'masculine'|`masculine`|Grammatical gender|
|`gender`|ordinal|'feminine' \| 'masculine'|`masculine`|Grammatical gender|
|`and`|currency|`boolean`|`true`|Use "con" between pesos and centavos|
|`currency`|currency|`'MXN'`|`MXN`|ISO 4217 currency code to name the amount in|

### Norwegian Bokmål (Norway) (`nb-NO`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'NOK'`|`NOK`|ISO 4217 currency code to name the amount in|

### Persian (Iran) (`fa-IR`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'IRR'`|`IRR`|ISO 4217 currency code to name the amount in|

### Polish (Poland) (`pl-PL`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`gender`|cardinal|'feminine' \| 'masculine'|`masculine`|Gender for numbers < 1000|
|`currency`|currency|`'PLN'`|`PLN`|ISO 4217 currency code to name the amount in|

### Punjabi (India) (`pa-IN`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'INR'`|`INR`|ISO 4217 currency code to name the amount in|

### Romanian (Romania) (`ro-RO`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`gender`|cardinal|'feminine' \| 'masculine'|`masculine`|Gender for numbers|
|`currency`|currency|`'RON'`|`RON`|ISO 4217 currency code to name the amount in|

### Russian (Russia) (`ru-RU`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`gender`|cardinal|'feminine' \| 'masculine'|`masculine`|Grammatical gender|
|`and`|currency|`boolean`|`true`|Use "и" between rubles and kopecks|
|`currency`|currency|`'RUB'`|`RUB`|ISO 4217 currency code to name the amount in|

### Serbian (Cyrillic, Serbia) (`sr-Cyrl-RS`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`gender`|cardinal|'feminine' \| 'masculine'|`masculine`|Grammatical gender|
|`and`|currency|`boolean`|`true`|Use "и" between dinars and para|
|`currency`|currency|`'RSD'`|`RSD`|ISO 4217 currency code to name the amount in|

### Serbian (Latin, Serbia) (`sr-Latn-RS`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`gender`|cardinal|'feminine' \| 'masculine'|`masculine`|Grammatical gender|
|`and`|currency|`boolean`|`true`|Use "i" between dinars and para|
|`currency`|currency|`'RSD'`|`RSD`|ISO 4217 currency code to name the amount in|

### Spanish (United States) (`es-US`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`gender`|cardinal|'feminine' \| 'masculine'|`masculine`|Grammatical gender|
|`gender`|ordinal|'feminine' \| 'masculine'|`masculine`|Grammatical gender|
|`and`|currency|`boolean`|`true`|Use "con" between dollars and cents|
|`currency`|currency|`'USD'`|`USD`|ISO 4217 currency code to name the amount in|

### Swahili (Kenya) (`sw-KE`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'KES'`|`KES`|ISO 4217 currency code to name the amount in|

### Swedish (Sweden) (`sv-SE`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'SEK'`|`SEK`|ISO 4217 currency code to name the amount in|

### Tamil (India) (`ta-IN`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'INR'`|`INR`|ISO 4217 currency code to name the amount in|

### Telugu (India) (`te-IN`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'INR'`|`INR`|ISO 4217 currency code to name the amount in|

### Thai (Thailand) (`th-TH`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'THB'`|`THB`|ISO 4217 currency code to name the amount in|

### Turkish (Türkiye) (`tr-TR`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`dropSpaces`|cardinal|`boolean`|`false`|Remove spaces for compound form|
|`currency`|currency|`'TRY'`|`TRY`|ISO 4217 currency code to name the amount in|

### Ukrainian (Ukraine) (`uk-UA`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`gender`|cardinal|'feminine' \| 'masculine'|`masculine`|Grammatical gender|
|`currency`|currency|`'UAH'`|`UAH`|ISO 4217 currency code to name the amount in|

### Urdu (Pakistan) (`ur-PK`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'PKR'`|`PKR`|ISO 4217 currency code to name the amount in|

### Vietnamese (Vietnam) (`vi-VN`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'VND'`|`VND`|ISO 4217 currency code to name the amount in|

### Yoruba (Nigeria) (`yo-NG`)

|Option|Form|Type|Default|Description|
|------|----|----|-------|-----------|
|`currency`|currency|`'NGN'`|`NGN`|ISO 4217 currency code to name the amount in|

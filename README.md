# num2words
js module to convert numbers to words

## Usage

```js
var num2words = require('.')

num2words(123)                 // 'one hundred and twenty-three'

num2words(123, {lang: 'en'})   // 'one hundred and twenty-three'
num2words(123, {lang: 'fr'})   // 'cent vingt-trois'
num2words(123, {lang: 'es'})   // 'ciento veintitrés'

```

Currently supported languages are:
- `en` (English, default)
- `es` (Spanish)
- `fr` (French)


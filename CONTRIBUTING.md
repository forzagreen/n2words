## Contributing to n2words

This repository converts numbers into words for many languages. If you'd like to
add a new language or improve an existing one, follow these guidelines to keep
the codebase consistent and ensure both Node.js and browser builds work.

### Language file location & format

- Create a new file under `lib/i18n/` named with the language code and `.js`,
  for example: `lib/i18n/xx.js` or `lib/i18n/fr-CA.js` for a regional variant.
- Files MUST be ESM modules and export a default function with this signature:

```js
// lib/i18n/xx.js
import BaseLanguage from '../classes/base-language.js' // or AbstractLanguage

export default function floatToCardinal (value, options = {}) {
  return new XxLanguage(options).floatToCardinal(value)
}

class XxLanguage extends BaseLanguage {
  constructor (options) {
    super(Object.assign({
      negativeWord: 'minus',
      separatorWord: 'point',
      zero: 'zero'
    }, options), [
      // Provide cards as [BigInt, 'word'] in DESCENDING order
      [1000000n, 'million'],
      [1000n, 'thousand'],
      [100n, 'hundred'],
      [90n, 'ninety'],
      [80n, 'eighty'],
      [1n, 'one']
    ])
  }

  // Implement merge(leftWordSet, rightWordSet) according to language rules.
  merge (left, right) {
    // left and right are objects like { 'one': 1n } and { 'hundred': 100n }
    // Return a merged object, e.g. { 'one hundred': 100n }
  }
}
```

Notes:
- Use `BigInt` literals (e.g. `1000n`) in `cards` so the algorithm handles large
  numbers correctly.
- Prefer `BaseLanguage` when your language fits the highest-matching-card
  algorithm pattern. Use `AbstractLanguage` if you need a different composition
  strategy; in that case implement `toCardinal(wholeNumber)`.
- For decimals, rely on `AbstractLanguage.decimalToCardinal()` unless your
  language has very unique decimal rules.

### Registering the language

The core `lib/n2words.js` currently uses static imports so bundlers can include
language modules in browser builds. After adding your `lib/i18n/xx.js` file:

1. Add an `import` line in `lib/n2words.js`, e.g.: `import xx from './i18n/xx.js'`.
2. Add an entry to the `dict` mapping in `lib/n2words.js`:

```js
const dict = {
  // ... existing entries
  xx
}
```

This keeps the Node.js and browser behavior identical. Note: `webpack.config.js`
also generates per-language entries for the `dist/` bundle by scanning
`lib/i18n/`, so building will include the new language automatically.

### Tests & lint

Please add tests under `test/i18n/` following the existing pattern. Run the
full test suite and linter before opening a PR:

```powershell
npm run lint:js
npm test
npm run build
```

Browser tests (optional) are under `test/web.js` and require `npm run build`.

### Pull Request checklist

- Add the new file under `lib/i18n/` and export the default function.
- Update `lib/n2words.js` imports and `dict` mapping.
- Add tests to `test/i18n/` using existing language tests as examples.
- Run `npm run lint:js` and `npm test` — all tests should pass.
- If adding regional variants (e.g. `fr-CA`), ensure fallbacks behave as expected
  (`fr-CA` -> `fr`).

If you have any questions or need an example PR, open an issue and we'll help.

Thank you for contributing!

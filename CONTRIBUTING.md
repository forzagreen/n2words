# n2words

## Contributing

This repository converts numbers into words for many languages. If you'd like to
add a new language or improve an existing one, follow these guidelines to keep
the codebase consistent and ensure both Node.js and browser builds work.

### Quick Start: Adding a New Language

We provide an automated script to generate all the boilerplate for a new language:

```powershell
npm run lang:add
```

This interactive script will:

1. Prompt for language details (code, name, settings)
2. Generate `lib/i18n/xx.js` with implementation template
3. Generate `test/i18n/xx.js` with test case template
4. Update `lib/n2words.js` with imports and registration
5. Derive the class name from the language name (PascalCase), not the code token
6. Provide next steps for completing the implementation

After running the script, you'll need to:

- Fill in the `cards` array with number words (using BigInt literals like `1000n`)
- Implement the `mergeScales()` method for your language's grammar
- Complete the test cases with expected outputs

To validate your implementation:

```powershell
npm run lang:validate xx  # Replace 'xx' with your language code

# Validate all languages
npm run lang:validate
```

### Important Resources

- [LANGUAGE_GUIDE.md](./LANGUAGE_GUIDE.md) - Comprehensive implementation guide
- [BIGINT-GUIDE.md](./BIGINT-GUIDE.md) - Critical BigInt usage guide
- [scripts/README.md](./scripts/README.md) - Tooling documentation

### Manual Process (Alternative)

If you prefer to add a language manually or need more control:

### Language file location & format

- Create a new file under `lib/i18n/` named with the language code and `.js`,
  for example: `lib/i18n/xx.js` or `lib/i18n/fr-CA.js` for a regional variant.
- Files MUST be ESM modules and export a default function with this signature:

```js
// lib/i18n/xx.js
import GreedyScaleLanguage from '../classes/greedy-scale-language.js';

export class XxLanguage extends GreedyScaleLanguage {
  // Set default language-specific words as class properties
  negativeWord = 'minus';
  separatorWord = 'point';
  zero = 'zero';

  // Define cards array with [value, word] pairs in DESCENDING order
  cards = [
    [1_000_000n, 'million'],
    [1000n, 'thousand'],
    [100n, 'hundred'],
    [90n, 'ninety'],
    [80n, 'eighty'],
    [1n, 'one'],
    [0n, 'zero'],
  ];

  /**
   * Initialize with language-specific options.
   * Only include parameters that are actually accepted by the constructor.
   *
   * @param {Object} [options={}] Configuration options.
   * @param {boolean} [options.someOption=false] Example option for your language.
   */
  constructor({ someOption = false } = {}) {
    super();
    this.someOption = someOption;
    // Apply any option-dependent configuration
  }

  // Implement mergeScales(leftWordSet, rightWordSet) according to language rules.
  mergeScales(left, right) {
    // left and right are objects like { 'one': 1n } and { 'hundred': 100n }
    // Return a merged object, e.g. { 'one hundred': 100n }
    const leftWord = Object.keys(left)[0];
    const leftNumber = Object.values(left)[0];
    const rightWord = Object.keys(right)[0];
    const rightNumber = Object.values(right)[0];

    // Implement your language's merge logic here
    return { [`${leftWord} ${rightWord}`]: leftNumber + rightNumber };
  }
}

export default function floatToCardinal(value, options = {}) {
  return new XxLanguage(options).floatToCardinal(value);
}
```

Notes:

- **Critical**: Use `BigInt` literals (e.g. `1000n`) in `cards` so the algorithm handles large
  numbers correctly. See [BIGINT-GUIDE.md](./BIGINT-GUIDE.md) for detailed guidance.
- Class properties define default values that are shared across all instances. Constructor parameters allow per-call customization.
- Choose the appropriate base class:
  - `GreedyScaleLanguage` for most languages with regular card-based systems (English, Spanish, German, French, Belgian French, Italian, Portuguese, Dutch, Korean, Hungarian, Chinese)
  - `SlavicLanguage` for languages with three-form pluralization (Russian, Czech, Polish, Ukrainian, Serbian, Croatian, Hebrew, Lithuanian, Latvian)
  - `TurkicLanguage` for Turkic languages with space-separated patterns (Turkish, Azerbaijani)
  - `AbstractLanguage` for custom implementations requiring full control (Arabic, Persian, Indonesian, Romanian, Vietnamese)
- For decimals, rely on `AbstractLanguage.decimalToCardinal()`. If your language
  reads decimals digit-by-digit (like Japanese, Thai, Tamil, Telugu), set
  `usePerDigitDecimals = true` as a **class property** and define a `digits` class
  property for the digit words. Do not pass these via constructor options.

### Registering the language

The core `lib/n2words.js` currently uses static imports so bundlers can include
language modules in browser builds. After adding your `lib/i18n/xx.js` file:

1. Add an `import` line in `lib/n2words.js`, e.g.: `import xx from './i18n/xx.js'`.
2. Add an entry to the `dict` mapping in `lib/n2words.js`:

```js
const dict = {
  // ... existing entries
  xx,
};
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

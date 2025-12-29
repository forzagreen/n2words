# Pull Request

## What does this do?

<!-- Describe your changes in a sentence or two -->

## Related Issue

<!-- If this fixes an issue, mention it: Fixes #123 -->

## Checklist

**Before submitting, make sure:**

- [ ] Tests pass locally (`npm test`)
- [ ] Code follows the project style (runs automatically via StandardJS)

**If adding a new language:**

- [ ] Used `npm run lang:add <code>` to scaffold
- [ ] Added test cases in `test/fixtures/languages/<code>.js`
- [ ] Validation passes (`npm run lang:validate -- <code>`)

## Test Results (optional)

<!-- If you want, paste the output showing tests pass -->

```bash
npm test
# ✓ All tests passed
```

## Example (optional)

<!-- Show how your changes work if it helps! -->

```javascript
import { MyConverter } from 'n2words'
console.log(MyConverter(42))
// "forty-two"
```

---

**Note:** By submitting this PR, you agree to follow the project's [Code of Conduct](../CODE_OF_CONDUCT.md). Thanks for contributing! 🎉

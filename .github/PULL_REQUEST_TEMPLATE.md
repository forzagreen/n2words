# Pull Request

## Description

<!-- Provide a clear and concise description of your changes -->

## Type of Change

<!-- Mark all that apply with an "x" -->

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring
- [ ] New language support
- [ ] Test improvement
- [ ] Dependency update

## Related Issues

<!-- Link related issues using keywords: Closes #123, Fixes #456, Relates to #789 -->

## Checklist

### General

- [ ] I have read the [CONTRIBUTING.md](../CONTRIBUTING.md) guide
- [ ] I have read and agree to follow the [Code of Conduct](../CODE_OF_CONDUCT.md)
- [ ] My code follows the project's style guidelines (StandardJS)
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have added/updated JSDoc documentation where applicable

### Testing

- [ ] I have added tests that prove my fix/feature works
- [ ] All tests pass locally with my changes (`npm test`)
- [ ] I have run the full test suite including browser tests (`npm run test:all`)
- [ ] My changes generate no new warnings or errors

### Documentation

- [ ] I have updated the CHANGELOG.md (if applicable)
- [ ] I have updated relevant documentation (README, CLAUDE.md, etc.)
- [ ] Code examples in documentation are accurate and tested

## For New Language Support

<!-- Only complete this section if adding a new language -->

- [ ] Language code follows IETF BCP 47 format (e.g., `en`, `zh-Hans`, `fr-BE`)
- [ ] Used `npm run lang:add <code>` to scaffold the language
- [ ] Implemented all required methods (`convertWholePart`, etc.)
- [ ] Added comprehensive test fixtures (minimum 50+ test cases)
- [ ] Tested edge cases: 0, negative numbers, decimals, large numbers, BigInt
- [ ] Language validation passes (`npm run lang:validate -- <code> --verbose`)
- [ ] Updated CLAUDE.md with language-specific patterns (if unique implementation)
- [ ] Added proper JSDoc documentation to the language class

## Test Results

<!-- Paste relevant test output showing your changes work -->

```bash
# Example:
npm test
# ✓ All tests passed (X assertions in Y files)
```

## Code Examples

<!-- If applicable, provide code examples demonstrating your changes -->

```javascript
// Example usage
import { YourConverter } from 'n2words'
console.log(YourConverter(42))
// Expected output: "..."
```

## Breaking Changes

<!-- If this PR introduces breaking changes, describe: -->
<!-- 1. What breaks and why -->
<!-- 2. Migration path for users -->
<!-- 3. Any deprecation warnings added -->

## Screenshots

<!-- If applicable, add screenshots to help explain visual changes -->

## Performance Impact

<!-- If applicable, describe performance improvements or regressions -->
<!-- Include benchmark results using `npm run bench:perf` if relevant -->

## Additional Context

<!-- Add any other relevant context, considerations, or notes about the PR -->

# Pull Request

## What does this do?

<!-- A brief description of your changes -->

## Related Issue

<!-- Optional: Fixes #123 -->

## Checklist

- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)

<!-- That's it for most PRs! The sections below are optional. -->

---

<details>
<summary><b>Adding a new language?</b> (click to expand)</summary>

**Recommended:** Use the scaffolding tool to generate all files automatically:

```bash
npm run lang:add -- <code>
```

**Manual setup:** If not using the scaffolding tool, ensure you have:

- [ ] Language class in `lib/languages/<code>.js`
- [ ] Test fixture in `test/fixtures/languages/<code>.js` (include options if language has them)
- [ ] In `lib/n2words.js` (alphabetically sorted): import, typedef, converter, export
- [ ] Type test in `test/types/n2words.test-d.ts` (include options if language has them)
- [ ] Validation passes (`npm run lang:validate -- <code>`)

</details>

<details>
<summary><b>Breaking change?</b> (click to expand)</summary>

Describe what breaks and how users should update:

</details>

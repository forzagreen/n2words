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

- [ ] Language module in `src/<code>.js` exporting `toCardinal()`, `toOrdinal()`, and/or `toCurrency()`
- [ ] Test fixture in `test/fixtures/<code>.js` with matching exports
- [ ] Tests pass (`npm test`)

</details>

<details>
<summary><b>Breaking change?</b> (click to expand)</summary>

Describe what breaks and how users should update:

</details>

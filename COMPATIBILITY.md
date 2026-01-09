# Compatibility Guide

Technical details for contributors and maintainers. For usage instructions, see [README.md](README.md).

## Browser Support

BigInt is the primary constraint and cannot be polyfilled.

| Platform           | Minimum Version | Release Date | Global Coverage |
| ------------------ | --------------- | ------------ | --------------- |
| **Chrome**         | 67              | May 2018     | ~65%            |
| **Firefox**        | 68              | July 2019    | ~3%             |
| **Safari**         | 14              | Sep 2020     | ~20%            |
| **Edge**           | 79              | Jan 2020     | ~5%             |
| **Mobile Safari**  | 14.0            | Sep 2020     | Included        |
| **Chrome Android** | 67              | May 2018     | Included        |
| **Total Coverage** | -               | -            | **~86%**        |

## Node.js Support

- **Supported**: Node.js 20+ (LTS versions)
- Use `.nvmrc` with `nvm use` or `fnm use`

## Build Configuration

### Browser Targets (`.browserslistrc`)

```browserslist
defaults and supports bigint
```

### Verification Commands

```bash
npm run browserslist          # Show target browsers
npm run browserslist:coverage # Show global coverage percentage
npm run test:e2e              # Run Playwright browser tests
```

## JavaScript Features

BigInt (ES2020) is the hard floor. No features newer than ES2020 are used.

import { defineConfig, globalIgnores } from 'eslint/config'
import neostandard from 'neostandard'
import esx from 'eslint-plugin-es-x'
import globals from 'globals'

// Flat config (ESLint 9). neostandard is the maintained flat-config successor
// to standard — same style rules, but (unlike `standard`) it supports plugins.
export default defineConfig([
  globalIgnores(['dist/', 'coverage/', '**/*.d.ts']),

  neostandard(),

  // Shipped library code must run in the browserslist floor (Chrome 109 /
  // Safari 16 ≈ ES2022). es-x fails lint if src/ uses any syntax or built-in
  // newer than ES2022, so we never ship something those browsers can't run —
  // the guarantee Babel nominally provided, now enforced at the source. It
  // covers the raw src/ that npm/Node consumers import, not just dist bundles.
  // (eslint-plugin-compat was the wrong tool here — it only tracks Web/DOM
  // APIs, which this library doesn't use.)
  {
    name: 'n2words/src-es2022-floor',
    files: ['src/**/*.js'],
    extends: [esx.configs['flat/restrict-to-es2022']]
  },

  // Tooling, tests, and config files run on Node, not in browsers.
  {
    name: 'n2words/node-tooling',
    files: ['test/**/*.js', 'scripts/**/*.js', 'bench/**/*.js', '*.js'],
    languageOptions: { globals: globals.node }
  }
])

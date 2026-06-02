import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import compat from 'eslint-plugin-compat'
import esx from 'eslint-plugin-es-x'
import n from 'eslint-plugin-n'
import importX from 'eslint-plugin-import-x'
import ava from 'eslint-plugin-ava'
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs'
import globals from 'globals'

// Flat config (ESLint 10). Built on ESLint's own recommended rules + @stylistic
// for formatting (neostandard has no ESLint 10 release). Browser compatibility
// of the shipped source is enforced two ways: eslint-plugin-compat (APIs/built-ins
// vs .browserslistrc) and eslint-plugin-es-x (no syntax/built-in newer than
// ES2022). Plus: import hygiene (import-x), node-API correctness for tooling (n),
// AVA test hygiene, and eslint-disable discipline (eslint-comments).
export default defineConfig([
  globalIgnores(['dist/', 'coverage/', '**/*.d.ts']),

  // Flag stale/blanket eslint-disable directives.
  { linterOptions: { reportUnusedDisableDirectives: 'error' } },

  js.configs.recommended,
  stylistic.configs.recommended,
  importX.flatConfigs.recommended,
  comments.recommended,

  {
    name: 'n2words/global-rules',
    rules: {
      // No circular imports across the source graph.
      'import-x/no-cycle': 'error',
      // Every eslint-disable must explain why.
      '@eslint-community/eslint-comments/require-description': 'error',
    },
  },

  // Shipped library code runs in browsers (the browserslist floor).
  {
    name: 'n2words/src-browser',
    files: ['src/**/*.js'],
    languageOptions: { globals: globals.browser },
    extends: [
      compat.configs['flat/recommended'],
      esx.configs['flat/restrict-to-es2022'],
    ],
  },

  // Tests run on the CI Node matrix (down to the engines floor), so n checks
  // them against engines.node (>=22) — they must stay compatible with it.
  {
    name: 'n2words/tests',
    files: ['test/**/*.js'],
    languageOptions: { globals: globals.node },
    extends: [n.configs['flat/recommended-module']],
  },

  // Dev CLIs (scripts, bench, root configs) run on the .nvmrc Node (24), not
  // the published library's floor — so n targets 24 there. They also
  // legitimately call process.exit (CLIs), so that rule is off for them.
  {
    name: 'n2words/dev-cli',
    files: ['scripts/**/*.js', 'bench/**/*.js', '*.js'],
    languageOptions: { globals: globals.node },
    extends: [n.configs['flat/recommended-module']],
    settings: { n: { version: '>=24.0.0' } },
    rules: { 'n/no-process-exit': 'off' },
  },

  // AVA test hygiene (no committed .only, sane assertions, etc.).
  {
    name: 'n2words/ava-tests',
    files: ['test/**/*.test.js'],
    extends: [ava.configs.recommended],
  },

  // conversions.test.js is a data-driven suite: it asserts inside fixture
  // loops by design (with a non-empty-fixture guard), which is the idiomatic
  // shape for table tests — not an accidental conditional assertion.
  {
    name: 'n2words/data-driven-tests',
    files: ['test/conversions.test.js'],
    rules: { 'ava/no-conditional-assertion': 'off' },
  },

  // This config imports flat-config plugins via their default export
  // (e.g. `importX.flatConfigs`), which is the documented usage but trips
  // import-x's default-vs-named-export heuristics. Expected here.
  {
    name: 'n2words/eslint-config-file',
    files: ['eslint.config.js'],
    rules: {
      'import-x/no-named-as-default': 'off',
      'import-x/no-named-as-default-member': 'off',
    },
  },
])

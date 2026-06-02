import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import compat from 'eslint-plugin-compat'
import esx from 'eslint-plugin-es-x'
import globals from 'globals'

// Flat config (ESLint 10). Built on ESLint's own recommended rules + @stylistic
// for formatting — neostandard has no ESLint 10 release (it pins an @stylistic
// that crashes on 10). Browser compatibility of the shipped source is enforced
// two complementary ways: eslint-plugin-compat flags APIs/built-ins unsupported
// by the .browserslistrc targets, and eslint-plugin-es-x rejects any syntax or
// built-in newer than ES2022. There is no transpile step, so src/ must run
// as-authored in the target browsers.
export default defineConfig([
  globalIgnores(['dist/', 'coverage/', '**/*.d.ts']),

  js.configs.recommended,
  stylistic.configs.recommended,

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

  // Tooling, tests, and config files run on Node.
  {
    name: 'n2words/node-tooling',
    files: ['test/**/*.js', 'scripts/**/*.js', 'bench/**/*.js', '*.js'],
    languageOptions: { globals: globals.node },
  },
])

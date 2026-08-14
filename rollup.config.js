import terser from '@rollup/plugin-terser'
import virtual from '@rollup/plugin-virtual'
import { readFileSync } from 'node:fs'
import { FORM_EXPORTS, getExportedForms, getLanguageCodes } from './test/helpers/language-helpers.js'
import { normalizeCode } from './test/helpers/language-naming.js'

// Read package.json for version
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

// Get all language codes from the src directory
const languageCodes = getLanguageCodes()

/**
 * Rollup configuration for n2words bundles.
 *
 * Build Strategy:
 * 1. Source (src/): modern ES2022+ code with BigInt.
 * 2. Terser: minifies (ES2020 output).
 * 3. Target: in-use browsers with BigInt support, via .browserslistrc
 *    ("defaults and supports bigint"). No transpile step — the source is
 *    authored to stay within what those browsers support, so Terser alone
 *    suffices.
 *
 * Generates:
 * - Individual ESM bundles (dist/{langCode}.js): One per language, for browsers
 * - Per-form ESM bundles (dist/{langCode}/{form}.js): One per language *and*
 *   form, for a page that needs only one of the three
 * - Individual UMD bundles (dist/{langCode}.umd.js): One per language, for
 *   browser <script> tags
 *
 * Why per-form bundles exist, and only for ESM: a dist bundle is a prebuilt
 * file fetched from a CDN, so whatever it contains is what the page downloads
 * — there is no bundler on the other end to prune the forms it didn't ask
 * for. dist/en.js carries all three, which is most of its weight for a page
 * that only spells prices. npm consumers never needed this: src/{lang}.js
 * exports the three forms independently and the package is sideEffects-free,
 * so `import { toCurrency } from 'n2words/en'` already tree-shakes cardinals
 * and ordinals away. UMD gets no per-form split — it is the legacy path, its
 * globals are already namespaced by form (n2words.currency.en), and doubling
 * the file count for it buys the least.
 *
 * Node.js users import directly from src/ (ESM source). No CJS bundle is generated -
 * Node.js 22.12+ can require() ESM modules directly.
 *
 * UMD bundles use virtual entry points to re-export toCardinal as the
 * normalized language code (e.g., n2words.en, n2words.zhHans), allowing
 * multiple languages to be loaded together without conflicts.
 *
 * Bare-tag aliases (src/en.js -> src/en-US.js) get their own bundles too, so
 * dist/ carries a copy of each aliased language's code under both names. That
 * duplication is deliberate: a dist bundle's whole contract is that it is a
 * single self-contained file you can point a <script> tag or a CDN URL at, and
 * emitting a re-export stub instead would make dist/en.js useless without a
 * second fetch of dist/en-US.js — fatal for the UMD build, which has no module
 * loader to follow the redirect. The UMD alias bundles are not even byte-equal
 * to their targets: they expose the global the README documents (n2words.en,
 * not n2words.enUS). Node and bundler users import from src/ and never pay for
 * this; it costs only npm tarball size.
 */

// Individual bundle terser config — aggressive because each bundle is a
// self-contained leaf artifact: nothing external imports its internals, so
// every non-exported top-level name is safe to mangle. Terser still preserves
// each bundle's public export names regardless of toplevel.
const individualTerserConfig = terser({
  compress: {
    passes: 3, // Extra pass for better compression
    drop_debugger: true,
    ecma: 2020,
    pure_getters: true,
    toplevel: true, // Optimize top-level since we control the entire bundle
  },
  mangle: {
    toplevel: true, // Mangle top-level names (internal functions)
  },
  format: {
    comments: /^!/,
    ecma: 2020,
  },
})

// ============================================================================
// Individual Language Bundle Configurations
// ============================================================================

// Generate individual ESM language bundle configurations
// ESM bundles directly use source files - they already export toCardinal
const languageEsmConfigs = languageCodes.map(langCode => ({
  input: `./src/${langCode}.js`,
  output: {
    file: `dist/${langCode}.js`,
    format: 'es',
    banner: `/*! n2words/${langCode} v${pkg.version} | MIT License | github.com/forzagreen/n2words */`,
  },
  plugins: [individualTerserConfig],
}))

/**
 * Build the ESM config for one (language, form) pair.
 *
 * A virtual entry re-exports the single form, so Rollup's dead-code
 * elimination drops the other two and everything only they reach — the
 * currency vocabulary for a cardinal bundle, the scale tables for a currency
 * one. Same terser settings as the combined bundle, so the sizes are
 * directly comparable.
 * @param {string} langCode - The language code (e.g. 'en-US')
 * @param {string} form - A key of FORM_EXPORTS ('cardinal' | 'ordinal' | 'currency')
 * @returns {import('rollup').RollupOptions} Config for that one form's bundle
 */
function formEsmConfig(langCode, form) {
  const virtualEntryId = `\0virtual:form:${langCode}:${form}`

  return {
    input: virtualEntryId,
    output: {
      file: `dist/${langCode}/${form}.js`,
      format: 'es',
      banner: `/*! n2words/${langCode} ${form} v${pkg.version} | MIT License | github.com/forzagreen/n2words */`,
    },
    plugins: [
      virtual({
        [virtualEntryId]: `export { ${FORM_EXPORTS[form]} } from './src/${langCode}.js';\n`,
      }),
      individualTerserConfig,
    ],
  }
}

/**
 * Build the UMD config for one language. `forms` is the Set of forms the
 * language actually exports (read from the module, not scanned from text).
 */
function umdConfig(langCode, forms) {
  const normalizedName = normalizeCode(langCode)
  const virtualEntryId = `\0virtual:umd:${langCode}`

  // Build virtual entry content
  // Cardinal: n2words.enUS(42) → "forty-two"
  // Ordinal:  n2words.ordinal.enUS(42) → "forty-second"
  // Currency: n2words.currency.enUS(42.50) → "forty-two dollars and fifty cents"
  let virtualContent = `export { toCardinal as ${normalizedName} } from './src/${langCode}.js';\n`

  if (forms.has('ordinal')) {
    virtualContent += `import { toOrdinal } from './src/${langCode}.js';\n`
    virtualContent += `export const ordinal = { ${normalizedName}: toOrdinal };\n`
  }

  if (forms.has('currency')) {
    virtualContent += `import { toCurrency } from './src/${langCode}.js';\n`
    virtualContent += `export const currency = { ${normalizedName}: toCurrency };\n`
  }

  return {
    input: virtualEntryId,
    output: {
      file: `dist/${langCode}.umd.js`,
      format: 'umd',
      name: 'n2words',
      exports: 'named',
      extend: true,
      banner: `/*! n2words/${langCode} v${pkg.version} | MIT License | github.com/forzagreen/n2words */`,
    },
    plugins: [
      virtual({
        [virtualEntryId]: virtualContent,
      }),
      individualTerserConfig,
    ],
  }
}

// Async config: resolve each language's exported forms (an import() per
// module), then build the UMD entries from real exports.
export default async () => {
  const formsByCode = await Promise.all(
    languageCodes.map(async langCode => /** @type {const} */ ([langCode, await getExportedForms(langCode)])),
  )

  const languageUmdConfigs = formsByCode.map(([langCode, forms]) => umdConfig(langCode, forms))

  // Only for forms the language actually exports — a language without
  // toOrdinal gets no dist/{lang}/ordinal.js rather than an empty bundle.
  const formEsmConfigs = formsByCode.flatMap(
    ([langCode, forms]) => [...forms].map(form => formEsmConfig(langCode, form)),
  )

  return [
    ...languageEsmConfigs,
    ...formEsmConfigs,
    ...languageUmdConfigs,
  ]
}

import terser from '@rollup/plugin-terser'
import virtual from '@rollup/plugin-virtual'
import { readFileSync } from 'node:fs'
import { getExportedForms, getLanguageCodes } from './test/helpers/language-helpers.js'
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
 * - Individual UMD bundles (dist/{langCode}.umd.js): One per language, for
 *   browser <script> tags
 *
 * Node.js users import directly from src/ (ESM source). No CJS bundle is generated -
 * Node.js 22.12+ can require() ESM modules directly.
 *
 * UMD bundles use virtual entry points to re-export toCardinal as the
 * normalized language code (e.g., n2words.en, n2words.zhHans), allowing
 * multiple languages to be loaded together without conflicts.
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
  const languageUmdConfigs = await Promise.all(
    languageCodes.map(async langCode => umdConfig(langCode, await getExportedForms(langCode))),
  )

  return [
    ...languageEsmConfigs,
    ...languageUmdConfigs,
  ]
}

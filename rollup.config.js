import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import virtual from '@rollup/plugin-virtual'
import { readFileSync } from 'node:fs'
import { getLanguageCodes } from './test/helpers/language-helpers.js'
import { normalizeCode } from './test/helpers/language-naming.js'

// Read package.json for version
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

// Get all language codes from the src directory
const languageCodes = getLanguageCodes()

/**
 * Check if a language file exports a given function name.
 * @param {string} content File content
 * @param {string} fnName Function name to look for in export statement
 * @returns {boolean}
 */
function hasExport (content, fnName) {
  const exportMatch = content.match(/export\s*\{([^}]+)\}/)
  return exportMatch ? exportMatch[1].includes(fnName) : false
}

/**
 * Get languages that have ordinal support by checking for toOrdinal export.
 * @returns {string[]} Language codes with ordinal support
 */
function getOrdinalLanguages () {
  return languageCodes.filter(code => {
    const content = readFileSync(`./src/${code}.js`, 'utf8')
    return hasExport(content, 'toOrdinal')
  })
}

/**
 * Get languages that have currency support by checking for toCurrency export.
 * @returns {string[]} Language codes with currency support
 */
function getCurrencyLanguages () {
  return languageCodes.filter(code => {
    const content = readFileSync(`./src/${code}.js`, 'utf8')
    return hasExport(content, 'toCurrency')
  })
}

const ordinalLanguages = getOrdinalLanguages()
const currencyLanguages = getCurrencyLanguages()

/**
 * Rollup configuration for n2words bundles.
 *
 * Build Strategy:
 * 1. Source (src/): Modern ES2022+ code with BigInt, optional chaining
 * 2. Babel: Transpiles ES2022+ features down while preserving BigInt support
 * 3. Terser: Minifies using ES2020 syntax (safe for BigInt-supporting browsers)
 * 4. Target: ~85.9% global coverage via .browserslistrc ("defaults and supports bigint")
 *
 * Generates:
 * - Individual ESM bundles (dist/{langCode}.js): One per language, for browsers
 * - Individual UMD bundles (dist/{langCode}.umd.js): One per language, for
 *   browser <script> tags
 *
 * Node.js users import directly from src/ (ESM source). No CJS bundle is generated -
 * Node.js 22.12+/20.19+ can require() ESM modules directly.
 *
 * UMD bundles use virtual entry points to re-export toCardinal as the
 * normalized language code (e.g., n2words.en, n2words.zhHans), allowing
 * multiple languages to be loaded together without conflicts.
 */

// Common babel configuration
const babelConfig = {
  babelHelpers: 'bundled',
  exclude: 'node_modules/**',
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false // Preserve ES modules for Rollup's tree-shaking
      }
    ]
  ]
}

// Individual bundle terser config - aggressive since only one function is exported
const individualTerserConfig = terser({
  compress: {
    passes: 3, // Extra pass for better compression
    drop_debugger: true,
    ecma: 2020,
    pure_getters: true,
    toplevel: true // Optimize top-level since we control the entire bundle
  },
  mangle: {
    toplevel: true // Mangle top-level names (internal functions)
  },
  format: {
    comments: /^!/,
    ecma: 2020
  }
})

// Base plugins (shared between all bundles)
const basePlugins = [
  nodeResolve({ preferBuiltins: false }),
  babel(babelConfig)
]

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
    banner: `/*! n2words/${langCode} v${pkg.version} | MIT License | github.com/forzagreen/n2words */`
  },
  plugins: [...basePlugins, individualTerserConfig]
}))

// Generate individual UMD language bundle configurations
const languageUmdConfigs = languageCodes.map(langCode => {
  const normalizedName = normalizeCode(langCode)
  const virtualEntryId = `\0virtual:umd:${langCode}`
  const hasOrdinal = ordinalLanguages.includes(langCode)
  const hasCurrency = currencyLanguages.includes(langCode)

  // Build virtual entry content
  // Cardinal: n2words.enUS(42) → "forty-two"
  // Ordinal:  n2words.ordinal.enUS(42) → "forty-second"
  // Currency: n2words.currency.enUS(42.50) → "forty-two dollars and fifty cents"
  let virtualContent = `export { toCardinal as ${normalizedName} } from './src/${langCode}.js';\n`

  if (hasOrdinal) {
    virtualContent += `import { toOrdinal } from './src/${langCode}.js';\n`
    virtualContent += `export const ordinal = { ${normalizedName}: toOrdinal };\n`
  }

  if (hasCurrency) {
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
      banner: `/*! n2words/${langCode} v${pkg.version} | MIT License | github.com/forzagreen/n2words */`
    },
    plugins: [
      virtual({
        [virtualEntryId]: virtualContent
      }),
      ...basePlugins,
      individualTerserConfig
    ]
  }
})

// Export all configurations as an array
export default [
  ...languageEsmConfigs,
  ...languageUmdConfigs
]

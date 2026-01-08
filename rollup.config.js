import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import virtual from '@rollup/plugin-virtual'
import { readFileSync, readdirSync } from 'node:fs'

// Read package.json for version
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

// Get all language codes from the languages directory
const languageCodes = readdirSync('./lib/languages')
  .filter(file => file.endsWith('.js'))
  .map(file => file.replace('.js', ''))

/**
 * Normalizes BCP 47 language code to camelCase identifier.
 * Examples: 'en' → 'en', 'zh-Hans' → 'zhHans', 'fr-BE' → 'frBE'
 */
function normalizeCode (code) {
  return code.replace(/-([a-zA-Z])/g, (_, char) => char.toUpperCase())
}

/**
 * Rollup configuration for n2words bundles.
 *
 * Build Strategy:
 * 1. Source (lib/): Modern ES2022+ code with BigInt, optional chaining
 * 2. Babel: Transpiles ES2022+ features down while preserving BigInt support
 * 3. Terser: Minifies using ES2020 syntax (safe for BigInt-supporting browsers)
 * 4. Target: ~85.9% global coverage via .browserslistrc ("defaults and supports bigint")
 *
 * Generates:
 * - Main ESM bundle (dist/n2words.js): All language converters, ES modules
 * - Main UMD bundle (dist/n2words.umd.cjs): All language converters, UMD format
 * - Individual ESM bundles (dist/languages/{langCode}.js): One per language
 * - Individual UMD bundles (dist/languages/{langCode}.umd.cjs): One per language
 *
 * UMD bundles use virtual entry points to re-export toWords as the
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

// Main bundle terser config - preserve property names for public API
const mainTerserConfig = terser({
  compress: {
    passes: 2,
    drop_debugger: true,
    ecma: 2020,
    pure_getters: true
  },
  mangle: {
    properties: false // Don't mangle - main bundle exports many named converters
  },
  format: {
    comments: /^!/,
    ecma: 2020
  }
})

// Individual bundle terser config - more aggressive since only one function is exported
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
// Main Bundle Configurations
// ============================================================================

// Main ESM bundle (all languages) - for <script type="module"> and CDN default
const mainEsmConfig = {
  input: './lib/n2words.js',
  output: {
    file: 'dist/n2words.js',
    format: 'es',
    banner: `/*! n2words v${pkg.version} | MIT License | github.com/forzagreen/n2words */`
  },
  plugins: [...basePlugins, mainTerserConfig]
}

// Main UMD bundle (all languages) - for legacy <script> tags and CJS require()
const mainUmdConfig = {
  input: './lib/n2words.js',
  output: {
    file: 'dist/n2words.umd.cjs',
    format: 'umd',
    name: 'n2words',
    exports: 'named', // Named exports - window.n2words.en, window.n2words.zhHans, etc.
    banner: `/*! n2words v${pkg.version} | MIT License | github.com/forzagreen/n2words */`
  },
  plugins: [...basePlugins, mainTerserConfig]
}

// ============================================================================
// Individual Language Bundle Configurations
// ============================================================================

// Generate individual ESM language bundle configurations
const languageEsmConfigs = languageCodes.map(langCode => {
  const normalizedName = normalizeCode(langCode)
  const virtualEntryId = `\0virtual:esm:${langCode}`

  return {
    input: virtualEntryId,
    output: {
      file: `dist/languages/${langCode}.js`,
      format: 'es',
      banner: `/*! n2words/${langCode} v${pkg.version} | MIT License | github.com/forzagreen/n2words */`
    },
    plugins: [
      // Virtual entry point that re-exports toWords as the normalized language name
      virtual({
        [virtualEntryId]: `export { toWords as ${normalizedName} } from './lib/languages/${langCode}.js'`
      }),
      ...basePlugins,
      individualTerserConfig
    ]
  }
})

// Generate individual UMD language bundle configurations
const languageUmdConfigs = languageCodes.map(langCode => {
  const normalizedName = normalizeCode(langCode)
  const virtualEntryId = `\0virtual:umd:${langCode}`

  return {
    input: virtualEntryId,
    output: {
      file: `dist/languages/${langCode}.umd.cjs`,
      format: 'umd',
      name: 'n2words',
      exports: 'named',
      extend: true,
      banner: `/*! n2words/${langCode} v${pkg.version} | MIT License | github.com/forzagreen/n2words */`
    },
    plugins: [
      // Virtual entry point that re-exports toWords as the normalized language name
      virtual({
        [virtualEntryId]: `export { toWords as ${normalizedName} } from './lib/languages/${langCode}.js'`
      }),
      ...basePlugins,
      individualTerserConfig
    ]
  }
})

// Export all configurations as an array
export default [
  mainEsmConfig,
  mainUmdConfig,
  ...languageEsmConfigs,
  ...languageUmdConfigs
]

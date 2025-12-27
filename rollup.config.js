import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import { readFileSync } from 'node:fs'

// Read package.json for version
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

/**
 * Rollup configuration for n2words UMD bundles.
 *
 * Generates:
 * 1. Main bundle (dist/n2words.js) - All 48 language converters
 * 2. Individual converter bundles (dist/{ConverterName}.js) - One per language
 *
 * Individual bundles re-export only the specific converter from n2words.js,
 * with tree-shaking removing unused languages for smaller bundle sizes.
 */

// Shared plugin configuration
const sharedPlugins = [
  nodeResolve({
    preferBuiltins: false
  }),
  babel({
    babelHelpers: 'bundled',
    exclude: 'node_modules/**',
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          corejs: 3,
          targets: 'defaults',
          modules: false
        }
      ]
    ]
  }),
  terser({
    compress: {
      passes: 2,
      drop_debugger: true,
      ecma: 2020
    },
    mangle: {
      properties: false
    },
    format: {
      comments: /^!/,
      ecma: 2020
    }
  })
]

// Main bundle configuration (all languages)
const mainConfig = {
  input: './lib/n2words.js',
  output: {
    file: 'dist/n2words.js',
    format: 'umd',
    name: 'n2words',
    sourcemap: true,
    exports: 'named',
    banner: `/*! n2words v${pkg.version} | MIT License | github.com/forzagreen/n2words */`
  },
  plugins: sharedPlugins
}

// Extract converter names from n2words.js exports
const n2wordsContent = readFileSync('./lib/n2words.js', 'utf8')
const exportMatches = n2wordsContent.matchAll(/export\s*{\s*([^}]+)\s*}/g)
const allExports = []
for (const match of exportMatches) {
  const exports = match[1].split(',').map(e => e.trim())
  allExports.push(...exports)
}

// Filter to only converter functions (end with "Converter")
const converters = allExports.filter(name => name.endsWith('Converter'))

// Generate individual converter bundle configurations
const converterConfigs = converters.map(converterName => {
  return {
    input: './lib/n2words.js',
    output: {
      file: `dist/${converterName}.js`,
      format: 'umd',
      name: 'n2words',
      sourcemap: true,
      exports: 'named',
      extend: true, // Extend existing n2words global instead of replacing it
      banner: `/*! n2words/${converterName} v${pkg.version} | MIT License | github.com/forzagreen/n2words */`
    },
    // Tree-shake to include only this converter and its dependencies
    treeshake: {
      moduleSideEffects: false
    },
    plugins: [
      ...sharedPlugins,
      // Custom plugin to filter exports to only the needed converter
      {
        name: 'filter-exports',
        transform (code, id) {
          // Only modify the main n2words.js file
          if (!id.endsWith('n2words.js')) return null

          // Replace the export statement to only export the specific converter
          const modifiedCode = code.replace(
            /export\s*{\s*([^}]+)\s*}/g,
            `export { ${converterName} }`
          )

          return { code: modifiedCode, map: null }
        }
      }
    ]
  }
})

// Export all configurations as an array
export default [
  mainConfig,
  ...converterConfigs
]

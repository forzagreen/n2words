import { readFileSync } from 'node:fs'
import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
const corejs = pkg.devDependencies['core-js'].replace('^', '')

/**
 * Rollup configuration for the main n2words bundle.
 * With the new architecture, all languages are included in the main bundle
 * via class imports, so we only need to bundle the main entry point.
 */
export default {
  input: './lib/n2words.js',
  output: {
    file: 'dist/n2words.js',
    format: 'umd',
    name: 'n2words',
    sourcemap: true,
    exports: 'named'
  },
  plugins: [
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
            useBuiltIns: false,
            targets: 'defaults',
            modules: false
          }
        ]
      ]
    }),
    terser({
      compress: {
        passes: 2
      },
      mangle: {
        properties: false
      },
      format: {
        comments: false
      }
    })
  ],
  external: [],
  onwarn (warning, warn) {
    // Suppress circular dependency warnings from core-js
    if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('node_modules/core-js')) {
      return
    }
    warn(warning)
  }
}

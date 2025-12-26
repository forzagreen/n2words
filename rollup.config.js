import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'

/**
 * Rollup configuration for n2words UMD bundle.
 *
 * Creates a browser-compatible UMD build with all language converters.
 */
export default {
  input: './lib/n2words.js',
  output: {
    file: 'dist/n2words.js',
    format: 'umd',
    name: 'n2words',
    sourcemap: true,
    exports: 'named',
    banner: '/*! n2words v2.0.0 | MIT License | github.com/forzagreen/n2words */'
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
}

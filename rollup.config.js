import { readdirSync, readFileSync } from 'node:fs'
import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
const corejs = pkg.devDependencies['core-js'].replace('^', '')

/**
 * Get available languages from languages directory.
 * Dynamically discovers all language modules for rollup entry points.
 * @returns {Object} Object mapping language codes to module paths
 * @example
 * { en: './lib/languages/en.js', fr: './lib/languages/fr.js', ... }
 */
function getLanguages() {
  const languages = {}
  const files = readdirSync('./lib/languages')

  for (const file of files) {
    if (file.endsWith('.js')) {
      const languageCode = file.replace('.js', '')
      languages[languageCode] = `./lib/languages/${file}`
    }
  }

  return languages
}

/**
 * Create Rollup configuration for a single entry point.
 * @param {string} input - Input file path
 * @param {string} outputFile - Output file name
 * @param {string} globalName - Global variable name for UMD
 * @param {boolean} isLanguageFile - Whether this is a language file (has named exports)
 * @returns {Object} Rollup configuration object
 */
function createConfig(input, outputFile, globalName = 'n2words', isLanguageFile = false) {
  return {
    input,
    output: {
      file: `dist/${outputFile}`,
      format: 'umd',
      name: globalName,
      sourcemap: true,
      exports: isLanguageFile ? 'auto' : 'default'
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
              corejs: { version: corejs, proposals: true },
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
    onwarn(warning, warn) {
      // Suppress circular dependency warnings from core-js
      if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('node_modules/core-js')) {
        return
      }
      warn(warning)
    }
  }
}

// Create configurations for all entry points
const languages = getLanguages()
const configs = []

// Main n2words bundle
configs.push(createConfig('./lib/n2words.js', 'n2words.js'))

// Individual language bundles
for (const [langCode, langPath] of Object.entries(languages)) {
  configs.push(createConfig(langPath, `languages/${langCode}.js`, `n2words_${langCode}`, true))
}

export default configs

import { readdirSync, readFileSync } from 'node:fs'

export default {
  mode: 'production',
  entry: {
    n2words: './lib/n2words.js',
    ...getLanguages()
  },
  node: false,
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    globalObject: 'globalThis',
    library: {
      name: 'n2words',
      type: 'umd2',
      export: 'default'
    }
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'usage',
                corejs: JSON.parse(readFileSync('./package.json')).devDependencies['core-js'].replace('^', ''),
                targets: 'defaults'
              }
            ]
          ],
          compact: 'auto'
        }
      }
    }]
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
}

/**
 * Get available languages from i18n directory.
 * Dynamically discovers all language modules for webpack entry points.
 * @returns {Object} Object mapping language codes to module paths
 * @example
 * { en: './lib/i18n/en.js', fr: './lib/i18n/fr.js', ... }
 */
function getLanguages () {
  const languages = {}

  // Load all files in language directory
  const files = readdirSync('./lib/i18n')

  // Loop through files and add to webpack entry
  for (const file of files) {
    // Make sure file is JavaScript
    if (file.endsWith('.js')) {
      // Add language file to output object, using filename without extension
      const languageCode = file.replace('.js', '')
      languages[languageCode] = `./lib/i18n/${file}`
    }
  }

  return languages
}

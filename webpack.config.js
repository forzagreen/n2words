import { readdirSync } from 'node:fs';

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
    globalObject: 'this',
    library: {
      name: 'n2words',
      type: 'umd2',
      export: 'default'
    },
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
                corejs: '3.37.1',
                targets: 'defaults'
              },
            ],
          ],
        },
      },
    }],
  }
};

/**
 * Get available languages
 * @returns {object} Object including file name and path to file
 */
function getLanguages() {
  const languages = {};

  // Load all files in language directory
  const files = readdirSync('./lib/i18n');

  // Loop through files
  for (const file of files) {
    // Make sure file is JavaScript
    if (file.includes('.js')) {
      // Add language file to output object
      languages[file.replace('.js', '')] = './lib/i18n/' + file;
    }
  }

  return languages;
}

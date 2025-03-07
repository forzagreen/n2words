import { readdirSync } from 'node:fs';
import path from 'node:path';

export default (env) => {
  const target = env.target || 'umd';
  
  // Configure output based on target
  const outputConfig = {
    cjs: {
      path: path.resolve('dist', 'cjs'),
      filename: '[name].js',
      library: {
        type: 'commonjs2'
      }
    },
    esm: {
      path: path.resolve('dist', 'esm'),
      filename: '[name].js',
      library: {
        type: 'module'
      }
    },
    umd: {
      path: path.resolve('dist', 'umd'),
      filename: '[name].js',
      globalObject: 'this',
      library: {
        name: 'n2words',
        type: 'umd2',
        export: ['default', 'n2words']
      }
    }
  }[target];

  return {
    mode: 'production',
    entry: {
      n2words: './lib/n2words.js',
      ...getLanguages()
    },
    experiments: target === 'esm' ? { outputModule: true } : {},
    node: false,
    devtool: 'source-map',
    output: outputConfig,
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
                  targets: target === 'esm' ? {
                    esmodules: true
                  } : 'defaults'
                },
              ],
            ],
          },
        },
      }],
    }
  };
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

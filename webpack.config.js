const path = require('path');
const fs = require('fs');

const dir = 'webpack';

function getEntries() {
  const files = fs.readdirSync(dir);
  const res = {};
  for (let i=0; i<files.length; i++) {
    const file = files[i];
    // e.g. n2words_KO.mjs => KO
    const lang = /_(..)\./.exec(file)[1];
    res[`n2words_${lang}`] = `./${dir}/n2words_${lang}.mjs`;
  }
  return res;
}

module.exports = {
  mode: 'production',
  entry: {
    ...getEntries(),
    'n2words': './lib/n2words.mjs'
  },
  output: {
    library: 'n2words',
    libraryTarget: 'umd',
    libraryExport: 'default',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    globalObject: 'this',
  },
  module: {
    rules: [{
      test: /\.m?js$/,
      exclude: /(node_modules|bower_components)/,
      resolve: {
        fullySpecified: false,
      },
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'usage',
                corejs: '3.6',
              },
            ],
          ],
        },
      },
    }],
  },
};

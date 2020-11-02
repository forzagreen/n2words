const path = require('path');

module.exports = {
  mode: 'production',
  entry: './lib/n2words.mjs',
  output: {
    library: 'n2words',
    libraryTarget: 'umd',
    libraryExport: 'default',
    filename: 'n2words.js',
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

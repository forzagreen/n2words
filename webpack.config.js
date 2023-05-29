module.exports = {
  mode: 'production',
  entry: './lib/n2words.mjs',
  output: {
    library: 'n2words',
    libraryTarget: 'umd',
    libraryExport: 'default',
    filename: 'n2words.js',
    globalObject: 'this',
  },
  module: {
    rules: [{
      test: /\.m?js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'usage',
                corejs: '3.30.2',
                targets: 'defaults',
              },
            ],
          ],
        },
      },
    }],
  },
};

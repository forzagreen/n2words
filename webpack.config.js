export default {
  mode: 'production',
  entry: './lib/n2words.js',
  node: false,
  devtool: 'source-map',
  output: {
    filename: 'n2words.js',
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
                corejs: '3.36.1',
                targets: 'defaults'
              },
            ],
          ],
        },
      },
    }],
  }
};

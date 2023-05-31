export default {
  mode: 'production',
  entry: './lib/n2words.js',
  output: {
    filename: 'n2words.js',
    globalObject: 'this',
    library: {
      name: 'n2words',
      type: 'umd',
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
                corejs: '3.30.2',
                targets: 'defaults'
              },
            ],
          ],
        },
      },
    }],
  }
};

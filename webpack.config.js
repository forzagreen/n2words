const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        'n2words': './src/n2words.js',
        'n2words.min': './src/n2words.js',
        'n2words_EN': './src/n2words_EN.js',
        'n2words_EN.min': './src/n2words_EN.js'
    },
    output: {
        library: 'n2words',
        libraryTarget: 'umd',
        libraryExport: 'default',
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        globalObject: 'this'
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            include: /\.min\.js$/
        })],
    },
    module: {
        rules: [{
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }]
    }
};
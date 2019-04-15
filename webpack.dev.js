const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    port: 8443,
    https: true,
    hot: true,
    host: '0.0.0.0',
    writeToDisk: true
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
});

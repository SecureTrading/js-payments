const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
    port: 8443,
    https: true,
    hot: true,
    host: '0.0.0.0',
    writeToDisk: true,
    disableHostCheck: true
  },
  plugins: [
    new TypedocWebpackPlugin({}),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/\.\.\/environments\/environment/,
      '../../environments/environment.test'
    ),
    new webpack.NormalModuleReplacementPlugin(/^\.\.\/environments\/environment/, '../environments/environment.test')
  ]
});

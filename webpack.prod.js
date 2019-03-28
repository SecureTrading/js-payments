const merge = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new TypedocWebpackPlugin({}),
    new webpack.NormalModuleReplacementPlugin(
      /\.\.\/\.\.\/environments\/environment/,
      '../../environments/environment.prod'
    )
  ]
});

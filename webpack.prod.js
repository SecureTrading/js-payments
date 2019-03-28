const merge = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    // TODO: not working correctly for now - missing import
    new webpack.NormalModuleReplacementPlugin(
      /src\/environments\/environment\.ts/,
      './src/environments/environment.prod.ts'
    ),
    new TypedocWebpackPlugin({})
  ]
});

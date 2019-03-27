const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'test',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    port: 8081,
    hot: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NormalModuleReplacementPlugin(
      './src/environments/environment.ts',
      './src/environments/environment.testdev.ts'
    )
  ]
});

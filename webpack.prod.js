const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/\.\.\/environments\/environment/,
      '../../environments/environment.prod'
    ),
    new webpack.NormalModuleReplacementPlugin(/^\.\/environments\/environment/, './environments/environment.prod'),
    new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new CompressionPlugin({
      algorithm: 'gzip',
      filename: '[path].gz[query]',
      test: /\.js$|\.css$|\.html$|\.eot?.+$|\.ttf?.+$|\.woff?.+$|\.svg?.+$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
});

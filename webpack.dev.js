const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    port: 8443,
    https: true,
    hot: true,
    host: '0.0.0.0',
    writeToDisk: true,
    index: '',
    disableHostCheck: true,
    watchOptions: {
      ignored: ['node_modules']
    }
  },
  plugins: [
    new ManifestPlugin(),
    new TypedocWebpackPlugin({}),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      WEBSERVICES_URL: JSON.stringify(`https://${process.env.npm_package_config_host}:8443`),
    })
  ]
});

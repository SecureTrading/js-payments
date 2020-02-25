const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    compress: true,
    contentBase: path.join(__dirname, './dist'),
    publicPath: '',
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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      WEBSERVICES_URL: JSON.stringify(`https://${process.env.npm_package_config_host}:8443`)
    })
  ]
});

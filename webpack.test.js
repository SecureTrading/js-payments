const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const path = require('path');

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
    disableHostCheck: true,
    watchOptions: {
      ignored: ['node_modules']
    }
  },
  plugins: [
    new ManifestPlugin(),
    new webpack.DefinePlugin({
      WEBSERVICES_URL: JSON.stringify('https://webservices.securetrading.net:8443')
    })
  ],
  resolve: {
    alias: {
      [path.resolve(__dirname, "src/environments/environment")]:
        path.resolve(__dirname, "src/environments/environment.test.ts")
    }
  }
});

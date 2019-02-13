const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

module.exports = {
  optimization: {
    usedExports: true,
    splitChunks: {
      chunks: 'all',
    },
  },
  entry: {
    client: './src/client.ts',
    server: './src/server.ts',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
  },
  devServer: {
    contentBase: './dist',
    hot: true,
    port: 8080,
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'creditCard.html',
      template: 'src/components/creditCardNumber/index.html',
      chunks: ['creditCard'],
    }),
    new HtmlWebpackPlugin({
      filename: 'expirationDate.html',
      template: 'src/components/expirationDate/index.html',
      chunks: ['expirationDate'],
    }),
    new HtmlWebpackPlugin({
      filename: 'securityCode.html',
      template: 'src/components/securityCode/index.html',
      chunks: ['securityCode'],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new ManifestPlugin(),
    new StyleLintPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new TypedocWebpackPlugin({}),
    new webpack.HotModuleReplacementPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader',
            options: {},
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};

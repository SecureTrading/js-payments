const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

module.exports = {
  entry: {
    main: './src/components/index.ts',
    stjs: './src/stjs.ts',
    example: './example/index.ts'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'dist'),
    publicPath: ''
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'card-number.html',
      template: './src/components/index.html',
      templateParameters: {
        partial: 'creditCardNumber'
      },
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'expiration-date.html',
      template: './src/components/index.html',
      templateParameters: {
        partial: 'expirationDate'
      },
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'security-code.html',
      template: './src/components/index.html',
      templateParameters: {
        partial: 'securityCode'
      },
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'notification-frame.html',
      template: './src/components/index.html',
      templateParameters: {
        partial: 'notificationFrame'
      },
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'control-frame.html',
      template: './src/components/index.html',
      templateParameters: {
        partial: 'controlFrame'
      },
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './example/index.html',
      chunks: ['stjs', 'example'],
      favicon: './favicon.ico'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new ManifestPlugin(),
    new StyleLintPlugin(),
    new FriendlyErrorsWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader',
            options: {}
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};

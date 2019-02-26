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
      name: true,
    },
  },
  entry: {
    main: './src/index.ts',
    stjs: './src/stjs.ts',
    example: './example/index.ts',
    creditCardNumber: './src/components/credit-card-number/credit-card-number',
    expirationDate: './src/components/expiration-date/expiration-date',
    securityCode: './src/components/security-code/security-code'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '',
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      filename: 'credit-card-number.html',
      template: './src/index.html',
      templateParameters: {
        partial: 'creditCardNumber'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'expiration-date.html',
      template: './src/index.html',
      templateParameters: {
        partial: 'expirationDate'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'security-code.html',
      template: './src/index.html',
      templateParameters: {
        partial: 'securityCode'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './example/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new ManifestPlugin(),
    new StyleLintPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new TypedocWebpackPlugin({}),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
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

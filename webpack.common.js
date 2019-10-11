const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: {
    main: './src/components/index.ts',
    'control-frame': './src/components/control-frame/control-frame.ts',
    st: './src/ST.ts',
    example: './example/index.ts',
    immediateExample: './example/immediate.ts',
    receipt: './example/receipt.ts',
    byPassExample: './example/bypass.ts'
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
    library: 'SecureTrading',
    libraryExport: 'default',
    libraryTarget: 'var',
    publicPath: ''
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        terserOptions: {}
      })
    ],
    // @TODO: splitChunks is not working properly - the application doesnt recognize SecureTrading global object (is undefined) and form fields are not loaded.
    // @TODO this property let us reduce the bundle size 5 times ! Unfortunately it doesn't work with output: {library } property.
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          enforce: true
        }
      }
    }
    // runtimeChunk: 'single',
    // mangleWasmImports: true
  },
  plugins: [
    new CleanWebpackPlugin(),
    new BundleAnalyzerPlugin(),
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
      filename: 'animated-card.html',
      template: './src/components/index.html',
      templateParameters: {
        partial: 'animatedCard'
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
      chunks: ['control-frame']
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './example/index.html',
      chunks: ['example']
    }),
    new HtmlWebpackPlugin({
      filename: 'immediate.html',
      template: './example/immediate.html',
      chunks: ['immediateExample']
    }),
    new HtmlWebpackPlugin({
      filename: 'receipt.html',
      template: './example/receipt.html',
      chunks: ['receipt']
    }),
    new HtmlWebpackPlugin({
      filename: 'bypass.html',
      template: './example/bypass.html',
      chunks: ['byPassExample']
    }),
    // new HtmlWebpackTagsPlugin({ tags: ['vendor.js', 'st.js'], append: true }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new CopyPlugin([
      {
        from: 'src/images',
        to: 'images',
        test: /([^/]+)\/(.+)\.png$/,
        force: true
      }
    ]),
    new StyleLintPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new webpack.DefinePlugin({
      HOST: JSON.stringify(process.env.npm_package_config_host)
    })
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
        test: /\.tsx?|js$/,
        use: 'babel-loader',
        include: [
          path.join(__dirname, 'src'),
          path.join(__dirname, 'test'),
          path.join(__dirname, 'example'),
          path.join(__dirname, 'node_modules/ts-money'),
          path.join(__dirname, 'node_modules/joi-browser')
        ]
      },
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader',
            options: {
              emitErrors: true
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: { joi: 'joi-browser' },
    extensions: ['.ts', '.js']
  }
};

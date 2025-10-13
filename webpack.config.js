const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
require('dotenv').config(); // <--- cargar .env

module.exports = {
  resolve: {
    fallback: { url: false, util: false, buffer: require.resolve('buffer/') },
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: { format: { comments: false } },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  module: {
    rules: [
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: { loader: 'babel-loader' } },
      { test: /\.html$/, use: [{ loader: 'html-loader' }] },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: '[name].css', chunkFilename: '[id].css' }),
    new HtmlWebPackPlugin({
      template: './src/index.html.ejs',
      templateParameters: { BUILD_TIME: new Date().getTime() },
      filename: './index.html',
      favicon: './public/favicon.png',
    }),
    new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),

    // <<< AÑADIR DefinePlugin para variables de entorno
    new webpack.DefinePlugin({
      'process.env.REACT_APP_FIREBASE_API_KEY': JSON.stringify(process.env.REACT_APP_FIREBASE_API_KEY),
      'process.env.REACT_APP_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN),
      'process.env.REACT_APP_FIREBASE_DATABASE_URL': JSON.stringify(process.env.REACT_APP_FIREBASE_DATABASE_URL),
      'process.env.REACT_APP_FIREBASE_PROJECT_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_PROJECT_ID),
      'process.env.REACT_APP_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.REACT_APP_FIREBASE_STORAGE_BUCKET),
      'process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID),
      'process.env.REACT_APP_FIREBASE_APP_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_APP_ID),
      'process.env.REACT_APP_PUBLIC_URL': JSON.stringify(process.env.REACT_APP_PUBLIC_URL),
    }),
  ],
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
};

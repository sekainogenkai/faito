'use strict';

const ManifestPlugin = require('webpack-manifest-plugin');
const path = require('path');

const outdir = path.join(__dirname, 'build');

module.exports = {
  devtool: 'source-map',
  entry: [
    './client/index.js',
  ],
  module: {
    loaders: [
      { test: /\.blend$/, loader: require('babylonjs-blender-loader') && 'babylonjs-blender-loader', },
      // https://webpack.github.io/docs/shimming-modules.html
      { test: require.resolve('babylonjs'), loader: require('imports-loader') && 'imports-loader?OIMO=babylonjs/Oimo', },
      { test: require.resolve('babylonjs/Oimo'), loader: require('exports-loader') && 'exports-loader?OIMO', },
      { test: /\.jsx?$/, exclude: /node_modules/, loader: require('babel-loader') && "babel-loader", },
    ],
  },
  output: {
    path: outdir,
    filename: '[name].[chunkhash].js',
  },
  plugins: [
    new ManifestPlugin(),
  ],
};

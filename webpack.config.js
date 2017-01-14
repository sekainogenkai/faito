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
      { test: require.resolve('babylonjs'), loader: require('imports-loader') && require('cannon') && 'imports-loader?CANNON=cannon', },
      // It’s babylonjs’s fault of saying “window.CANNON !== unefined”
      // instead of “typeof CANNON !== 'undefined'” when checking for
      // cannon that we have to expose cannon.
      { test: require.resolve('cannon'), loader: require('expose-loader') && 'expose-loader?CANNON' },
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

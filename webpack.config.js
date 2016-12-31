'use strict';

const ManifestPlugin = require('webpack-manifest-plugin');
const path = require('path');

const outdir = path.join(__dirname, 'build');

module.exports = {
  entry: [
    './client/index.js',
  ],
  module: {
    loaders: [
      { test: /\.blend$/, loader: require('webpack-babylonjs-blender') && 'webpack-babylonjs-blender', },
      // https://webpack.github.io/docs/shimming-modules.html
      { test: require.resolve('babylonjs'), loader: require('imports-loader') && 'imports-loader?OIMO=babylonjs/Oimo', },
      { test: require.resolve('babylonjs/Oimo'), loader: require('exports-loader') && 'exports-loader?OIMO', },
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

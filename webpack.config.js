'use strict';

const ManifestPlugin = require('webpack-manifest-plugin');
const path = require('path');

const outdir = path.join(__dirname, 'build');

module.exports = {
  entry: './client/index.js',
  module: {
    loaders: [
      { test: /\.blend$/, loader: require('webpack-babylonjs-blender') && 'webpack-babylonjs-blender', },
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

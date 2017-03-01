'use strict';

const fs = require('fs');
const ManifestPlugin = require('webpack-manifest-plugin');
const path = require('path');
const WebpackEmitGitrev = require('./webpack-emit-gitrev');

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
        {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: require('babel-core') && require('babel-loader') && "babel-loader",
            // Load presets into config so that webdev version can
            // override them.
            query: Object.assign(JSON.parse(fs.readFileSync(path.join(__dirname, '.babelrc'))), {
                // Request that the babel-loader not go behind our
                // backs and load .babelrc when we went to all this
                // trouble to manually load it ourselves.
                babelrc: false,
            }),
        },
    ],
  },
  output: {
    path: outdir,
    filename: '[name].[chunkhash].js',
  },
  plugins: [
      new ManifestPlugin(),
      new WebpackEmitGitrev(),
  ],
};

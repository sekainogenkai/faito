'use strict';

const crypto = require('crypto');
const express = require('express');
const env = require('get-env')();
const path = require('path');
const promisify = require('promisify-node');
const fs = promisify('fs');
const WebpackEmitGitrev = require('./webpack-emit-gitrev');

const getIndex = (() => {
  const getManifest = env === 'prod' ? () => Promise.resolve(require('./build/manifest.json')) : () => Promise.resolve({'main.js': 'main.js',});
  const getCssHash = () => new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha1');
    fs.createReadStream(path.join(__dirname, 'static', 'style.css'))
      .on('data', data => hash.update(data))
      .on('end', () => resolve(hash.digest('hex')))
      .on('error', reject)
    ;
  });
  const getIndex = () => getManifest().then(manifest => {
    return getCssHash().then(cssHash => {
      return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>Faito!</title>
    <meta name="viewport" content="initial-scale=1"/>
    <link rel="stylesheet" type="text/css" href="style.css?${encodeURIComponent(cssHash)}"/>
  </head>
  <body>
    <div id="game-container"/>
    <script src="${encodeURIComponent(manifest['main.js'])}"/>
  </body>
</html>
`;
    });
  });
  if (env === 'prod') {
    const p = getIndex();
    // Calculate once at startup.
    return () => p;
  }
  // Calculate all the time.
  return () => getIndex();
})();

const app = express();

if (env === 'dev') {
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpackConfig = require('./webpack.config.js');
  const webpack = require('webpack');
  webpackConfig.entry.unshift('webpack-hot-middleware/client?reload=true');
  webpackConfig.output.path = __dirname;
    webpackConfig.output.filename = 'main.js';
    webpackConfig.plugins = webpackConfig.plugins.filter(p => !(p instanceof WebpackEmitGitrev));
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    webpackConfig.plugins.push(new webpack.NoEmitOnErrorsPlugin());
    const babelQuery = webpackConfig.module.loaders.find(plugin => plugin.loader === 'babel-loader').query;
    // Remove es2015 during development because it has
    // es2015-block-scoping which modern browsers already implement
    // but which fails at actually enforcing const. See
    // https://github.com/babel/babel/issues/563
    babelQuery.presets = babelQuery.presets.filter(preset => preset != 'es2015');
  const webpackCompiler = webpack(webpackConfig);

  app.use(webpackDevMiddleware(webpackCompiler));
  app.use(webpackHotMiddleware(webpackCompiler));
}

app.get('/', function (request, response, next) {
  response.set('Content-Type', 'application/xhtml+xml; charset=utf-8');
  getIndex().then(index => {
    response.end(index);
  }).catch(next);
});
app.use(express.static('static'));
if (env === 'prod') {
  app.use(express.static('build'));
}

module.exports = app;

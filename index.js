'use strict';

const crypto = require('crypto');
const express = require('express');
const env = require('get-env')();
const path = require('path');
const promisify = require('promisify-node');
const fs = promisify('fs');

const getIndex = (() => {
  const getManifest = env === 'prod' ? () => Promise.resolve(require('./build/manifest.json')) : () => fs.readFile(path.join(__dirname, 'build', 'manifest.json')).then(manifestJson => JSON.parse(manifestJson));
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
    <h1>Faito!</h1>
    <canvas id="render-canvas"/>
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
app.get('/', function (request, response, next) {
  response.set('Content-Type', 'application/xhtml+xml; charset=utf-8');
  getIndex().then(index => {
    response.end(index);
  }).catch(next);
});
app.use(express.static('static'));
app.use(express.static('build'));

module.exports = app;

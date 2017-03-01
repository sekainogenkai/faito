'use strict';

const fs = require('fs');
const gitRev = require('git-rev');
const path = require('path');

module.exports = class WebpackEmitGitrev {
    apply(compiler) {
        compiler.plugin('emit', (compilation, callback) => {
            gitRev.long(commitHash => {
                if (commitHash == '') {
                    return callback(new Error('fail'));
                }
                const outPath = path.join(compiler.outputPath, 'git-rev.json');
                fs.writeFile(outPath, JSON.stringify(commitHash), (ex) => {
                    callback(ex);
                });
            });
        });
    }
};

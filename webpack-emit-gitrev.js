'use strict';

const fs = require('fs');
const gitRev = require('git-rev');
const path = require('path');

module.exports = class WebpackEmitGitrev {
    apply(compiler) {
        compiler.plugin('emit', (compilation, callback) => {
            gitRev.long(commitHash => {
                if (commitHash == '') {
                    callback(new Error('fail'));
                    return;
                }
                const result = JSON.stringify(commitHash);
                compilation.assets['git-rev.json'] = {
                    source: () => result,
                    size: () => result.length,
                };
                callback();
            });
        });
    }
};

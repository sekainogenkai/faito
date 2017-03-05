#!/usr/bin/env node
'use strict';

const path = require('path');

require('dotenv').config();
const autoserve = require('express-autoserve')(require('.'));

// Should be graceful exit but not yet. With this current behavior we
// will exit in the middle of a request and cause random errors, not
// ideal :-/.
//
// Cannot watch the file directly. If it doesn’t exist yet, this will
// cause an error. So just watch the directory and filter the events
// for just the updated file.
const updatedPath = path.join(__dirname, 'build', 'updated');
require('watchr').open(path.dirname(updatedPath), (eventName, fullPath, currentStat) => {
    if (fullPath === updatedPath) {
        console.info(`Exiting due to ${updatedPath} being updated.`);
        // https://github.com/binki/autoserve/issues/8
        //autoserve.close();
        process.exit(0);
    }
}, ex => {
    if (ex) {
        throw ex;
    }
});

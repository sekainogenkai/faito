#!/usr/bin/env node
'use strict';

require('dotenv').config();
require('express-autoserve')(require('.'));

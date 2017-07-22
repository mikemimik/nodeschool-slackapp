'use strict';

const Winston = require('winston');
const Colors = require('colors/safe');

const DefaultTransport = new Winston.transports.Console({
    colorize: true,
    prettyPrint: true,
    depth: 1
});

const getLogger = function getLogger(level) {
    if (!level) throw new Error('invalid function call');
    
    return new Winston.Logger({
        level,
        transports: [ DefaultTransport ],
    });
};

module.exports.getLogger = getLogger;
'use strict';

const path = require('path');
const fs = require('fs');

const files = fs.readdirSync(__dirname, 'utf8');

files.forEach(file => {
  const splitFile = file.split('.');
  if (splitFile.length <= 2) {
    const extention = splitFile[splitFile.length - 1];
    const filename = splitFile[0];
    if (filename !== 'index' && extention === 'js') {
      module.exports[filename] = require(`${__dirname}/${filename}`);
    }
  }
});
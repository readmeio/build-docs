const fs = require('fs');
const { basename } = require('path');

const buildDocs = require('./');

module.exports = (directory) => {
  return fs.readdirSync(directory)
    .filter(file => file.endsWith('.js'))
    .map(file => buildDocs(fs.readFileSync(file, 'utf8'), basename(file, '.js')));
};

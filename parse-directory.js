const fs = require('fs');

const buildDocs = require('./');

module.exports = (directory) => {
  return fs.readdirSync(directory)
    .filter(file => file.endsWith('.js'))
    .map(file => buildDocs(fs.readFileSync(file, 'utf8')));
};

const commentsParser = require('comments-parser');
const parseParams = require('./lib/params');
const parseThrows = require('./lib/throws');

function getTags(parsed, t) {
  return parsed
    .map(c => c.tags)
    .reduce((a, b) => a.concat(b), [])
    .filter(tag => tag.name === t)
    .map(p => p.value);
}

module.exports = function extract(comment) {
  const parsed = commentsParser(comment);

  return {
    description: parsed.map(c => c.lines).reduce((a, b) => a.concat(b), []).join(),
    params: parseParams(getTags(parsed, 'param')),
    throws: parseThrows(getTags(parsed, 'throws')),
  };
};


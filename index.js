const commentsParser = require('comments-parser');
const parseDescription = require('./lib/description');
const parseParams = require('./lib/params');
const parseThrows = require('./lib/throws');
const parseName = require('./lib/name');

function getTags(parsed, t) {
  return parsed.tags
    .filter(tag => tag.name === t)
    .map(p => p.value);
}

function parseComment(comment) {
  const nameDescription = parseDescription(comment.lines);
  return {
    name: parseName(nameDescription.name, getTags(comment, 'name')),
    description: nameDescription.description,
    params: parseParams(getTags(comment, 'param')),
    throws: parseThrows(getTags(comment, 'throws')),
    returns: parseParams(getTags(comment, 'returns'))[0],
  };
}

module.exports = function extract(source) {
  const parsed = commentsParser(source);

  return parsed.map(parseComment);
};

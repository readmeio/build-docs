const commentsParser = require('comments-parser');
const parseDescription = require('./lib/description');
const parseFullDescription = require('./lib/full-description');
const parseParams = require('./lib/params');
const parseThrows = require('./lib/throws');
const buildErrors = require('./lib/errors');
const parseReturns = require('./lib/returns');
const parseSecrets = require('./lib/secrets');

function getTags(parsed, t) {
  return parsed.tags
    .filter(tag => t.includes(tag.name))
    .map(p => p.value);
}

function parseComment(comment, name) {
  const throws = parseThrows(getTags(comment, ['throws', 'error']));
  return {
    name,
    description: parseDescription(comment.lines[0]),
    fullDescription: parseFullDescription(comment.lines),
    params: parseParams(getTags(comment, ['param'])),
    throws,
    errors: buildErrors(throws),
    secrets: parseSecrets(getTags(comment, ['secret'])),
    returns: parseReturns(getTags(comment, ['returns'])),
  };
}

module.exports = function extract(source, name = '') {
  const parsed = commentsParser(source.toString());

  if (!parsed[0]) {
    return { name };
  }

  return parseComment(parsed[0], name);
};

module.exports.parseDirectory = require('./parse-directory');

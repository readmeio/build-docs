const commentsParser = require('comments-parser');
const parseDescription = require('./lib/description');
const parseParams = require('./lib/params');
const parseThrows = require('./lib/throws');
const parseReturns = require('./lib/returns');
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
    returns: parseReturns(getTags(comment, 'returns')),
  };
}

module.exports = function extract(source, actions = []) {
  const parsed = commentsParser(source);

  // Filter out docs that aren't actions
  const docs = parsed.map(parseComment).filter((doc) => {
    if (actions.length) {
      return doc.name && actions.includes(doc.name);
    }
    return doc.name;
  });

  // Add missing actions to docs
  actions.forEach((action) => {
    if (!docs.find(doc => doc.name === action)) {
      docs.push({ name: action, description: '' });
    }
  });

  return docs;
};

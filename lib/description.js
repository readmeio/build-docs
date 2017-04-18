// Matches:
// name: description
// name
const NAME_IN_DESCRIPTION = /^(?:([\w]+):[\W]+)?([\w\W]+)/;

module.exports = function parseDescription(lines) {
  const description = lines.join();
  const matches = description.match(NAME_IN_DESCRIPTION);
  if (!matches) return {};
  if (matches[1] === undefined) return { name: matches[2] };
  return { name: matches[1], description: matches[2] };
};

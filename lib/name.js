module.exports = function parseName(name, nameTags) {
  if (nameTags.length) return nameTags[0];
  if (name) return name;
  return '';
};

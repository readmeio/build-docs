module.exports = function parseName(name, nameTags) {
  if (name) return name;

  // If that doesnt work, parse it from the first @name tag
  return nameTags[0] || '';
};

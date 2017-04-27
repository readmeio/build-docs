module.exports = function parseDescription(lines) {
  // Remove the first line (name: description), strip empty lines, then join the others
  return lines.slice(1).filter(Boolean).join(' ');
};

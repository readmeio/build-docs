// Matches:
// Error description
// {Error}
// {Error} Error description
const THROWS = /^(?:{(.*?)}){0,1}\s*([\s\S]+)?$/;

module.exports = function parseThrows(throws) {
  return throws.map((error) => {
    const matches = error.match(THROWS);
    const output = {};

    // Error type only
    if (matches[1] && !matches[2]) {
      output.type = matches[1];
      return output;
    }

    // Error description only
    if (matches[2] && !matches[1]) {
      output.description = matches[2];
      return output;
    }

    output.type = matches[1];
    output.description = matches[2];

    return output;
  });
};

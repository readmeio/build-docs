// Matches:
// {string} Name of the user
// {string[]} Interests of the user
const RETURN = /^{(.*)}\s+([\s\S]+)$/;

const getType = require('./get-type');

module.exports = function parseReturns(returns) {
  return returns.map((returnComment) => {
    const matches = returnComment.match(RETURN);
    const type = getType(matches[1]);

    const output = { description: matches[2] };

    // Is type an array?
    if (type.match(getType.IS_TYPE_ARRAY)) {
      output.type = 'array';
      output.items = { type: getType(type.replace(getType.IS_TYPE_ARRAY, '')) };
    } else {
      output.type = type;
    }

    return output;
  })[0] || null;
};

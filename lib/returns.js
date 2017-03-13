// Matches:
// {string} Name of the user
// {string[]} Interests of the user
const RETURN = /^{(.*)}\s+([\s\S]+)$/;

const setType = require('./set-type');

module.exports = function parseReturns(returns) {
  return returns.map((returnComment) => {
    const matches = returnComment.match(RETURN);

    return setType(matches[1], { description: matches[2] });
  })[0] || null;
};

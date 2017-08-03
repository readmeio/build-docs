// Matches:
// {string} name - Name of the user
// {string} name Name of the user
// {string[]} interests - Interests of the user
// {string} address.street - Street of the user
// {string} favouriteFoods[].cuisine - Name of the cuisine
const PARAM = /^{(.*)}\s+(\w+(?:(?:\[\])*\.\w+)*)(?:=("[\s\S]+"|[\S]+)?)?[\s-]+([\s\S]+)$/;

const setType = require('./set-type');

module.exports = function parseParams(params) {
  return params.map((param) => {
    const matches = param.match(PARAM);

    const docs = { title: matches[2], description: matches[4] };
    if (matches[3]) {
      // strip out extra "" in exampleData
      if (matches[3].startsWith('"')) {
        docs.exampleData = matches[3].slice(1, -1);
      } else {
        docs.exampleData = matches[3];
      }
    }

    return setType(matches[1], docs);
  }).map((param) => {
    if (param.type === 'object' || (param.items && param.items.type === 'object')) {
      throw new Error('Invalid Param - Nested objects are not supported.');
    }
    return param;
  })
  // Strip out falsy values
  .filter(Boolean);
};

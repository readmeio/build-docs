// Matches:
// {string} name - Name of the user
// {string} name Name of the user
// {string[]} interests - Interests of the user
// {string} address.street - Street of the user
// {string} favouriteFoods[].cuisine - Name of the cuisine
const PARAM = /^{(.*)}\s+(\w+(?:(?:\[\])*\.\w+)*)[\s-]+([\s\S]+)$/;

const setType = require('./set-type');

module.exports = function parseParams(params) {
  return params.map((param) => {
    const matches = param.match(PARAM);

    return setType(matches[1], { title: matches[2], description: matches[3] });
  }).map((param) => {
    if (param.type === 'object' || (param.items && param.items.type === 'object')) {
      throw new Error('Invalid Param - Nested objects are not supported.');
    }
    return param;
  })
  // Strip out falsy values
  .filter(Boolean);
};

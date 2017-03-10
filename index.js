const commentsParser = require('comments-parser');

const IS_TYPE_ARRAY = /\[\]$/;

// Matches:
// {string} name Name of the user
// {string[]} interests Interests of the user
// {string} address.street Street of the user
// {string} favouriteFoods[].cuisine Name of the cuisine
const PARAM = /^{(.*)}\s+(\w+(?:(?:\[\])*\.\w+)*)\s+([\s\S]+)$/;

// Matches:
// address.street
// favouriteFoods[].cuisine
const IS_NESTED_OBJECT_OR_ARRAY = /(\w+)(\[\])*\.(\w+)+/;

// Matches:
// Error description
// {Error}
// {Error} Error description
const THROWS = /^(?:{(.*)}){0,1}\s*([\s\S]+)?$/;

function getType(type) {
  // JSDoc has 'Object', jsonschema uses 'object'
  if (type === 'Object') {
    return 'object';
  }

  return type;
}

function getTags(parsed, t) {
  return parsed
    .map(c => c.tags)
    .reduce((a, b) => a.concat(b), [])
    .filter(tag => tag.name === t)
    .map(p => p.value);
}

module.exports = function extract(comment) {
  const parsed = commentsParser(comment);
  const params = getTags(parsed, 'param');
  const throws = getTags(parsed, 'throws');

  return {
    description: parsed.map(c => c.lines).reduce((a, b) => a.concat(b), []).join(),
    params: params.map((param) => {
      const matches = param.match(PARAM);
      const type = getType(matches[1]);

      const output = { title: matches[2], description: matches[3] };

      // Is type an array?
      if (type.match(IS_TYPE_ARRAY)) {
        output.type = 'array';
        output.items = { type: getType(type.replace(IS_TYPE_ARRAY, '')) };
      } else {
        output.type = type;
      }

      return output;
    }).map((param, i, parsedParams) => {
      const matches = param.title.match(IS_NESTED_OBJECT_OR_ARRAY);
      if (!matches) return param;

      // Split out nested object properties e.g `user.name`
      const rootProperty = matches[1];
      const isArray = !!matches[2];
      const subProperty = matches[3];

      // Find the root object in the parsed params
      const objectRoot = parsedParams.find(p => p.title === rootProperty);
      let propertiesObject;

      // Array properties such as `favouriteFoods[].cuisine` need to be appended
      // onto the `items` property
      if (isArray) {
        objectRoot.items.properties = objectRoot.items.properties || {};
        propertiesObject = objectRoot.items.properties;
      } else {
        objectRoot.properties = objectRoot.properties || {};
        propertiesObject = objectRoot.properties;
      }

      // Append this property onto that root
      propertiesObject[subProperty] = { type: param.type, description: param.description };

      // Remove this result from the set
      return undefined;
    })
    // Strip out falsy values
    .filter(Boolean),
    throws: throws.map((error) => {
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
    }),
  };
};
